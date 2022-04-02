import React, { Component } from 'react'
import { flowRight as compose } from 'lodash';

import withStyles from 'isomorphic-style-loader/withStyles';
import s from './CreateBooking.css'
import cx from 'classnames';

import ManualBookingForm from '../../../components/ManualBooking/ManualBookingForm';
import TripDetails from '../../../components/ManualBooking/TripDetails/TripDetails';

import { injectIntl } from 'react-intl';
import messages from '../../../locale/messages';

export class CreateBooking extends Component {

    render() {
        const { formatMessage } = this.props.intl;

        return (
            <div className={s.root}>
                <div className={s.container}>
                    <div className={s.heading}>
                        {formatMessage(messages.manageDispatcher)}
                    </div>
                    <div className={cx(s.paddingRoutesSection, s.Grid, 'paddingRoutesSectionRTL')}>
                        <div><ManualBookingForm /></div>
                        <div><TripDetails /></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default compose(
    injectIntl,
    withStyles(s)
)(CreateBooking);