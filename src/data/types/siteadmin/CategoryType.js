import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLFloat as FloatType,
  GraphQLBoolean as BooleanType,
} from 'graphql';

import { NearByDriverType } from './ManualBooking/NearByDriverType';
import { PriceDetailsType } from './ManualBooking/PriceDetailsType';

import getCommonType from '../../../helpers/getCommonType';

const CategoryType = new ObjectType({
  name: 'Category',
  fields: {
    id: { type: IntType },
    categoryName: { type: StringType },
    categoryImage: { type: StringType },
    categoryMarkerImage: { type: StringType },
    unitPrice: { type: FloatType },
    minutePrice: { type: FloatType },
    basePrice: { type: FloatType },
    isActive: { type: BooleanType },
    currency: { type: StringType },
    capacity: { type: IntType },
    riderFeeType: { type: StringType },
    riderFeeValue: { type: IntType },
    driverFeeType: { type: StringType },
    driverFeeValue: { type: IntType },
    categoryImage: { type: StringType },
    categoryMarkerImage: { type: StringType },
    status: { type: IntType },
    errorMessage: { type: StringType },
    createdAt: { type: StringType },
    updatedAt: { type: StringType },
    fieldName: { type: StringType },
    fileName: { type: StringType },
    categoryImageName: {
      type: StringType,
      async resolve(account) {
        let name = account.categoryImage ? 'images/upload/' + account.categoryImage : '';
        return name;
      }
    },
    categoryMarkerImageName: {
      type: StringType,
      async resolve(account) {
        let name = account.categoryMarkerImage ? 'images/upload/' + account.categoryMarkerImage : '';
        return name;
      }
    },
    priceDetails: { type: PriceDetailsType },
    nearByDrivers: { type: new List(NearByDriverType) }
  },
});

export const CategoryCommonType = getCommonType('CategoryCommonType', CategoryType);

export default CategoryType;
