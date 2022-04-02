import React, { Component } from 'react'
import Link from '../Link';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './ViewBookingDetails.css';
import bt from '../../components/commonStyle.css';
import PropTypes from 'prop-types';
import { Table, Button } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from '../../locale/messages';
import moment from 'moment';
import { connect } from 'react-redux';
import CurrencyCoverter from '../CurrencyConverter'
import { capitalizeFirstLetter } from '../../helpers/capitalizeFirst';
import ViewScheduleBookingHistory from './ViewScheduleBookingHistory';
import { toastr } from 'react-redux-toastr';
import EditBookingModal from '../ManualBooking/EditBookingModal/EditBookingModal';
import CancelBookingModal from '../ManualBooking/CancelBookingModal/CancelBookingModal';
import { openCancelBookingModal, openEditBookingModal } from '../../actions/siteadmin/modalActions';

const socketReceivers = [
    { type: 'tripRequest' },
    { type: 'tripStart' },
    { type: 'driverCancel', message: 'Cancelled by driver' },
    { type: 'riderCancel', message: 'Cancelled by rider' },
    { type: 'confirmStop' },
    { type: 'tripComplete' }
];

const allowedStatus = ['created', 'approved', 'started'],
    allowedCancelStatus = ['created', 'approved', 'scheduled'];

