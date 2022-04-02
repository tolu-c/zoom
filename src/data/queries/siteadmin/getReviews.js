import {
    GraphQLString as StringType,
    GraphQLInt as IntType
} from 'graphql'

import { Reviews } from '../../models'
import ReviewsWholeType from '../../types/siteadmin/ReviewsWholeType'

import sequelize from '../../sequelize';

const getReviews = {

    type: ReviewsWholeType,

    args: {
        currentPage: { type: IntType },
        searchList: { type: StringType }
    },

    async resolve({ request }, { currentPage, searchList }) {
        if (request.user && request.user.admin) {
            let limit = 10;
            let offset = 0;

            let keywordFilter = {};

            if (currentPage) {
                offset = (currentPage - 1) * limit;
            }

            if (searchList && searchList.toString().trim() !== '') {

                keywordFilter = {
                    or: [
                        { authorId: { in: [sequelize.literal(`SELECT userId FROM UserProfile WHERE firstName like '%${searchList}%'`)] } },
                        { userId: { in: [sequelize.literal(`SELECT userId FROM UserProfile WHERE firstName like '%${searchList}%'`)] } },
                        { ratings: { in: [sequelize.literal(`SELECT ratings FROM Reviews WHERE ratings like '%${searchList}%'`)] } },
                        { id: { in: [sequelize.literal(`SELECT id FROM Reviews WHERE id like '%${searchList}%'`)] } },
                    ]
                };
            }

            const results = await Reviews.findAll({
                limit,
                offset,
                where: {
                    and: [
                        keywordFilter
                    ]
                },
                order: [['id', 'DESC']],
            });

            const count = await Reviews.count({
                where: {
                    and: [
                        keywordFilter
                    ]
                },
            });

            return await {
                status: 200,
                count,
                reviewsData: results
            };

        }
    }
}

export default getReviews;

/*
select a.bookingId, a.userId as userId1, a.ratings as ratings1,
b.userId as userId2, b.ratings as ratings2
from Reviews a, Reviews b
where a.bookingId=696 and b.bookingId=696 and a.bookingId = b.bookingId;
*/