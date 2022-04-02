import {
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
} from 'graphql';

import { UserCommonType } from '../../../types/siteadmin/UserType';

import { isRiderExistsHelper, isDriverActive } from '../../../../helpers/ManualBooking/bookingHelper';

const isRiderExists = {
    type: UserCommonType,

    args: {
        phoneNumber: { type: new NonNull(StringType) },
        phoneDialCode: { type: new NonNull(StringType) }
    },

    async resolve({ request }, { phoneNumber, phoneDialCode }) {
        try {
            if (!request.user || !request.user.admin) {
                return {
                    status: 500,
                    errorMessage: 'Please login with your account and continue.'
                };
            }

            const isDriverActiveResult = await isDriverActive({
                phoneNumber,
                phoneDialCode,
                userAttributes: ['id', 'email', 'userType', 'phoneNumber', 'phoneDialCode', 'isBan', 'isActive'],
            });

            if (isDriverActiveResult) {
                return {
                    status: 400,
                    errorMessage: 'Oops! It seems the user is active as a Driver to take trips from the riders. Please inform them to go OFFLINE from their driver account to book a ride for them here.'
                };
            }

            const result = await isRiderExistsHelper({
                phoneNumber,
                phoneDialCode,
                userAttributes: ['id', 'email', 'userType', 'phoneNumber', 'phoneDialCode', 'isBan'],
                profileAttributes: ['firstName', 'lastName']
            });

            if (result && result.isBan) {
                return {
                    status: 400,
                    errorMessage: 'This user is banned'
                };
            }

            // if (!result || result.userType == 1) {
            return {
                status: 200,
                result
            };
            // }
            // else {
            //     return {
            //         status: 400,
            //         errorMessage: 'The phone number you entered is already used to create a driver account. Please try again with a different number.'
            //     };
            // }

        }
        catch (error) {
            return {
                status: 400,
                errorMessage: "Something went wrong " + error
            };
        }
    }
}

export default isRiderExists;

/**
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
 */