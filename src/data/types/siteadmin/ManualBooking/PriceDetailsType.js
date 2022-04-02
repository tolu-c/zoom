import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLFloat as FloatType,
    GraphQLBoolean as BooleanType
} from 'graphql';

export const PriceDetailsType = new ObjectType({
    name: 'PriceDetailsType',
    fields: {
        id: { type: IntType },
        categoryId: { type: IntType },
        unitPrice: { type: FloatType },
        minutePrice: { type: FloatType },
        basePrice: { type: FloatType },
        riderFeeType: { type: StringType },
        riderFeeValue: { type: FloatType },
        driverFeeType: { type: StringType },
        driverFeeValue: { type: FloatType },
        riderServiceFee: { type: FloatType },
        driverServiceFee: { type: FloatType },
        priceForDistance: { type: FloatType },
        priceForDuration: { type: FloatType },
        totalFare: { type: FloatType },
        calculatedPrice: { type: FloatType },
        totalFareForRider: { type: FloatType },
        totalFareForDriver: { type: FloatType },
        convertCurrency: { type: StringType },
        isSpecialTrip: { type: BooleanType },
        specialTripPrice: { type: FloatType },
        specialTripTotalFare: { type: FloatType },
        riderPayableFare: { type: FloatType }
    }
});