import { Booking } from '../../models';

import {
    GraphQLInt as IntType,
    GraphQLString as StringType,
    GraphQLBoolean as BooleanType
} from 'graphql';

import sequelize from '../../sequelize';

import BookingMannagementWholeType from '../../types/siteadmin/BookingManagementWholeType';

const getAllBookings = {
    type: BookingMannagementWholeType,

    args: {
        currentPage: { type: IntType },
        searchList: { type: StringType },
        bookingType: { type: IntType },
        isManualBooking: { type: BooleanType }
    },

    async resolve({ request }, { currentPage, searchList, bookingType, isManualBooking }) {
        try {
            if (request.user && request.user.admin) {
                let limit = 10;
                let offset = 0;
                let tripStatusFilter = {}, keywordFilter = {}, bookingTypeFilter = {}, manualBookingFilter = {};

                //Booking Type Filter
                if (bookingType) bookingTypeFilter = { bookingType };

                if (isManualBooking) manualBookingFilter = { adminId: { [sequelize.Op.ne]: null } };

                //Search Filter
                if (searchList) {
                    keywordFilter = {
                        [sequelize.Op.or]: [
                            {
                                id: {
                                    [sequelize.Op.or]: [
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE id like '%${searchList}%'`)] },
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE pickUpLocation like '%${searchList}%'`)] },
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE dropOffLocation like '%${searchList}%'`)] },
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE vehicleNumber like '%${searchList}%'`)] },
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE tripStatus like '%${searchList}%'`)] },
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE totalRideDistance like '%${searchList}%'`)] },
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE totalDuration like '%${searchList}%'`)] },
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE totalFare like '%${searchList}%'`)] },
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE tripStatus like '%${searchList}%'`)] },
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE totalRideDistance like '%${searchList}%'`)] },
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE totalDuration like '%${searchList}%'`)] },
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE totalFare like '%${searchList}%'`)] },
                                        { in: [sequelize.literal(`SELECT id FROM Booking WHERE tollFee like '%${searchList}%'`)] },
                                    ]
                                }
                            },
                            { riderId: { in: [sequelize.literal(`SELECT userId FROM UserProfile WHERE firstName like '%${searchList}%'`)] } },
                            { driverId: { in: [sequelize.literal(`SELECT userId FROM UserProfile WHERE firstName like '%${searchList}%'`)] } },
                            { vehicleType: { in: [sequelize.literal(`SELECT id FROM Category WHERE categoryName like '%${searchList}%'`)] } },
                        ]
                    };
                }

                if (currentPage) {
                    offset = (currentPage - 1) * limit
                    const bookingData = await Booking.findAll({
                        where: {
                            [sequelize.Op.and]: [
                                keywordFilter,
                                tripStatusFilter,
                                bookingTypeFilter,
                                manualBookingFilter
                            ]
                        },
                        limit,
                        offset,
                        order: [['createdAt', 'DESC']]
                    });

                    const count = await Booking.count({
                        where: {
                            [sequelize.Op.and]: [
                                keywordFilter,
                                tripStatusFilter,
                                bookingTypeFilter,
                                manualBookingFilter
                            ]
                        }
                    });

                    return {
                        bookingData,
                        count
                    };
                } else {
                    return {
                        bookingData: [],
                        count: 0
                    };
                }
            }
        } catch (error) {
            console.error(error);
            return {
                bookingData: [],
                count: 0
            };
        }
    }
}

export default getAllBookings;

//GraphQL

// query{
//     getAllBookings{
//      riderLocation
//       pickUpLocation
//       dropOffLocation
//       tripStatus
//       baseFare
//     }
// }
