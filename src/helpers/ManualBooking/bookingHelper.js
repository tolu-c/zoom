import moment from 'moment';
import sequelize from '../../data/sequelize';

import {
    User,
    Location,
    Booking,
    Pricing,
    EmailToken,
    UserProfile,
    UserVerifiedInfo,
    ScheduleBooking,
    Vehicles,
    AdminUser,
    BookingHistory,
    BookingCancelReason,
    BookingLocations
} from '../../data/models';

import { generateRandomString } from '../commonHelper';

import { sendSocketNotification } from '../../core/socketNotifications/sendSocketNotification';
import { sendNotificationFromMobileServer } from '../../core/pushNotifications/sendNotificationFromMobileServer';

import calculateTripCalculation from './getTripCalculation';
import { getCurrencyDetails } from '../currencyHelper';

export async function getPricing({ pickUpLat, pickUpLng, categoryId, limit, offset }) {

    let categoryFilter = {},
        activeFilter = { isActive: true },
        pickupSurrounding = sequelize.fn('ST_CONTAINS',
            sequelize.col(`geometryCoordinates`),
            sequelize.fn('GeomFromText', `POINT(${pickUpLat} ${pickUpLng})`)
        );

    let permittedLocations = await Location.findAll({
        attributes: [['id', 'locationId']],
        where: {
            ...activeFilter,
            and: sequelize.where(pickupSurrounding, 1)
        },
        raw: true
    });

    if (!permittedLocations || permittedLocations.length <= 0) return [];

    if (categoryId) categoryFilter = { categoryId };

    return await Pricing.findAll({
        where: {
            and: [
                activeFilter,
                categoryFilter
            ],
            or: permittedLocations
        },
        order: [['updatedAt', 'DESC']],
        limit,
        offset,
        raw: true
    });
}

export async function getUserData({ userId, userType, profileAttributes, userAttributes }) {
    let userData = await User.findOne({
        attributes: userAttributes,
        where: {
            deletedAt: null,
            id: userId,
            // userType,
            isBan: false
        },
        include: [{
            attributes: profileAttributes,
            model: UserProfile,
            as: 'profile'
        }],
    });
    return userData && userData.get({ plain: true });
}

export async function createOrGetRider({
    riderId,
    email,
    firstName,
    lastName,
    phoneNumber,
    phoneDialCode,
    phoneCountryCode,
    adminId,
    userAttributes
}) {
    let password = generateRandomString();

    if (riderId) return await getUserData({ userId: riderId, userType: 1, userAttributes });
    else {
        let userData = await User.create({
            email,
            password: User.prototype.generateHash(password),
            phoneNumber,
            phoneDialCode,
            phoneCountryCode,
            userType: 1,
            userStatus: 'active',
            adminId,
            profile: {
                firstName,
                lastName,
                country: phoneCountryCode
            },
            userVerifiedInfo: {
                isEmailConfirmed: false
            },
            emailToken: {
                email,
                token: Date.now()
            }
        }, {
            include: [
                { model: UserProfile, as: 'profile' },
                { model: UserVerifiedInfo, as: 'userVerifiedInfo' },
                { model: EmailToken, as: 'emailToken' }
            ]
        });
        return userData && { ...userData.get({ plain: true }), password: '' };
    }
}

