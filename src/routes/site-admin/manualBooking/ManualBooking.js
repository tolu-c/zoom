import React, { Component } from 'react'
import { flowRight as compose } from 'lodash';

import withStyles from 'isomorphic-style-loader/withStyles';
import s from './ManualBooking.css'

import { graphql } from 'react-apollo';
import getAllBookings from './getAllBookings.graphql';

import { injectIntl } from 'react-intl';
import messages from '../../../locale/messages';

import BookingList from '../../../components/Booking/BookingList/BookingList';
import Loader from '../../../components/Common/Loader/Loader';

export class ManualBooking extends Component {

    render() {
        const { formatMessage } = this.props.intl;
        const { bookingDetails, bookingDetails: { loading } } = this.props;

        return (
            <Loader type={"page"} show={loading}>
                <div className={s.root}>
                    <div className={s.container}>
                        <div className={s.heading}>
                            {formatMessage(messages.manualBookings)}
                        </div>
                        <div className={s.paddingRoutesSection}>
                            <BookingList isManualBooking={true} bookingDetails={bookingDetails} />
                        </div>
                    </div>
                </div>
            </Loader>
        );
    }
}

export default compose(
    injectIntl,
    withStyles(s),
    graphql(getAllBookings, {
        name: 'bookingDetails',
        options: {
            variables: {
                currentPage: 1,
                isManualBooking: true
            },
            fetchPolicy: 'network-only'
        }
    })
)(ManualBooking);