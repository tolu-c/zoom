import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLList as List
} from 'graphql';

// External Types
import UserType from '../UserType';
import BookingType from '../BookingType';


const MapViewDataCommonType = new ObjectType({
    name: 'MapViewDataCommonType',
    fields: {
        result: { type: UserType },
        results: { type: new List(UserType) },
        bookingResult: { type: BookingType },
        bookingResults: { type: new List(BookingType) },
        count: { type: IntType },
        status: { type: IntType },
        errorMessage: { type: StringType }
    },
});

export default MapViewDataCommonType;
