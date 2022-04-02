import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLFloat as FloatType,
    GraphQLID as ID
} from 'graphql';

import { UserProfile } from '../../../models';

import UserProfileType from '../UserProfileType';

export const NearByDriverType = new ObjectType({
    name: 'NearByDriver',
    fields: {
        id: { type: ID },
        email: { type: StringType },
        phoneNumber: { type: StringType },
        phoneDialCode: { type: StringType },
        phoneCountryCode: { type: StringType },
        lat: { type: FloatType },
        lng: { type: FloatType },
        userStatus: { type: StringType },
        isActive: { type: IntType },
        isBan: { type: IntType },
        userType: { type: IntType },
        createdAt: { type: StringType },
        activeStatus: { type: StringType },
        overallRating: { type: FloatType },
        deletedAt: { type: StringType },
        durationToReachRider: { type: StringType },
        distanceFromRider: { type: FloatType },
        profile: {
            type: UserProfileType,
            async resolve(driver) {
                return await UserProfile.findOne({ where: { userId: driver && driver.id } });
            }
        }
    }
});