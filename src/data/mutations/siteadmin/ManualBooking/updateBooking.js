import {
    GraphQLInputObjectType as InputObjectType,
    GraphQLBoolean as BooleanType,
    GraphQLString as StringType,
    GraphQLFloat as FloatType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLList as List
} from 'graphql';

import { Booking } from '../../../models';

import { BookingCommonType } from '../../../types/siteadmin/BookingType';

import { updateBookingLocations } from '../../../../helpers/ManualBooking/bookingHelper';
import { updateScheduleBooking } from '../../../../helpers/ManualBooking/scheduleBookingHelper';

const updateBooking = {

    type: BookingCommonType,

    args: {
        bookingId: { type: new NonNull(IntType) },
        isSchedule: { type: new NonNull(BooleanType) },
        scheduleFrom: { type: IntType }, //Expressed in second
        bookingLocations: { //Don't include pick up location. As we don't update pick up at any point.
            type: new List(
                new InputObjectType({
                    name: 'UpdateBookingLocationsInputObjectType',
                    fields: {
                        id: { type: IntType },
                        location: { type: new NonNull(StringType) },
                        locationLat: { type: new NonNull(FloatType) },
                        locationLng: { type: new NonNull(FloatType) },
                        locationType: { type: new NonNull(StringType) },
                        locationDistance: { type: new NonNull(FloatType) },
                        locationDuration: { type: new NonNull(FloatType) },
                        locationStatus: { type: new NonNull(StringType) }
                    }
                })
            )
        }
    },

    async resolve({ request }, { isSchedule, bookingId, scheduleFrom, bookingLocations }) {
        try {
            if (!request.user || !request.user.admin) {
                return {
                    status: 500,
                    errorMessage: 'Please login with your account and continue.'
                };
            }

            let allowedStatus = ['created', 'approved', 'started'], isValid = true, response = {};

            // Booking Data
            const bookingData = await Booking.findOne({ where: { id: bookingId }, raw: true });

            if (!bookingData || (isSchedule && (bookingData.tripStatus !== 'scheduled' || !scheduleFrom))) isValid = false;
            else if (!isSchedule && (!allowedStatus.includes(bookingData.tripStatus) || !bookingLocations || bookingLocations.length === 0 ||
                bookingLocations.length > 3)) {
                isValid = false;
            }

            if (!isValid) {
                return {
                    status: 400,
                    errorMessage: 'Oops! It looks like something went wrong! Please try again.'
                };
            }

            if (isSchedule) response = await updateScheduleBooking({ scheduleFrom, riderId: bookingData.riderId, bookingId });
            else response = await updateBookingLocations({
                bookingLocations,
                bookingId,
                distanceType: bookingData.distanceType,
                currency: bookingData.currency,
                pricingId: bookingData.pricingId,
                bookingData
            });

            return response;
        }
        catch (error) {
            return {
                errorMessage: 'Something went wrong!' + error,
                status: 400
            };
        }
    }
};

export default updateBooking;

/**
mutation updateBooking($bookingId: Int!, $isSchedule: Boolean!, $scheduleFrom: Int, $bookingLocations: [UpdateBookingLocationsInputObjectType]) {
  updateBooking(bookingId: $bookingId, isSchedule: $isSchedule, scheduleFrom: $scheduleFrom, bookingLocations: $bookingLocations) {
    status
    errorMessage
  }
}
 */