import {
  GraphQLObjectType as ObjectType,
  GraphQLInt as IntType,
  GraphQLString as StringType,
  GraphQLFloat as FloatType

} from 'graphql';

const BookingLocationType = new ObjectType({
  name: 'BookingLocationType',
  fields: {
    id: {
      type: IntType
    },
    bookingId: {
      type: IntType
    },
    location: {
      type: StringType
    },
    locationLat: {
      type: FloatType
    },
    locationLng: {
      type: FloatType
    },
    deletedAt: {
      type: StringType
    },
    locationStatus: {
      type: StringType
    },
    locationDistance: {
      type: FloatType
    },
    locationDistanceType: {
      type: StringType
    },
    locationUpdatedAt: {
      type: StringType
    },
    locationReachedAt: {
      type: StringType
    },
    previousLocation: {
      type: StringType
    },
    locationDuration: {
      type: FloatType
    },
    locationType: {
      type: StringType
    },
    createdAt: {
      type: StringType
    },
    updatedAt: {
      type: StringType
    }
  }
});

export default BookingLocationType;
