import {
    GraphQLList as List,
    GraphQLInt as IntType,
    GraphQLString as StringType,
    GraphQLObjectType as ObjectType
} from 'graphql';

export default function getCommonType(name, resultType) {
    return new ObjectType({
        name, //Should be unique
        fields: {
            status: { type: IntType },
            errorMessage: { type: StringType },
            result: { type: resultType },
            results: { type: new List(resultType) },
            count: { type: IntType }
        }
    });
}