class ViewBookingDetails extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
    }

    static defaultProps = {
        locale: "en-US"
    }

    constructor(props) {
        super(props);
        this.renderAmountInformation = this.renderAmountInformation.bind(this);
        this.renderInformation = this.renderInformation.bind(this);
        this.isValueDefined = this.isValueDefined.bind(this);
    }

    componentDidMount() {
        const { socket, data } = this.props;

        if (socket && data && data.riderId && data.adminId && allowedStatus.includes(data.tripStatus)) {
            socketReceivers.map((receiver) => socket.on(`${receiver.type}-${data.riderId}`, (response) => this.handleSocketResponse({ response, receiver })));
        }
    }

    componentWillUnmount() {
        if (this.props.socket) this.props.socket.removeAllListeners();
    }

    handleSocketResponse = ({ response, receiver }) => {
        const { refetch, data } = this.props;
        let errorMessage = response && response.data && response.data.errorMessage || receiver.message;
        let changedToApproved = response && response.data && response.data.data && response.data.data.tripStatus === 'approved' && data.tripStatus === 'created';

        if (receiver.type === 'riderCancel') errorMessage = '';

        if (errorMessage) toastr.error('Error!', errorMessage);
        if ((errorMessage || receiver.type !== 'tripRequest' || changedToApproved)) refetch();
    };

    handleEdit = () => {
        const { data } = this.props;
        let initialValue = { booking: data };
        if (data && data.tripStatus === 'scheduled') initialValue['scheduleFromField'] = this.props.data.scheduleBooking.scheduleFrom;
        else if (data && data.bookingLocations && data.bookingLocations.length > 0) {
            initialValue['pickUpField'] = data && data.pickUpLocation;
            initialValue['locationsInput'] = [];
            data.bookingLocations.map(location => initialValue['locationsInput'].push({
                key: Math.random(),
                id: location.id,
                locationStatus: location.locationStatus,
                data: { label: location.location, location: { lat: location.locationLat, lng: location.locationLng }, disabled: location.locationStatus === 'completed' }
            }));
        }
        else initialValue = undefined;

        if (initialValue) this.props.openEditBookingModal(initialValue)
    };

    handleCancel = () => this.props.openCancelBookingModal({ booking: this.props.data });

    isValueDefined(value) {
        if (value !== null && value !== undefined && value !== '') {
            return true;
        }
        return false;
    }

    renderLink = (action) => action.messageKey && action.show && (
        <a onClick={action.handleClick} className={cx(s.addOrChangeBtn, 'floatLeftRTL')}>
            {messages[action.messageKey] ? this.props.intl.formatMessage(messages[action.messageKey]) : action.messageKey}
        </a>
    );

    renderAmountInformation(label, amount, currency, isMinus, isBold, afterContent) {
        if (label && this.isValueDefined(amount) && currency) {
            return (
                <tr>
                    {!isBold && <td>{label}</td>}
                    {
                        !isBold && <td colSpan="4">
                            {isMinus ? '-' : ''}
                            <CurrencyCoverter from={currency} amount={amount} />
                            {afterContent ? `(${afterContent})` : ''}
                        </td>
                    }
                    {isBold && <td><b>{label}</b></td>}
                    {
                        isBold && <td colSpan="4">
                            <b>
                                {isMinus ? '-' : ''}
                                <CurrencyCoverter from={currency} amount={amount} />
                                {afterContent ? `(${afterContent})` : ''}
                            </b>
                        </td>
                    }
                </tr>
            );
        }
    }

    renderInformation(label, information, action = {}) {
        if (label && information) {
            return (
                <tr>
                    <td>{label}</td>
                    <td colSpan="2">
                        {information}
                    </td>
                    <td className={s.addChange}>
                        {this.renderLink(action)}
                    </td>
                </tr>
            );
        }
    }

    renderLocation = (label, locations, action = {}) => {
        if (label && locations) {
            return (
                <tr>
                    <td>{label}</td>
                    <td colSpan="4">
                        {locations.map((value, index) => {
                            return (
                                <div key={index} className={s.circleHeight}>
                                    <span className={cx(s.circle, s.displayTableCell, { [s.circleGray]: value.locationStatus === 'completed' })}></span>
                                    <span className={s.displayTableCell}>
                                        {value.location}
                                    </span>
                                    <span>{index === locations.length - 1 && this.renderLink(action)}</span>
                                </div>
                            );
                        })
                        }
                    </td>
                </tr>
            );
        }
    }

    getFormattedDistance = (distance, distanceType) => {
        let unit = distanceType;
        const { formatMessage } = this.props.intl;
        if (distanceType === 'mile' && distance > 1) unit = 'miles'
        return `${distance} ${messages[unit] ? formatMessage(messages[unit]) : distanceType}`
    }

    render() {
        const { title, data, locale, from } = this.props;
        const { formatMessage } = this.props.intl;
        let link = '/siteadmin/' + from;

        let currency = data && data.currency;
        let tripStart = data && data.tripStart;
        let tripEnd = data && data.tripEnd;
        let promoCode, earnings = 0, platformEarnings = 0, offeredEarnings = 0;

        let riderTotalFare = data && data.riderTotalFare;
        let driverTotalFare = data && data.driverTotalFare;
        if (data && data.isTipGiven) { // If rider gives tips to the driver
            riderTotalFare = data.tipsTotalFare || riderTotalFare;
            driverTotalFare = data.tipsDriverTotalFare || driverTotalFare;
            if (data.isSpecialTrip === true) {
                promoCode = data.promoCode && data.promoCode.code;
            }
        } else if (data && data.isTipGiven === false && data.isSpecialTrip === true) { // If rider applied the promo code
            riderTotalFare = data.specialTripTotalFare || riderTotalFare;
            promoCode = data.promoCode && data.promoCode.code;
        }

        if (data && this.isValueDefined(data.riderServiceFee) && this.isValueDefined(data.driverServiceFee)) {
            // Platform Earnings
            earnings = Number(data.riderServiceFee) + Number(data.driverServiceFee);
            platformEarnings = earnings;
            if (data.isSpecialTrip === true) {
                platformEarnings = earnings > Number(data.specialTripPrice) ? earnings - Number(data.specialTripPrice) : 0;
                offeredEarnings = earnings < Number(data.specialTripPrice) ? (Number(data.specialTripPrice) - Number(earnings)) : 0;
            }
        }

        let scheduleDifference = data && data.scheduleBooking && data.scheduleBooking.scheduleFrom && moment(data.scheduleBooking.scheduleFrom).diff(moment(), 'minutes'),
            locationEdit = {
                show: data && data.adminId && allowedStatus.includes(data.tripStatus) && data.bookingLocations && ((data.bookingLocations.filter(value => value.locationStatus !== 'completed')).length > 0),
                messageKey: 'addOrChange',
                handleClick: this.handleEdit
            },
            scheduleDateEdit = {
                show: data && data.adminId && data.tripStatus === 'scheduled' && scheduleDifference > 20,
                messageKey: 'editDateAndTime',
                handleClick: this.handleEdit
            },
            canCancel = data && data.adminId && (allowedCancelStatus.includes(data.tripStatus) || data.tripStatus === 'scheduled' && scheduleDifference > 20);

        return (
            <div className={cx(s.pagecontentWrapper, s.widthInner, bt.space5)}>
                <EditBookingModal booking={data} />
                <CancelBookingModal booking={data} />
                <div className={s.contentBox}>
                    <div className={cx(s.displayBlock, bt.space2, bt.textAlignRight, 'textAlignLeftRTL', s.textAlignMb)}>
                        {canCancel && <Button onClick={this.handleCancel} className={cx(bt.btnPrimary, s.canCancelBtnMb, 'canCancelBtnMbRTL')}>{formatMessage(messages.cancelBooking)}</Button>}
                        <Link to={link} className={cx('pull-right', s.backBtn, s.backBtn, bt.btnSecondary, 'viewBookingBackRTL')}>
                            <FormattedMessage {...messages.goBack} />
                        </Link>
                    </div>
                    <div>
                        <h1 className={cx(s.headerTitle, 'textAlignRightRTL')}>{title}</h1>
                    </div>
                    <div className={cx('table-responsive', 'bookingCollapse')}>
                        <Table>
                            <tbody>
                                {
                                    data && data.id && this.renderInformation(formatMessage(messages.bookingId), `#${data.id}`)
                                }
                                {
                                    data && data.riderDetails && data.riderDetails.firstName && this.renderInformation(formatMessage(messages.riderName), capitalizeFirstLetter(data.riderDetails.firstName))
                                }
                                {
                                    data && data.riderDetails && data.riderDetails.userData && data.riderDetails.userData.email && this.renderInformation(formatMessage(messages.riderEmail), data.riderDetails.userData.email)
                                }
                                {
                                    data && data.driverDetails && data.driverDetails.firstName && this.renderInformation(formatMessage(messages.driverName), capitalizeFirstLetter(data.driverDetails.firstName))
                                }
                                {
                                    data && data.driverDetails && data.driverDetails.userData && data.driverDetails.userData.email && this.renderInformation(formatMessage(messages.driverEmail), data.driverDetails.userData.email)
                                }
                                {
                                    data && data.pickUpLocation && this.renderInformation(formatMessage(messages.pickUpLocation), data.pickUpLocation)
                                }
                                {
                                    data && data.bookingLocations && data.bookingLocations.length > 1 && this.renderLocation(formatMessage(messages.dropLocation), data.bookingLocations, locationEdit)
                                }
                                {
                                    data && data.bookingLocations && data.bookingLocations.length <= 1 && data.dropOffLocation && this.renderInformation(formatMessage(messages.dropLocation), data.dropOffLocation, locationEdit)
                                }
                                {
                                    data && data.vehicleNumber && this.renderInformation(formatMessage(messages.vehicleNumber), data.vehicleNumber)
                                }
                                {
                                    data && data.categoryDetails && data.categoryDetails.categoryName && this.renderInformation(formatMessage(messages.categoryName), data.categoryDetails.categoryName)
                                }
                                {
                                    data && data.tripStart && this.renderInformation(formatMessage(messages.tripStart), moment(tripStart).format('DD-MM-YYYY HH:mm:ss'))
                                }
                                {
                                    data && data.tripEnd && this.renderInformation(formatMessage(messages.tripEnd), moment(tripEnd).format('DD-MM-YYYY HH:mm:ss'))
                                }
                                {
                                    data && data.tripStatus && this.renderInformation(formatMessage(messages.tripStatus), data.tripStatus && messages[data.tripStatus] ? formatMessage(messages[data.tripStatus]) : data.tripStatus)
                                }
                                {
                                    data && String(data.totalRideDistance) && this.renderInformation(formatMessage(messages.totalRideDistance), this.getFormattedDistance(data.totalRideDistance, data.distanceType))
                                }
                                {
                                    data && String(data.totalDuration) && this.renderInformation(formatMessage(messages.totalDuration), moment.duration({ "minutes": data.totalDuration }).locale(locale).humanize())
                                }
                                {
                                    data && data.paymentType && this.renderInformation(formatMessage(messages.paymentMethod), data.paymentType && data.paymentType === 1 ? formatMessage(messages.cash) : (data.paymentType === 2 ? formatMessage(messages.card) : formatMessage(messages.wallet)))
                                }
                                {/* Schedule Booking */}
                                {
                                    data && data.bookingType === 2 && data.scheduleBooking && data.scheduleBooking.scheduleFrom && this.renderInformation(formatMessage(messages.scheduledFrom), moment(data.scheduleBooking.scheduleFrom).format('DD-MM-YYYY HH:mm:ss'), scheduleDateEdit)
                                }
                                {
                                    data && data.bookingType === 2 && data.scheduleBooking && data.scheduleBooking.scheduleTo && this.renderInformation(formatMessage(messages.scheduledTo), moment(data.scheduleBooking.scheduleTo).format('DD-MM-YYYY HH:mm:ss'))
                                }
                                {
                                    data && data.bookingType === 2 && <tr>
                                        <td colSpan={3} className={cx(s.removedBorderAndPadding)}><ViewScheduleBookingHistory data={data.scheduleBookingHistory} /></td>
                                    </tr>

                                }
                                {/* Rider Billing information */}
                                <tr>
                                    <td colSpan={4}>
                                        <b><FormattedMessage {...messages.riderBillingInformation} />:</b>
                                    </td>
                                </tr>
                                {this.renderAmountInformation(formatMessage(messages.rideFare), data.totalFare, currency)}
                                {this.renderAmountInformation(formatMessage(messages.riderServiceFee), data.riderServiceFee, currency)}
                                {
                                    data && data.isSpecialTrip === true && String(data.specialTripPrice) && this.renderAmountInformation(formatMessage(messages.specialTripPrice), data.specialTripPrice, currency, true, false, promoCode)
                                }
                                {
                                    data && String(data.tollFee) && Number(data.tollFee) > 0 && this.renderAmountInformation(formatMessage(messages.tollFee), data.tollFee, currency)
                                }
                                {
                                    data && data.isTipGiven === true && String(data.tipsAmount) && this.renderAmountInformation(formatMessage(messages.tipsGivenToDriver), data.tipsAmount, currency)
                                }
                                {
                                    data && String(riderTotalFare) && this.renderAmountInformation(formatMessage(messages.riderPayableAmount), riderTotalFare, currency, false, true)
                                }
                                {/* Driver Billing information */}
                                <tr>
                                    <td colSpan={4}>
                                        <b><FormattedMessage {...messages.driverBillingInformation} />:</b>
                                    </td>
                                </tr>
                                {this.renderAmountInformation(formatMessage(messages.rideFare), data.totalFare, currency)}
                                {this.renderAmountInformation(formatMessage(messages.driverServiceFee), data.driverServiceFee, currency, true)}
                                {
                                    data && String(data.tollFee) && Number(data.tollFee) > 0 && this.renderAmountInformation(formatMessage(messages.tollFee), data.tollFee, currency)
                                }
                                {
                                    data && data.isTipGiven === true && String(data.tipsAmount) && this.renderAmountInformation(formatMessage(messages.tipsReceivedFromRider), data.tipsAmount, currency)
                                }
                                {
                                    data && String(driverTotalFare) && this.renderAmountInformation(formatMessage(messages.driverEarnings), driverTotalFare, currency, false, true)
                                }
                                {/* Platform Earnings */}
                                <tr>
                                    <td colSpan={4}>
                                        <b><FormattedMessage {...messages.platformEarnings} />:</b>
                                    </td>
                                </tr>
                                {this.renderAmountInformation(formatMessage(messages.riderServiceFee), data.riderServiceFee, currency)}
                                {this.renderAmountInformation(formatMessage(messages.driverServiceFee), data.driverServiceFee, currency)}
                                {
                                    data && data.isSpecialTrip === true && String(data.specialTripPrice) && this.renderAmountInformation(formatMessage(messages.specialTripPrice), data.specialTripPrice, currency, true, false, promoCode)
                                }
                                {this.renderAmountInformation(formatMessage(messages.earnings), platformEarnings, currency, false, true)}
                                {
                                    this.isValueDefined(offeredEarnings) && offeredEarnings > 0 && this.renderAmountInformation(formatMessage(messages.platformOffered), offeredEarnings, currency, false, true)
                                }
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        )
    }
}
const mapState = state => ({
    locale: state.intl.locale
});

const mapDispatch = {
    openCancelBookingModal,
    openEditBookingModal
};

export default injectIntl(withStyles(s, bt)(connect(mapState, mapDispatch)(ViewBookingDetails)));