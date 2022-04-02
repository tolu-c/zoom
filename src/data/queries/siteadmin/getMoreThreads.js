import {
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
  GraphQLList as List,
} from 'graphql';

import { ThreadItems } from '../../models';

import ThreadItemType from '../../types/siteadmin/Thread/ThreadItemType';
import { getThreadId } from '../../../helpers/Thread/getThreadId';
import { getUsers } from '../../../helpers/Thread/getUsers';

const getMoreThreads = {

  type: new List(ThreadItemType),

  args: {
    bookingId: { type: new NonNull(IntType) },
    offset: { type: IntType }
  },

  async resolve({ request }, { bookingId, offset }) {
    try {

      if (request.user && request.user.admin) {
        let limit = 5;

        const { riderId, driverId } = await getUsers(bookingId);

        const threadId = await getThreadId(riderId, driverId, bookingId);

        return await ThreadItems.findAll({
          where: { threadId },
          offset,
          limit,
          order: [[`createdAt`, `DESC`]],
          raw: true
        });

      }
    } catch (error) {
      return {
        status: 400,
        errorMessage: 'Something went wrong! ' + error
      };
    }
  }
};

export default getMoreThreads;
