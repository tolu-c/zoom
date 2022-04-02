import {
    GraphQLString as StringType,
    GraphQLFloat as FloatType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType
} from 'graphql';

import { Category } from '../../../models';

import { CategoryCommonType } from '../../../types/siteadmin/CategoryType';

import calculateTripCalculation from '../../../../helpers/ManualBooking/getTripCalculation';
import { getDetailsFromGoogleMap } from '../../../../helpers/ManualBooking/googleMapAPI';
import { getNearByDriver } from '../../../../helpers/ManualBooking/getNearByDriver';
import { getCurrencyDetails } from '../../../../helpers/currencyHelper';
import { checkIfUserEmail, getPricing, checkIfAdminEmail } from '../../../../helpers/ManualBooking/bookingHelper';

const getTripDetails = {
    type: CategoryCommonType,

    args: {
        riderId: { type: StringType },
        email: { type: StringType },
        distanceType: { type: new NonNull(StringType) },
        totalDistance: { type: new NonNull(FloatType) },
        totalDuration: { type: new NonNull(FloatType) },
        currency: { type: new NonNull(StringType) },
        pickUpLat: { type: new NonNull(FloatType) },
        pickUpLng: { type: new NonNull(FloatType) },
        bookingType: { type: new NonNull(IntType) }
    },

    async resolve({ request }, { email, pickUpLat, pickUpLng, riderId, currency, totalDistance, totalDuration, distanceType, bookingType }) {
        try {
            let driverLocations = '', results = [];

            if (!request.user || !request.user.admin) {
                return {
                    status: 500,
                    errorMessage: 'Please login with your account and continue.'
                };
            }

            if (!riderId && email) {
                let isEmailRegistered = await checkIfUserEmail(email);
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

            let categories = await Category.findAll({
                where: { isActive: true },
                order: [['id', 'ASC']],
                raw: true
            });

            if (!categories || categories.length <= 0) {
                return {
                    status: 400,
                    errorMessage: 'Sorry, our service unavailable in your location at the moment.'
                };
            }

            const pricing = await getPricing({ pickUpLat, pickUpLng });

            if (!pricing || pricing.length <= 0) {
                return {
                    status: 400,
                    errorMessage: "Sorry, our service unavailable in your location."
                };
            }

            // Remove duplicate categories
            let permittedPricing = pricing.filter((o, index) => pricing.findIndex((x) => x.categoryId === o.categoryId) >= index);

            let nearByDrivers = await getNearByDriver({
                attributes: 'User.id AS id,email,phoneNumber,phoneDialCode,phoneCountryCode,overallRating,vehicleType,lat,lng',
                riderId,
                pickUpLat,
                pickUpLng,
                categoryId: permittedPricing.map(item => item.categoryId)
            });

            const { baseCurrency, rates } = await getCurrencyDetails();
            if (!baseCurrency || !rates) {
                return {
                    status: 400,
                    errorMessage: "Oops! something went wrong! Please try again."
                };
            }

            if (bookingType === 1) {
                if (!nearByDrivers || nearByDrivers.length <= 0) {
                    return {
                        status: 400,
                        errorMessage: "Sorry, no drivers available. Please try again."
                    };
                }

                //Get duration and distance between driver and pick up location - start
                if (nearByDrivers.length === 1) driverLocations = `${nearByDrivers[0].lat},${nearByDrivers[0].lng}`;
                else driverLocations = nearByDrivers.reduce((accumulator, currentValue, index) => {
                    let previousData = index === 1 ? `${accumulator.lat},${accumulator.lng}` : accumulator;
                    return `${previousData}|${currentValue.lat},${currentValue.lng}`
                });

                let data = await getDetailsFromGoogleMap({
                    origins: `${pickUpLat},${pickUpLng}`,
                    destinations: driverLocations,
                    distanceType
                });
                if (data && data.rows && data.rows.length > 0) {
                    nearByDrivers.map((driver, index) => {
                        let element = data.rows[0] && data.rows[0].elements && data.rows[0].elements[index] || {};
                        driver['durationToReachRider'] = element.duration && element.duration.text;
                        driver['distanceFromRider'] = element.distance && element.distance.value;
                    });
                }
                //Get duration and distance between driver and pick up location - end
            }

            categories.map((item) => {
                //Price calculation
                let pricingData = permittedPricing.find(price => price.categoryId === item.id), calculatedPrice;
                if (pricingData) calculatedPrice = calculateTripCalculation({
                    pricingData,
                    distance: totalDistance,
                    duration: totalDuration,
                    convertCurrency: currency,
                    base: baseCurrency,
                    rates: rates
                });
                item['priceDetails'] = calculatedPrice;

                //Near by Drivers
                item['nearByDrivers'] = nearByDrivers && nearByDrivers.filter(driver => driver.vehicleType === item.id) || [];

                if (calculatedPrice) results.push(item);
            });

            if (results.length === 0) {
                return {
                    status: 400,
                    errorMessage: 'Sorry, our service unavailable in your location at the moment.'
                };
            }

            return {
                status: 200,
                results
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

export default getTripDetails;

/**
query getTripDetails($email: String, $riderId: String, $bookingType: Int!, $distanceType: String!, $totalDuration: Float!, $totalDistance: Float!, $currency: String!, $pickUpLat: Float!, $pickUpLng: Float!) {
  getTripDetails(email:$email, riderId: $riderId, bookingType: $bookingType, distanceType: $distanceType, totalDuration: $totalDuration, totalDistance: $totalDistance, currency: $currency, pickUpLat: $pickUpLat, pickUpLng: $pickUpLng) {
    status
    errorMessage
    results {
      id
      categoryName
      capacity
      categoryImage
      categoryMarkerImage
      priceDetails {
        id
        categoryId
        unitPrice
        minutePrice
        basePrice
        riderFeeType
        riderFeeValue
        driverFeeType
        driverFeeValue
        riderServiceFee
        driverServiceFee
        priceForDistance
        priceForDuration
        totalFare
        calculatedPrice
        totalFareForRider
        totalFareForDriver
        convertCurrency
        isSpecialTrip
        specialTripPrice
        specialTripTotalFare
        riderPayableFare
      }
      nearByDrivers {
        id
        email
        phoneNumber
        phoneDialCode
        phoneCountryCode
        lat
        lng
        userStatus
        isActive
        isBan
        userType
        createdAt
        activeStatus
        overallRating
        deletedAt
        durationToReachRider
        distanceFromRider
        profile {
          profileId
          picture
          firstName
          lastName
        }
      }
    }
  }
}
 */