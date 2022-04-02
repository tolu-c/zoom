import UpdateSiteSettingsType from '../../types/siteadmin/UpdateSiteSettingsType';
import { SiteSettings } from '../../models';

import {
	GraphQLString as StringType,
	GraphQLInt as IntType
} from 'graphql';

const updateMobileSettings = {

	type: UpdateSiteSettingsType,

	args: {
		appForceUpdate: { type: StringType },
		riderAndroidVersion: { type: StringType },
		riderIosVersion: { type: StringType },
		driverAndroidVersion: { type: StringType },
		driverIosVersion: { type: StringType },
		stripePublishableKey: { type: StringType },
		multipleStopsWaitingTime: { type: StringType },
		preferredDistanceType: { type: StringType },
		distance: { type: StringType },
		duration: { type: StringType },
		estimatedPrice: { type: StringType },
		pickupLocation: { type: StringType },
		destinationLocation: { type: StringType },
		sleepDriverAndroid: { type: StringType },
		sleepDriverios: { type: StringType },
		contactPhoneNumber: { type: StringType },
		contactEmail: { type: StringType },
		skype: { type: StringType },
	},

	async resolve({ request }, {
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
	}) {
		try {

			if (request.user && request.user.admin == true) {
				let appSettingsFields = {
					"appForceUpdate": appForceUpdate,
					"riderAndroidVersion": riderAndroidVersion,
					"riderIosVersion": riderIosVersion,
					"driverAndroidVersion": driverAndroidVersion,
					"driverIosVersion": driverIosVersion,
					"stripePublishableKey": stripePublishableKey,
					"multipleStopsWaitingTime": multipleStopsWaitingTime,
					"preferredDistanceType": preferredDistanceType,
					"distance": distance,
					"duration": duration,
					"estimatedPrice": estimatedPrice,
					"pickupLocation": pickupLocation,
					"destinationLocation": destinationLocation,
					"sleepDriverAndroid": sleepDriverAndroid,
					"sleepDriverios": sleepDriverios,
					"contactPhoneNumber": contactPhoneNumber,
					"contactEmail": contactEmail,
					"skype": skype
				};

				await Promise.all([
					Object.keys(appSettingsFields).map(async (item) => {
						await SiteSettings.update({ value: appSettingsFields[item] }, { where: { name: item } })
					})
				])

				return {
					status: 200
				}

			} else {
				return {
					status: 400,
					errorMessage: "Invalid admin user"
				}
			}

		} catch (err) {
			return {
				status: 400,
				errorMessage: "Something went wrong. Please try again"
			}
		}

	},
};


// mutation updateMobileSettings(
// 	$appForceUpdate: String
// 	$riderAndroidVersion: String
// 	$riderIosVersion: String
// 	$driverAndroidVersion: String
// 	$driverIosVersion: String,
// 	$stripePublishableKey: String,
// 	$multipleStopsWaitingTime: String,
//  $preferredDistanceType: String,
// 	$distance: String
// 	$duration: String				
// 	$estimatedPrice: String
// 	$pickupLocation: String
// 	$destinationLocation: String
// 	$sleepDriverAndroid: String
// 	$sleepDriverios: String
// 	) {
// 			updateMobileSettings(
// 			appForceUpdate: $appForceUpdate
// 			riderAndroidVersion: $riderAndroidVersion
// 			riderIosVersion: $riderIosVersion
// 			driverAndroidVersion: $driverAndroidVersion
// 			driverIosVersion: $driverIosVersion,
// 			stripePublishableKey: $stripePublishableKey,
// 			multipleStopsWaitingTime: $multipleStopsWaitingTime,
// 			preferredDistanceType: $preferredDistanceType,
// 			distance: $distance,
// 			duration: $duration,
// 			estimatedPrice: $estimatedPrice,
// 			pickupLocation: $pickupLocation,
// 			destinationLocation: $destinationLocation,
// 			sleepDriverAndroid: $sleepDriverAndroid,
// 			sleepDriverios: $sleepDriverios
// 			){
// 			status
// 			}
// 	}

export default updateMobileSettings;