export async function checkRiderActiveBooking({ riderId, bookingDate, existingScheduleId }) {
    let preRequestedDate, postRequestedDate, exitingScheduleIdFilter = {};

    const requestedDate = bookingDate && moment(bookingDate) || moment(new Date());
    preRequestedDate = moment(requestedDate.format('YYYY-MM-DD HH:mm')).subtract(30, 'minutes').format('YYYY-MM-DD HH:mm');
    postRequestedDate = moment(requestedDate.format('YYYY-MM-DD HH:mm')).add(30, 'minutes').format('YYYY-MM-DD HH:mm');

    const getActiveBooking = await Booking.findOne({
        attributes: ['id'],
        where: {
            riderId,
            bookingType: 1,
            tripStatus: {
                in: ['created', 'approved', 'started']
            }
        },
        raw: true
    });

    if (getActiveBooking) {
        return {
            status: 400,
            errorMessage: 'Oops! It looks like rider having active booking. Please cancel the ride and try again.'
        };
    }

    if (existingScheduleId && existingScheduleId.toString().trim() !== '') {
        exitingScheduleIdFilter = {
            id: {
                ne: existingScheduleId
            }
        }
    };

    const getActiveScheduleBooking = await ScheduleBooking.findOne({
        attributes: ['id'],
        where: {
            and: [
                {
                    riderId,
                    tripStatus: 'scheduled',
                    scheduleFrom: {
                        between: [new Date(preRequestedDate), new Date(postRequestedDate)]
                    }
                },
                exitingScheduleIdFilter
            ]
        },
        raw: true
    });

    if (getActiveScheduleBooking) {
        return {
            status: 400,
            errorMessage: 'Oops! It looks like rider have scheduled a ride in 30 minutes. Please cancel the existing ride and try again.'
        };
    }

    return { status: 200 };
}

export async function getDriverData({ userId, userAttributes, profileAttributes, vehicleAttributes }) {
    if (!userId) return null;
    return await User.findOne({
        attributes: userAttributes,
        where: {
            deletedAt: null,
            id: userId,
            userType: 2,
            userStatus: 'active'
        },
        include: [
            {
                attributes: profileAttributes,
                model: UserProfile,
                as: 'profile',
                required: true
            },
            {
                attributes: vehicleAttributes,
                model: Vehicles,
                as: 'vehicles',
                required: true
            }
        ],
        raw: true
    })
}

export async function isRiderExistsHelper({ phoneNumber, phoneDialCode, userAttributes, profileAttributes }) {
    return await User.findOne({
        attributes: userAttributes,
        where: {
            phoneNumber,
            phoneDialCode,
            deletedAt: null
        },
        include: [{
            attributes: profileAttributes,
            model: UserProfile,
            as: 'profile'
        }]
    });
}

export async function isDriverActive({ phoneNumber, phoneDialCode, userAttributes }) {
    return await User.findOne({
        attributes: userAttributes,
        where: {
            phoneNumber,
            phoneDialCode,
            deletedAt: null,
            userType: 2,
            isActive: true
        }
    });
}

export async function checkIfAdminEmail(email) {
    const isAdmin = await AdminUser.findOne({
        attributes: ['id'],
        where: { email }
    });
    return isAdmin && isAdmin.id;
}

export async function updateOnBookingCancel({ bookingData, requestBy, cancelledByAdminId, reason }) {
    let userId = (requestBy === 'cancelledByDriver') ? bookingData.riderId : bookingData.driverId;

    await User.update({ activeStatus: 'active' }, { where: { id: bookingData.driverId } });

    await BookingHistory.update(
        {
            status: (requestBy === 'cancelledByDriver' ? 2 : 4),
            cancelledByAdminId
        },
        {
            where: {
                bookingId: bookingData.id,
                driverId: bookingData.driverId
            }
        }
    );

    const userData = await UserProfile.findOne({
        attributes: ['preferredLanguage', 'userId'],
        where: { userId },
        raw: true
    });

    let pushNotificationContent = { // To Driver for cancelledByRider & To Rider for cancelledByDriver
        tripStatus: requestBy,
        bookingId: bookingData.id
    };

    sendSocketNotification(`riderCancel-${bookingData.riderId}`, {
        status: 200,
        data: {
            id: userId,
            bookingId: bookingData.id
        }
    });

    if (bookingData && bookingData.tripStatus === 'created') {
        sendSocketNotification(`cancelTripRequest-${bookingData.driverId}`, {
            status: 200,
            data: {
                id: userId,
                bookingId: bookingData.id
            }
        });
    }
    else {
        sendSocketNotification(`riderCancel-${bookingData.driverId}`, {
            status: 200,
            data: {
                "id": userId,
                userId,
                "driverId": bookingData.driverId,
                "bookingId": bookingData.id,
                "tripStatus": "cancelledByRider"
            }
        });
    }

    let response = sendNotificationFromMobileServer(requestBy, pushNotificationContent, userId, userData && userData.preferredLanguage);

    if (reason) {
        await BookingCancelReason.create({
            bookingId: bookingData.id,
            riderId: bookingData.riderId,
            driverId: bookingData.driverId,
            reason,
            cancelStatus: requestBy
        });
    }
}

