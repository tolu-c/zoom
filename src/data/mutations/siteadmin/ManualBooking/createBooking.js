import {
    GraphQLInputObjectType as InputObjectType,
    GraphQLString as StringType,
    GraphQLFloat as FloatType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLList as List,
    GraphQLID as ID
} from 'graphql';
import moment from 'moment';

import {
    BookingLocations,
    BookingHistory,
    SiteSettings,
    Booking,
    User
} from '../../../models';

import { BookingCommonType } from '../../../types/siteadmin/BookingType';

import { sendSocketNotification } from '../../../../core/socketNotifications/sendSocketNotification';
import { sendNotificationFromMobileServer } from '../../../../core/pushNotifications/sendNotificationFromMobileServer';

import {
    createOrGetRider,
    checkRiderActiveBooking,
    getPricing,
    getDriverData,
    isRiderExistsHelper,
    checkIfAdminEmail,
    checkIfUserEmail,
    isDriverActive
} from '../../../../helpers/ManualBooking/bookingHelper';
import { getNearByDriver } from '../../../../helpers/ManualBooking/getNearByDriver';
import calculateTripCalculation from '../../../../helpers/ManualBooking/getTripCalculation';
import { getCurrencyDetails } from '../../../../helpers/currencyHelper';
import { checkScheduleBookingDuration, createScheduleBookingAndHistory } from '../../../../helpers/ManualBooking/scheduleBookingHelper';
import { sendMessage } from '../../../../core/smsNotification/sendSmsNotification';

