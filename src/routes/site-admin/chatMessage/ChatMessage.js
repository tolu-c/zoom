import React, { Component } from 'react'
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './ChatMessage.css';
import { injectIntl } from 'react-intl';
import messages from '../../../locale/messages';
import { compose } from 'redux';
import MessagesItem from '../../../components/SiteAdmin/ChatMessages/MessagesItem';
import getAllThreadItemsQuery from './getAllThreadItems.graphql';
import getMoreThreads from './getMoreThreads.graphql';
import { graphql } from 'react-apollo';
import Loader from '../../../components/Common/Loader/Loader';
import NotFound from '../../../components/NotFound/NotFound';

const allowedBookingType = ['completed-bookings', 'cancelled-bookings', 'bookings', 'schedule-bookings'];

export class ChatMessage extends Component {

    constructor(props) {
        super(props);
        this.loadMore = this.loadMore.bind(this);
    }
    loadMore() {
        const { threadItems: { getAllThreadItems, fetchMore }, bookingId } = this.props;
        fetchMore({
            query: getMoreThreads,
            variables: {
                bookingId,
                offset: getAllThreadItems.threadItems.length,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!fetchMoreResult) { return previousResult; }
                return {
                    getAllThreadItems: {
                        ...previousResult.getAllThreadItems,
                        threadItems: [...previousResult.getAllThreadItems.threadItems, ...fetchMoreResult.getMoreThreads],
                    },
                };
            },
        });
    }

    render() {
        const { formatMessage } = this.props.intl;
        const { threadItems, from, threadItems: { loading, getAllThreadItems } } = this.props;

        if (loading) {
            return <div><Loader type={"page"} show={loading}></Loader></div>;
        }
        else if (!getAllThreadItems || !getAllThreadItems.threadItems || !getAllThreadItems.threadItems[0] || !allowedBookingType.includes(from)) {
            return <NotFound title={'Page Not Found'} />;
        }
        else {
            return (
                <div className={s.root}>
                    <div className={s.container}>
                        <div className={s.heading}>
                            {formatMessage(messages.chatMessageLabel)}
                        </div>
                        <div className={s.paddingRoutesSection}>
                            <MessagesItem threadItems={threadItems} from={from} loadMore={this.loadMore} />
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default compose(
    injectIntl,
    withStyles(s),
    graphql(getAllThreadItemsQuery, {
        name: 'threadItems',
        options: (props) => ({
            variables: {
                offset: 0,
                bookingId: props.bookingId
            },
            fetchPolicy: 'network-only',
            ssr: false
        })
    })
)(ChatMessage);