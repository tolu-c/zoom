import moment from 'moment';

import { PromoCode } from '../../../models';

import PromoCodeType from '../../../types/siteadmin/PromoCode/PromoCodeType';

import {
	GraphQLString as StringType,
	GraphQLInt as IntType,
	GraphQLNonNull as NonNull,
	GraphQLFloat as FloatType
} from 'graphql';

import sequelize from '../../../sequelize';

import { sendNotifications } from '../../../../core/pushNotifications/sendNotifications';

const updatePromoCode = {

	type: PromoCodeType,

	args: {
		id: { type: new NonNull(IntType) },
		title: { type: new NonNull(StringType) },
		description: { type: new NonNull(StringType) },
		code: { type: new NonNull(StringType) },
		type: { type: new NonNull(IntType) }, // // (1 => percentage, 2 => fixed)
		promoValue: { type: new NonNull(FloatType) },
		currency: { type: StringType },
		expiryDate: { type: StringType },
		isEnable: { type: StringType }
	},

	async resolve({ request }, {
		id,
		title,
		description,
		code,
		type,
		promoValue,
		currency,
		expiryDate,
		isEnable
	}) {
		try {
			if (request.user && request.user.admin) {
				const isCodeExist = await PromoCode.findOne({
					attributes: ['id', 'code'],
					where: {
						code,
						id: {
							ne: id
						}
					},
					raw: true
				});

				if (isCodeExist && isCodeExist.code === code) {
					return await {
						status: 400,
						errorMessage: 'Oops! It looks like already this promo code is used. Please try again with different promo code name.'
					};
				} else {

					const oldPromoData = await PromoCode.findOne({
						attributes: [`id`, `title`, `description`, `code`, `type`, `promoValue`, `currency`, `expiryDate`, `isEnable`],
						where: {
							id
						},
						raw: true
					});

					oldPromoData['expiryDate'] = oldPromoData.expiryDate && moment(oldPromoData.expiryDate).format('YYYY-MM-DD')

					let newPromoData = {
						id,
						title,
						description,
						code,
						type,
						promoValue,
						currency,
						expiryDate: moment(expiryDate).format('YYYY-MM-DD'),
						isEnable: isEnable === "true" ? 1 : 0
					};

					const updatePromoCodeInfo = await PromoCode.update({
						title,
						description,
						code,
						type,
						promoValue,
						currency,
						expiryDate,
						isEnable: isEnable == "true" ? true : false
					}, {
						where: {
							id
						}
					});

					if (updatePromoCode) {

						let pushNotificationContent = {
							title,
							message: description,
							screen: "PROMO_PAGE"
						};

						if (JSON.stringify(oldPromoData) != JSON.stringify(newPromoData)) {
							sendNotifications(pushNotificationContent, null, true, null);
						}

						return await {
							status: 200
						};
					} else {
						return await {
							status: 400,
							errorMessage: 'Oops! Something went wrong! Unable to update the promo code. Please try again.'
						};
					}
				}
			} else {
				return {
					status: 500,
					errorMessage: "Oops! Please login with your account and try again."
				};
			}
		} catch (error) {
			return {
				status: 400,
				errorMessage: 'Something went wrong.' + error.message

			}
		}
	},
};

export default updatePromoCode;

/*

mutation(
		$id: Int!,
		$title: String!,
		$description: String!,
		$code: String!,
		$type: Int!,
		$promoValue: Float!,
		$currency: String,
		$expiryDate: String,
		$isEnable: String
) {
		updatePromoCode(
				id: $id,
				title: $title,
				description: $description,
				code: $code,
				type: $type,
				promoValue: $promoValue,
				currency: $currency,
				expiryDate: $expiryDate,
				isEnable: $isEnable
		) {
				status
				errorMessage
		}
}

*/
