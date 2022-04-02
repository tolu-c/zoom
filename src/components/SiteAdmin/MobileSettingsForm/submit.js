import updateMobileSettings from '../../../actions/siteadmin/updateMobileSettings'
import { toastr } from 'react-redux-toastr';

async function submit(values, dispatch) {

    if (values.distance === '0' && values.duration === '0' && values.estimatedPrice === '0' && values.pickupLocation === '0' && values.destinationLocation === '0') {
        toastr.error('Failed!', 'Please enable any one of the field in Trip Request Window');
        return;
    }

    await dispatch( 
        updateMobileSettings(
            values.appForceUpdate,
            values.riderAndroidVersion,
            values.riderIosVersion,
            values.driverAndroidVersion,
            values.driverIosVersion,
            values.stripePublishableKey,
            values.multipleStopsWaitingTime,
            values.preferredDistanceType,
            values.distance,
            values.duration,
            values.estimatedPrice,
            values.pickupLocation,
            values.destinationLocation,
            values.sleepDriverAndroid,
            values.sleepDriverios,
            values.contactPhoneNumber,
            values.contactEmail,
            values.skype
        )
    )
}

export default submit;