import gql from 'graphql-tag';
import { change } from 'redux-form';
import { toastr } from 'react-redux-toastr';

import { closeCancelBookingModal } from '../modalActions';

import query from '../../../routes/site-admin/viewBooking/viewBookingDetails.graphql';

const mutation = gql`
mutation ($bookingId: Int!, $requestBy: String!, $reason: String) {
  cancelBooking(bookingId: $bookingId, requestBy: $requestBy, reason: $reason) {
    status
    errorMessage
  }
}
`;

export default function cancelBooking(variables) {
    return async (dispatch, getState, { client }) => {
        try {
            dispatch(change("CancelBookingForm", "loading", true));
            const { data } = await client.mutate({
                mutation,
                variables,
                refetchQueries: [{ query, variables: { id: variables.bookingId } }]
            });

            if (data && data.cancelBooking && data.cancelBooking.status === 200) {
                toastr.success('Success', `Booking has been cancelled successfully.`);
            } else {
                let errorMessage = data && data.cancelBooking && data.cancelBooking.errorMessage;
                toastr.error("Error!", errorMessage || "Oops! something went wrong. Please try again.");
            }
            dispatch(closeCancelBookingModal())
            dispatch(change("CancelBookingForm", "loading", false));
            return true;
        }
        catch (error) {
            dispatch(change("CancelBookingForm", "loading", false));
            toastr.error("Error!", "Oops! something went wrong. Please try again. " + error);
            return false;
        }
    };
}