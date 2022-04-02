import gql from 'graphql-tag';
import { change } from 'redux-form';
import { toastr } from 'react-redux-toastr';

import history from '../../../history';

const mutation = gql`
mutation createBooking($riderId:ID,$driverId:ID,$categoryId:Int!,$totalDistance:Float!,$totalDuration:Float!,$firstName:String!,$lastName:String!,$email:String!,$phoneDialCode:String!,$phoneNumber:String!,$phoneCountryCode:String!,$currency:String!,$distanceType:String!,$bookingLocations:[BookingLocationsInputObjectType]!, $bookingType: Int!, $scheduleFrom: Int) {
  createBooking(riderId:$riderId,driverId:$driverId,categoryId:$categoryId,totalDistance:$totalDistance,totalDuration:$totalDuration,firstName:$firstName,lastName:$lastName,email:$email,phoneDialCode:$phoneDialCode,phoneNumber:$phoneNumber,phoneCountryCode:$phoneCountryCode,currency:$currency,distanceType:$distanceType,bookingLocations:$bookingLocations, bookingType: $bookingType, scheduleFrom: $scheduleFrom) {
    status
    errorMessage
    result {
        id
    }
  }
}
`;

export default function createBooking(variables) {
    return async (dispatch, getState, { client }) => {
        try {
            dispatch(change("ManualBookingForm", "loaders.finalStep", true));
            const { data } = await client.mutate({
                mutation,
                variables
            });

            if (data && data.createBooking && data.createBooking.status === 200) {
                history.push(`/siteadmin/manual-bookings/view/${data.createBooking.result.id}`)
            } else {
                let errorMessage = data && data.createBooking && data.createBooking.errorMessage;
                toastr.error("Error!", errorMessage || "Oops! something went wrong. Please try again.");
            }
            dispatch(change("ManualBookingForm", "loaders.finalStep", false));
            return true;
        } catch (error) {
            dispatch(change("ManualBookingForm", "loaders.finalStep", false));
            toastr.error("Error!", "Oops! something went wrong. Please try again. " + error);
            return false;
        }
    };
}