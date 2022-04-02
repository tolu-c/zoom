import {
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType
} from 'graphql';

import { ThreadItems } from '../../../data/models';

import GetAllThreadItemType from '../../types/siteadmin/Thread/GetAllThreadItemType';
import { getThreadId } from '../../../helpers/Thread/getThreadId';
import { getUsers, getUserDetails } from '../../../helpers/Thread/getUsers';

const getAllThreadItems = {

  type: GetAllThreadItemType,

  args: {
    bookingId: { type: new NonNull(IntType) },
    offset: { type: IntType }
  },

  async resolve({ request }, { bookingId, offset }) {
    try {

      if (request.user && request.user.admin) {
        let limit = 5;

        const { riderId, driverId } = await getUsers(bookingId);

        const riderDetails = await getUserDetails(riderId);
        const driverDetails = await getUserDetails(driverId);

        const threadId = await getThreadId(riderId, driverId, bookingId);

        const count = await ThreadItems.count({ where: { threadId } });

        const threadItems = await ThreadItems.findAll({
          where: { threadId },
          offset,
          limit,
          order: [[`createdAt`, `DESC`]],
          raw: true
        });

        return {
          count,
          threadItems,
          riderDetails,
          driverDetails,
        };

      }
    } catch (error) {
      return {
        status: 400,
        errorMessage: 'Something went wrong! ' + error
      };
    }
  }
};

export default getAllThreadItems;

/**
query getAllThreadItems($bookingId: Int!, $currentPage: Int) {
  getAllThreadItems(bookingId: $bookingId, currentPage: $currentPage) {
    status
    errorMessage
    result {
      threadItems {
        id
        threadId
        isRead
        authorId
        userId
        message
        createdAt
        updatedAt
      }
      userDetails {
        id
        email
        profile {
          firstName
          picture
        }
      }
      currentPage
    }
    count
  }
}
 */