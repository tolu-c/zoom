import {
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType
} from 'graphql';

import { Booking } from '../../../models';

import { BookingCommonType } from '../../../types/siteadmin/BookingType';

import { updateOnScheduleCancel } from '../../../../helpers/ManualBooking/scheduleBookingHelper';
import { updateOnBookingCancel } from '../../../../helpers/ManualBooking/bookingHelper';

const cancelBooking = {

    type: BookingCommonType,

    args: {
        bookingId: { type: new NonNull(IntType) },
        requestBy: { type: new NonNull(StringType) },
        reason: { type: StringType }
    },

    async resolve({ request }, { bookingId, requestBy, reason }) {
        try {
            let allowedStatus = ['approved', 'scheduled', 'created'],
                statusFilter = { tripStatus: { in: ['approved', 'created'] } },
                isSchedule = false,
                cancelledByAdminId = request.user && request.user.admin && request.user.id;

            if (!cancelledByAdminId) {
                return {
                    status: 500,
                    errorMessage: 'Please login with your account and continue.'
                };
            }

            requestBy = 'cancelledByRider'; //Admin can cancel instant booking, if rider request

            // Booking Data
            const bookingData = await Booking.findOne({
                attributes: ['id', 'tripStatus', 'driverId', 'riderId', 'isSpecialTrip', 'bookingType'],
                where: {
                    id: bookingId
                },
                raw: true
            });

            if (!bookingData || !allowedStatus.includes(bookingData.tripStatus)) {
                let errorMessage = 'Oops! It looks like something went wrong! Please try again.';
                if (bookingData) errorMessage = `Oops! It looks like the trip is already ${bookingData.tripStatus.startsWith('cancelled') ? 'cancelled' : bookingData.tripStatus}`;
                return {
                    status: 400,
                    errorMessage
                };
            }

            if (bookingData.bookingType === 2 && bookingData.tripStatus === 'scheduled') {
                requestBy = 'cancelledByRider' //Always upon rider request, schedule booking can be cancelled
                statusFilter = { tripStatus: 'scheduled' };
                isSchedule = true;
            }

            const isUpdated = await Booking.update(
                {
                    cancelledByAdminId,
                    tripStatus: requestBy,
                    isTripCancelledByAdmin: true,
                    isSpecialTrip: (requestBy === 'cancelledByDriver' ? false : bookingData.isSpecialTrip)
                },
                {
                    where: {
                        and: [
                            { id: bookingId },
                            statusFilter
                        ]
                    }
                }
            );

            if (!isUpdated || isUpdated.includes(0)) {
                return {
                    status: 500,
                    errorMessage: "Oops! something went wrong. Please try again."
                };
            }

            if (isSchedule) await updateOnScheduleCancel({ bookingData, cancelledByAdminId });
            else await updateOnBookingCancel({ bookingData, requestBy, reason, cancelledByAdminId });

            return { status: 200 };
        }
        catch (error) {
            return {
                status: 400,
                errorMessage: 'Oops! Something went wrong ' + error
            };
        }
    }
};

export default cancelBooking;

/*
mutation ($bookingId: Int!, $requestBy: String!, $reason: String) {
  cancelBooking(bookingId: $bookingId, requestBy: $requestBy, reason: $reason) {
    status
    errorMessage
  }
}
*/