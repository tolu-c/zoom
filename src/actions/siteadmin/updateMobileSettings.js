import gql from 'graphql-tag';
import { toastr } from 'react-redux-toastr';
import {
	MOBILE_SETTINGS_UPLOAD_START,
	MOBILE_SETTINGS_UPLOAD_ERROR,
	MOBILE_SETTINGS_UPLOAD_SUCCESS
} from '../../constants/index'
import { setLoaderStart, setLoaderComplete } from '../loader/loader'


export default function updateMobileSettings(
	appForceUpdate, riderAndroidVersion,
	riderIosVersion, driverAndroidVersion, driverIosVersion, stripePublishableKey, multipleStopsWaitingTime, preferredDistanceType,
	distance, duration, estimatedPrice, pickupLocation, destinationLocation, sleepDriverAndroid, sleepDriverios, contactPhoneNumber, contactEmail, skype
) {

	return async (dispatch, getState, { client }) => {

		dispatch({
			type: MOBILE_SETTINGS_UPLOAD_START
		})

		try {

			const mutation = gql`
            mutation updateMobileSettings(
                $appForceUpdate: String
                $riderAndroidVersion: String
                $riderIosVersion: String
                $driverAndroidVersion: String
                $driverIosVersion: String,
                $stripePublishableKey: String,
                $multipleStopsWaitingTime: String,
				$preferredDistanceType: String,
                $distance: String
                $duration: String				
                $estimatedPrice: String
                $pickupLocation: String
                $destinationLocation: String
                $sleepDriverAndroid: String
                $sleepDriverios: String
				$contactPhoneNumber: String
				$contactEmail: String
				$skype: String
                ) {
                    updateMobileSettings(
                    appForceUpdate: $appForceUpdate
                    riderAndroidVersion: $riderAndroidVersion
                    riderIosVersion: $riderIosVersion
                    driverAndroidVersion: $driverAndroidVersion
                    driverIosVersion: $driverIosVersion,
                    stripePublishableKey: $stripePublishableKey,
                    multipleStopsWaitingTime: $multipleStopsWaitingTime,
                    preferredDistanceType: $preferredDistanceType,
                    distance: $distance,
                    duration: $duration,
                    estimatedPrice: $estimatedPrice,
                    pickupLocation: $pickupLocation,
                    destinationLocation: $destinationLocation,
                    sleepDriverAndroid: $sleepDriverAndroid,
                    sleepDriverios: $sleepDriverios,
					contactPhoneNumber: $contactPhoneNumber,
					contactEmail: $contactEmail,
					skype: $skype
                    ){
                    status
                    }
                }
            `
			dispatch(setLoaderStart('MobileSettings'))
			const { data } = await client.mutate({
				mutation,
				variables: {
					appForceUpdate,
					riderAndroidVersion,
					riderIosVersion,
					driverAndroidVersion,
					driverIosVersion,
					stripePublishableKey,
					multipleStopsWaitingTime,
					preferredDistanceType,
					distance,
					duration,
					estimatedPrice,
					pickupLocation,
					destinationLocation,
					sleepDriverAndroid,
					sleepDriverios,
					contactPhoneNumber,
					contactEmail,
					skype
				}
			})

			dispatch(setLoaderComplete('MobileSettings'))
			if (data && data.updateMobileSettings && data.updateMobileSettings.status == 200) {

				dispatch({
					type: MOBILE_SETTINGS_UPLOAD_SUCCESS
				})
				toastr.success('Success', "The mobile app's settings have been updated!")
			} else {
				dispatch({
					type: MOBILE_SETTINGS_UPLOAD_ERROR
				})
				toastr.error('Oops!', 'Something went wrong')
			}
		} catch (err) {
			dispatch({
				type: MOBILE_SETTINGS_UPLOAD_ERROR
			})
			toastr.error('Oops! Something went wrong', err)
		}

	}
}