import gql from 'graphql-tag';
import { toastr } from 'react-redux-toastr';

import query from '../../../routes/site-admin/viewBooking/viewBookingDetails.graphql';

const mutation = gql`
mutation updateBooking($bookingId: Int!, $isSchedule: Boolean!, $scheduleFrom: Int, $bookingLocations: [UpdateBookingLocationsInputObjectType]) {
  updateBooking(bookingId: $bookingId, isSchedule: $isSchedule, scheduleFrom: $scheduleFrom, bookingLocations: $bookingLocations) {
    status
    errorMessage
  }
}
`;

export default function updateBooking(variables) {
    return async (dispatch, getState, { client }) => {
        try {
            const { data } = await client.mutate({
                mutation,
                variables,
                refetchQueries: [{ query, variables: { id: variables.bookingId } }]
            });

            if (data && data.updateBooking && data.updateBooking.status === 200) {
                toastr.success('Success', `Booking has been updated successfully.`);
            } else {
                let errorMessage = data && data.updateBooking && data.updateBooking.errorMessage;
                toastr.error("Error!", errorMessage || "Oops! something went wrong. Please try again.");
            }
            return true;
        }
        catch (error) {
            toastr.error("Error!", "Oops! something went wrong. Please try again. " + error);
            return false;
        }
    };
}