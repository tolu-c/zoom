import gql from 'graphql-tag';
import { toastr } from 'react-redux-toastr';
import { change } from 'redux-form';

const mutation = gql`
mutation isRiderExists($phoneNumber: String!, $phoneDialCode: String!) {
  isRiderExists(phoneNumber: $phoneNumber, phoneDialCode: $phoneDialCode) {
    status
    errorMessage
    result {
      id
      email
      userType
      phoneNumber
      phoneDialCode
      profile {
        firstName
        lastName
      }
    }
  }
}
`;

export default function isRiderExists(variables) {
  return async (dispatch, getState, { client }) => {
    try {
      dispatch(change("ManualBookingForm", "loaders.stepOne", true));
      const { data } = await client.mutate({
        mutation,
        variables
      });

      if (data && data.isRiderExists && data.isRiderExists.status === 200) {
        let result = data.isRiderExists.result || {};
        await dispatch(change("ManualBookingForm", 'bookingType', 1));
        await dispatch(change("ManualBookingForm", 'riderId', result.id));
        await dispatch(change("ManualBookingForm", 'riderFirstName', result.profile && result.profile.firstName));
        await dispatch(change("ManualBookingForm", 'riderLastName', result.profile && result.profile.lastName));
        await dispatch(change("ManualBookingForm", 'riderEmail', result.email));
        await dispatch(change("ManualBookingForm", 'stepTwoEnabled', true));

        //Base currency is used.
        await dispatch(change("ManualBookingForm", 'currency', getState().currency && getState().currency.base));

        //Distance type
        await dispatch(change("ManualBookingForm", 'distanceType', getState().siteSettings && getState().siteSettings.data && getState().siteSettings.data.preferredDistanceType));

        //Math.random is used to get the UI updated, if the field (second from bottom) is removed.
        await dispatch(change("ManualBookingForm", 'locations', [{ key: Math.random() }, { key: Math.random() }]));

      } else {
        let errorMessage = data && data.isRiderExists && data.isRiderExists.errorMessage;
        toastr.error("Error!", errorMessage || "Oops! something went wrong. Please try again.");
      }
      dispatch(change("ManualBookingForm", "loaders.stepOne", false));
      return true;
    } catch (error) {
      dispatch(change("ManualBookingForm", "loaders.stepOne", false));
      toastr.error("Error!", "Oops! something went wrong. Please try again. " + error);
      return false;
    }
  };
}