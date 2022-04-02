import {
	GraphQLString as StringType,
	GraphQLNonNull as NonNull
} from 'graphql';

import { UserProfile, User, Booking } from '../../../models';

import MapViewDataCommonType from '../../../types/siteadmin/Tracking/MapViewDataCommonType';

const getHeatMapData = {

	type: MapViewDataCommonType,

	args: {
		id: { type: new NonNull(StringType) },
		period: { type: new NonNull(StringType) }
	},

	async resolve({ request }, { id, period }) {
		try {

			if (request.user && request.user.admin) {

				let periodData = {
					lt: new Date(),
					gt: new Date(new Date() - 24 * 60 * 60 * 1000)
				};

				if (period === '7days') {
					periodData = {
						lt: new Date(),
						gt: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
					};
				} else if (period === '30days') {
					periodData = {
						lt: new Date(),
						gt: new Date(new Date() - 30 * 24 * 60 * 60 * 1000)
					};
				} else if (period === 'alldays') {
					periodData = {
						lt: new Date()
					};
				}

				if (id === "7") {

					const results = await User.findAll({
						where: {
							userType: 2,
							deletedAt: null,
							isActive: 1,
							activeStatus: 'active',
							lat: {
								ne: null
							},
							lng: {
								ne: null
							},
						},
						order: [['createdAt', 'DESC']],
						include: [
							{
								model: UserProfile,
								as: 'profile',
								required: true
							}
						]

					});

					return await {
						status: 200,
						results
					};

				} else {

					const bookingResults = await Booking.findAll({
						where: {
							tripStatus: { notIn: ['cancelledByRider', 'cancelledByDriver'] },
							pickUpLat: {
								ne: null
							},
							pickUpLng: {
								ne: null
							},
							createdAt: periodData
						},
						order: [['createdAt', 'DESC']]
					});

					return await {
						status: 200,
						bookingResults
					};

				}

			} else {
				return {
					status: 500,
					errorMessage: 'Oops! Something went wrong. Please login and continue.'
				};
			}
		} catch (error) {
			return {
				status: 400,
				errorMessage: 'Oops! Something went wrong.' + error.message
			}
		}
	},
};

export default getHeatMapData;