const createBooking = {
    type: BookingCommonType,

    args: {
        riderId: { type: ID },
        driverId: { type: ID },
        categoryId: { type: new NonNull(IntType) },
        totalDistance: { type: new NonNull(FloatType) },
        totalDuration: { type: new NonNull(FloatType) },
        firstName: { type: new NonNull(StringType) },
        lastName: { type: new NonNull(StringType) },
        email: { type: new NonNull(StringType) },
        phoneDialCode: { type: new NonNull(StringType) },
        phoneNumber: { type: new NonNull(StringType) },
        phoneCountryCode: { type: new NonNull(StringType) },
        currency: { type: new NonNull(StringType) },
        distanceType: { type: new NonNull(StringType) },
        bookingLocations: {
            type: new NonNull(
                new List(
                    new InputObjectType({
                        name: 'BookingLocationsInputObjectType',
                        fields: {
                            location: { type: new NonNull(StringType) },
                            locationLat: { type: new NonNull(FloatType) },
                            locationLng: { type: new NonNull(FloatType) },
                            locationStatus: { type: new NonNull(StringType) },
                            locationDistanceType: { type: new NonNull(StringType) },
                            locationType: { type: new NonNull(StringType) },
                            locationDistance: { type: new NonNull(FloatType) },
                            locationDuration: { type: new NonNull(FloatType) }
                        }
                    })
                )
            )
        },
        bookingType: { type: new NonNull(IntType) },
        scheduleFrom: { type: IntType }
    },

    async resolve(
        { request },
        {
            riderId,
            driverId,
            categoryId,
            totalDistance,
            totalDuration,
            bookingLocations,
            email,
            firstName,
            lastName,
            phoneNumber,
            phoneDialCode,
            phoneCountryCode,
            currency,
            distanceType,
            bookingType,
            scheduleFrom
        }) {
        try {
            if (!request.user || !request.user.admin || !request.user.id) {
                return {
                    status: 500,
                    errorMessage: 'Please login with your account and continue.'
                };
            }

            let bookingDate = new Date();

            let driverDetails = {}, tripStatus = 'created', secondDifference = 600, allowedWaitingTime, scheduleTo;

            if (bookingType === 2) { //Schedule booking
                driverId = null;
                tripStatus = 'scheduled';
                bookingDate = moment.unix(scheduleFrom).set({ s: 0 }).format('YYYY-MM-DD HH:mm:ss');
                scheduleTo = moment.unix(scheduleFrom + secondDifference).format('YYYY-MM-DD HH:mm:ss');

                if (!bookingDate || !scheduleFrom) return { status: 400, errorMessage: 'Invalid schedule date' };

                const isValid = checkScheduleBookingDuration(bookingDate);
                if (isValid.status !== 200) return isValid;
            }

            //0th index value of bookingLocations array is considered as pickup and last index value of bookingLocations array is considered as drop. 
            //Between start and end values of bookingLocations array are considered as stops.
            if (!bookingLocations || bookingLocations.length < 2) {
                return {
                    status: 400,
                    errorMessage: 'Invalid location'
                };
            }

            const isDriverActiveResult = await isDriverActive({
                phoneNumber,
                phoneDialCode,
                userAttributes: ['id', 'email', 'userType', 'phoneNumber', 'phoneDialCode', 'isBan', 'isActive'],
            });

            if (isDriverActiveResult) {
                return {
                    status: 400,
                    errorMessage: 'Oops! It seems the user is active as a Driver to take trips from the users. Please inform them to go OFFLINE from their driver account to book a ride for them here.'
                };
            }

            if (!riderId) {
                const isExists = await isRiderExistsHelper({
                    phoneNumber,
                    phoneDialCode,
                    userAttributes: ['id'],
                    profileAttributes: []
                });
                riderId = isExists && isExists.id;
            }

            if (riderId) {
                const havingActiveBooking = await checkRiderActiveBooking({ riderId, bookingDate });
                if (havingActiveBooking && havingActiveBooking.status !== 200) return havingActiveBooking;
            }
            else {
                const isEmailRegistered = await checkIfUserEmail(email);
                if (isEmailRegistered) {
                    return {
                        status: 400,
                        errorMessage: 'This email already registered'
                    };
                }

                const isAdmin = await checkIfAdminEmail(email);
                if (isAdmin) {
                    return {
                        status: 400,
                        errorMessage: 'This email already registered by admin'
                    };
                }
            }

            const riderDetails = await createOrGetRider({
                riderId,
                email,
                firstName,
                lastName,
                phoneNumber,
                phoneDialCode,
                phoneCountryCode,
                adminId: request.user.id,
                userAttributes: ['id', 'phoneNumber', 'phoneDialCode', 'overallRating']
            });

            riderId = riderDetails && riderDetails.id;

            if (!riderId) {
                return {
                    status: 400,
                    errorMessage: 'Oops! something went wrong! Please try again.'
                };
            }

            const pricing = await getPricing({
                pickUpLat: bookingLocations[0].locationLat,
                pickUpLng: bookingLocations[0].locationLng,
                categoryId,
                limit: 1,
                offset: 0
            });

            let pricingData = pricing && pricing.length > 0 && pricing[0];
            if (!pricingData) {
                return {
                    status: 400,
                    errorMessage: "Sorry, our service unavailable in your location."
                };
            }

            if (bookingType === 1) {
                let nearByDrivers = await getNearByDriver({
                    attributes: ' User.id as user_id',
                    riderId,
                    pickUpLat: bookingLocations[0].locationLat,
                    pickUpLng: bookingLocations[0].locationLng,
                    categoryId
                });

                if (!nearByDrivers || nearByDrivers.length <= 0 || (driverId && !nearByDrivers.some(driver => driver.user_id === driverId))) {
                    let errorMessage = "Sorry, driver is not available. Please try again."
                    if (!driverId) errorMessage = "Sorry, no drivers available. Please try again."
                    return {
                        status: 400,
                        errorMessage
                    };
                }

                driverDetails = await getDriverData({
                    userId: driverId || nearByDrivers[0].user_id,
                    userAttributes: ['id'],
                    vehicleAttributes: ['id', 'userId', 'vehicleNumber'],
                    profileAttributes: ['preferredLanguage']
                });

                driverId = driverDetails && driverDetails.id;
                if (!driverId) {
                    return {
                        status: 400,
                        errorMessage: "Sorry, driver profile not found"
                    };
                }

                allowedWaitingTime = await SiteSettings.findOne({
                    attributes: ['value'],
                    where: { name: 'multipleStopsWaitingTime' }
                });
            }


            const { baseCurrency, rates } = await getCurrencyDetails();
            if (!baseCurrency || !rates) {
                return {
                    status: 400,
                    errorMessage: "Oops! something went wrong! Please try again."
                };
            }

            const calculatedPrice = calculateTripCalculation({
                pricingData,
                distance: totalDistance,
                duration: totalDuration,
                convertCurrency: currency,
                base: baseCurrency,
                rates: rates
            });

            const booking = await Booking.create({
                riderLocation: bookingLocations[0].location,
                riderLocationLat: bookingLocations[0].locationLat,
                riderLocationLng: bookingLocations[0].locationLng,
                pickUpLocation: bookingLocations[0].location,
                pickUpLat: bookingLocations[0].locationLat,
                pickUpLng: bookingLocations[0].locationLng,
                dropOffLocation: bookingLocations[bookingLocations.length - 1].location,
                dropOffLat: bookingLocations[bookingLocations.length - 1].locationLat,
                dropOffLng: bookingLocations[bookingLocations.length - 1].locationLng,
                riderId,
                driverId,
                tripStatus,
                vehicleType: categoryId,
                totalRideDistance: totalDistance,
                baseFare: calculatedPrice.basePrice,
                baseUnit: calculatedPrice.unitPrice,
                baseMinute: calculatedPrice.minutePrice,
                riderServiceFee: calculatedPrice.riderServiceFee,
                driverServiceFee: calculatedPrice.driverServiceFee,
                estimatedTotalFare: calculatedPrice.totalFare,
                totalFare: calculatedPrice.totalFare,
                totalDuration,
                paymentType: 1,
                paymentStatus: 'pending',
                startDate: bookingDate,
                startTime: bookingDate,
                endDate: bookingDate,
                endTime: bookingDate,
                tripStart: bookingDate,
                tripEnd: bookingDate,
                currency,
                riderTotalFare: calculatedPrice.totalFareForRider,
                driverTotalFare: calculatedPrice.totalFareForDriver,
                vehicleId: driverDetails['vehicles.id'],
                vehicleNumber: driverDetails['vehicles.vehicleNumber'],
                isSpecialTrip: calculatedPrice.isSpecialTrip,
                specialTripPrice: calculatedPrice.specialTripPrice,
                specialTripTotalFare: calculatedPrice.specialTripTotalFare,
                pricingId: calculatedPrice.id,
                riderPayableFare: calculatedPrice.riderPayableFare,
                bookingType,
                isMultipleStops: bookingLocations.length > 2 ? 1 : 0,
                multipleStopsCount: bookingLocations.length > 0 ? bookingLocations.length - 2 : 0,
                distanceType,
                allowedWaitingTime: allowedWaitingTime && allowedWaitingTime.value,
                adminId: request.user.id
            });

            if (!booking || !booking.id) {
                return {
                    status: 400,
                    errorMessage: "Oops! something went wrong! Please try again."
                };
            }


            let bookingLocationsData = bookingLocations.map((item) => ({
                bookingId: booking.id,
                locationUpdatedAt: new Date(),
                ...item
            }));

            await BookingLocations.bulkCreate(bookingLocationsData);

            bookingLocations = await BookingLocations.findAll({
                where: {
                    bookingId: booking.id,
                    deletedAt: null
                },
                order: [['id', 'ASC']],
            });

            if (bookingType === 2) {
                await createScheduleBookingAndHistory({ bookingId: booking.id, riderId, scheduleFrom: bookingDate, scheduleTo });
                let messageResponse = sendMessage({ id: riderId, type: 'scheduleBookingCreatedByAdmin', otherDetails: { name: riderDetails.profile && riderDetails.profile.firstName }, lang: riderDetails.profile && riderDetails.profile.preferredLanguage });
            }
            else {
                await BookingHistory.create({
                    bookingId: booking.id,
                    riderId,
                    driverId,
                    status: 0
                });
                // Disable the chosen driver availability for another trip
                await User.update(
                    { activeStatus: 'inactive' },
                    { where: { id: driverId } }
                );

                sendSocketNotification(`tripRequest-${driverId}`, {
                    ...booking.get({ plain: true }),
                    userId: riderId,
                    name: riderDetails.profile && riderDetails.profile.firstName,
                    phoneNumber: riderDetails['phoneDialCode'] + '' + riderDetails['phoneNumber'],
                    overallRating: riderDetails['overallRating'],
                    bookingId: booking.id,
                    bookingLocations,
                    rideDetails: bookingLocationsData
                })
                let response = sendNotificationFromMobileServer('tripRequest', {}, driverId, driverDetails['profile.preferredLanguage']);
                let messageResponse = sendMessage({ id: riderId, type: 'bookingCreatedByAdmin', otherDetails: { name: riderDetails.profile && riderDetails.profile.firstName }, lang: riderDetails.profile && riderDetails.profile.preferredLanguage });
            }

            return {
                status: 200,
                result: { id: booking.id }
            };
        }
        catch (error) {
            return {
                status: 400,
                errorMessage: "Something went wrong " + error
            };
        }
    }
}

export default createBooking;

/**
mutation createBooking($riderId:ID,$driverId:ID,$categoryId:Int!,$totalDistance:Float!,$totalDuration:Float!,$firstName:String!,$lastName:String!,$email:String!,$phoneDialCode:String!,$phoneNumber:String!,$phoneCountryCode:String!,$currency:String!,$distanceType:String!,$bookingLocations:[BookingLocationsInputObjectType]!, $bookingType: Int!, $scheduleFrom: Int) {
  createBooking(riderId:$riderId,driverId:$driverId,categoryId:$categoryId,totalDistance:$totalDistance,totalDuration:$totalDuration,firstName:$firstName,lastName:$lastName,email:$email,phoneDialCode:$phoneDialCode,phoneNumber:$phoneNumber,phoneCountryCode:$phoneCountryCode,currency:$currency,distanceType:$distanceType,bookingLocations:$bookingLocations, bookingType: $bookingType, scheduleFrom: $scheduleFrom) {
    status
    errorMessage
    result {
        id
    }
  }
}
 */