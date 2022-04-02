import {
	GraphQLString as StringType,
	GraphQLNonNull as NonNull
} from 'graphql';

import { UserProfile, User } from '../../../../data/models';

import MapViewDataCommonType from '../../../types/siteadmin/Tracking/MapViewDataCommonType';

const getMapViewData = {

	type: MapViewDataCommonType,

	args: {
		id: { type: new NonNull(StringType) },
		period: { type: new NonNull(StringType) }
	},

	async resolve({ request }, { id, period }) {
		try {
			if (request.user && request.user.admin) {
				let where, periodData;

				periodData = {
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

				let riderFilter = {
					userType: 1,
					createdAt: periodData
				};

				let driverFilter = {
					userType: 2
				};

				if (id === '1') {
					where = {
						or: [
							riderFilter,
							driverFilter
						],
						deletedAt: null,
						lat: {
							ne: null
						},
						lng: {
							ne: null
						}
					}
				} else if (id === '2') {
					where = {
						or: [
							{
								userType: 1
							},
							{
								userType: 2,
								userTypeUpdated: {
									ne: null
								}
							}
						],
						deletedAt: null,
						createdAt: periodData
					}
				} else if (id === '3') {
					where = {
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
					}
				} else if (id === '4') {
					where = {
						userType: 2,
						deletedAt: null,
						isActive: 1,
						activeStatus: 'inactive',
					}
				} else if (id === '5') {
					where = {
						userType: 2,
						deletedAt: null,
						userStatus: { in: ['pending', 'inactive'] },
						createdAt: periodData,
					}
				}

				const results = await User.findAll({
					where,
					order: [['createdAt', 'DESC']],
					include: [
						{
							model: UserProfile,
							where: {
								lat: {
									ne: null
								},
								lng: {
									ne: null
								},
							},
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

export default getMapViewData;