export async function updateBookingLocations({ bookingLocations, bookingId, distanceType, currency, pricingId, bookingData }) {
    let bookingLocationsData = [], existingData = [];

    const { baseCurrency, rates } = await getCurrencyDetails();
    const pricingData = await Pricing.findOne({
        where: {
            isActive: true,
            id: pricingId
        },
        order: [['updatedAt', 'DESC']],
        raw: true
    });

    if (!baseCurrency || !rates || !pricingData || !pricingData.id) {
        return {
            status: 400,
            errorMessage: "Oops! something went wrong! Please try again."
        };
    }

    let completedLocationCount = await BookingLocations.count({
        where: {
            locationType: { ne: 'pickup' },
            bookingId,
            locationStatus: 'completed',
            deletedAt: null
        }
    });

    //If the socket event is not listened, this one helps to avoid removing/updating the completed one.
    let completedLocations = bookingLocations.filter((item, index) => item.locationStatus === 'completed');

    if ((completedLocations.length !== completedLocationCount)) {
        return {
            status: 400,
            errorMessage: "Oops! something went wrong! Please try again."
        };
    }

    bookingLocations = bookingLocations.filter((item, index) => item.locationStatus === 'pending');

    await Promise.all([
        bookingLocations.map(async (item, index) => {
            if (item.id) {
                existingData.push(item.id);
                const previousLocation = await BookingLocations.findOne(
                    {
                        attributes: ['id', 'location', 'locationLat', 'locationLng'],
                        where: { id: item.id },
                        raw: true
                    }
                );
                await BookingLocations.update(
                    {
                        location: item.location,
                        locationLat: item.locationLat,
                        locationLng: item.locationLng,
                        locationDistance: item.locationDistance,
                        locationDistanceType: distanceType,
                        locationDuration: item.locationDuration,
                        locationUpdatedAt: new Date(),
                        previousLocation: previousLocation && `location: ${previousLocation.location}, lat: ${previousLocation.locationLat}, lng: ${previousLocation.locationLng}`,
                        locationType: item.locationType
                    },
                    { where: { id: item.id } }
                );
            }
            else {
                bookingLocationsData.push({
                    bookingId,
                    location: item.location,
                    locationLat: item.locationLat,
                    locationLng: item.locationLng,
                    locationStatus: 'pending',
                    locationDistance: item.locationDistance,
                    locationDistanceType: distanceType,
                    locationDuration: item.locationDuration,
                    locationUpdatedAt: new Date(),
                    locationType: item.locationType
                });
            }
        })
    ]);

    await BookingLocations.update(
        { deletedAt: new Date() },
        {
            where: {
                locationType: { ne: 'pickup' },
                bookingId,
                id: { notIn: [...existingData] },
                locationStatus: { ne: 'completed' }
            }
        }
    );

    if (bookingLocationsData.length > 0) await BookingLocations.bulkCreate(bookingLocationsData);

    const locationsAdded = await BookingLocations.findAll({
        attributes: [
            'bookingId',
            [sequelize.fn('sum', sequelize.col('locationDistance')), 'totalDistance'],
            [sequelize.fn('sum', sequelize.col('locationDuration')), 'totalDuration']
        ],
        where: {
            bookingId,
            deletedAt: null
        },
        group: ['BookingLocations.bookingId'],
        raw: true
    });

    let totalRideDistance = locationsAdded && locationsAdded[0] && locationsAdded[0].totalDistance,
        totalDuration = locationsAdded && locationsAdded[0] && locationsAdded[0].totalDuration;
    if (!totalRideDistance || !totalDuration) {
        return {
            status: 400,
            errorMessage: "Oops! something went wrong. Please try again."
        };
    }

    const calculatedPrice = calculateTripCalculation({
        pricingData,
        distance: totalRideDistance,
        duration: totalDuration,
        convertCurrency: currency,
        base: baseCurrency,
        rates
    });

    let userDetails = await UserProfile.findAll({
        attributes: ['userId', 'lastName', 'firstName', 'picture', 'preferredLanguage'],
        where: { userId: { in: [bookingData.riderId, bookingData.driverId] } },
        include: [{
            attributes: ['lat', 'lng', 'phoneNumber'],
            model: User,
            as: 'user',
            required: true
        }]
    });

    let riderDetails = userDetails && userDetails.find(item => item && item.userId === bookingData.riderId),
        driverDetails = userDetails && userDetails.find(item => item && item.userId === bookingData.driverId);

    riderDetails = riderDetails && riderDetails.get({ plain: true }) || {};
    driverDetails = driverDetails && driverDetails.get({ plain: true }) || {};

    let newBookingLocations = await BookingLocations.findAll({
        where: {
            bookingId,
            deletedAt: null
        },
        order: [['id', 'ASC']]
    });

    newBookingLocations = newBookingLocations.map((item, index) => { //For mobile client
        let fieldType = 'disabled'
        if (index > 0) {
            if (newBookingLocations[index - 1].locationStatus === 'pending' && item.locationStatus === 'pending') fieldType = 'deletable';
            else if (newBookingLocations[index - 1].locationStatus === 'completed' && item.locationStatus === 'pending') fieldType = 'editable';
        }
        return { ...item.get({ plain: true }), fieldType };
    });

    let pushNotificationContent = { name: riderDetails && ((riderDetails.firstName || '') + ' ' + (riderDetails.lastName || '')) };

    let response = sendNotificationFromMobileServer('updateStop', pushNotificationContent, bookingData.driverId, (driverDetails && driverDetails.preferredLanguage));

    await Booking.update(
        {
            dropOffLocation: bookingLocations[bookingLocations.length - 1].location,
            dropOffLat: bookingLocations[bookingLocations.length - 1].locationLat,
            dropOffLng: bookingLocations[bookingLocations.length - 1].locationLng,
            isMultipleStops: bookingLocations.length > 1 ? 1 : 0, // Pick up location excluded
            multipleStopsCount: bookingLocations.length - 1, // Pick up location excluded
            totalRideDistance,
            totalDuration,
            baseFare: calculatedPrice.basePrice, // Min base fare
            baseUnit: calculatedPrice.unitPrice, // Price per unit
            baseMinute: calculatedPrice.minutePrice,
            riderServiceFee: calculatedPrice.riderServiceFee,
            driverServiceFee: calculatedPrice.driverServiceFee,
            totalFare: calculatedPrice.totalFare, // with rider service fee
            riderTotalFare: calculatedPrice.totalFareForRider,
            driverTotalFare: calculatedPrice.totalFareForDriver,
            isSpecialTrip: calculatedPrice.isSpecialTrip,
            specialTripPrice: calculatedPrice.specialTripPrice,
            specialTripTotalFare: calculatedPrice.specialTripTotalFare,
            riderPayableFare: calculatedPrice.riderPayableFare
        },
        { where: { id: bookingId } }
    );

    sendSocketNotification(`tripStatus-${bookingData.driverId}`, {
        ...bookingData,
        driverDetails,
        riderDetails,
        bookingLocations: newBookingLocations
    });

    sendSocketNotification(`tripStatus-${bookingData.riderId}`, {
        ...bookingData,
        driverDetails,
        riderDetails,
        bookingLocations: newBookingLocations
    });

    return { status: 200 };
}

export async function checkIfUserEmail(email) {
    const havingEmail = await User.findOne({
        attributes: ['id'],
        where: {
            email,
            deletedAt: null
        }
    });
    return havingEmail && havingEmail.id;
}