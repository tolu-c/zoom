import React, { Component } from 'react'
import withStyles from 'isomorphic-style-loader/withStyles';
import { Table, FormControl } from 'react-bootstrap';
import s from './BookingList.css';
import bt from '../../../components/commonStyle.css';
import { FormattedMessage, injectIntl } from 'react-intl';
import cx from 'classnames';
import messages from '../../../locale/messages';
import CustomPagination from '../../CustomPagination';
import { flowRight as compose } from 'lodash';
import PropTypes from 'prop-types';
import Link from '../../Link/Link';
import CurrencyConverter from '../../CurrencyConverter'
import { capitalizeFirstLetter } from '../../../helpers/capitalizeFirst';
import ExportImage from '../../../../public/Icons/export.png';
import debounce from '../../../helpers/debounce';

import { connect } from 'react-redux';
import Loader from '../../../components/Common/Loader';


export class CancelBookingList extends Component {
    static propTypes = {
        cancelledTrips: PropTypes.object,
    }
    constructor(props) {
        super(props)

        this.state = {
            currentPage: 1,
        }
        this.paginationData = this.paginationData.bind(this);
        this.handleKeywordSearch = debounce(this.handleKeywordSearch.bind(this), 250);
    }
    handleKeywordSearch(searchList) {
        const { cancelledTrips: { refetch } } = this.props
        let variables = {
            currentPage: 1,
            searchList
        }
        this.setState(variables)
        refetch(variables)
    }
    paginationData(currentPage) {
        const { cancelledTrips: { refetch } } = this.props;
        let variables = { currentPage };
        this.setState({ currentPage });
        refetch(variables);
    }
    render() {
        const { cancelledTrips, cancelledTrips: { getCancelledBookings }, loading } = this.props;
        const { currentPage, searchList } = this.state;
        const { formatMessage } = this.props.intl;
        let status = ['cancelledByRider', 'cancelledByDriver'];
        return (
            <div className={s.widthInner}>
                <div className={s.exportDisplay}>
                    <div className={cx(s.searchInput, 'searchInputRTL')} >
                        <FormControl type='text' placeholder={formatMessage(messages.searchOnly)} onChange={(e) => this.handleKeywordSearch(e.target && e.target.value)} className={bt.formControlInput} />
                    </div>
                    <div className={cx(s.exportTextSection, 'textAlignLeftRTL', 'textAlignRightMbRTL')}>

                        {
                            cancelledTrips && cancelledTrips.getCancelledBookings && cancelledTrips.getCancelledBookings.bookingData && cancelledTrips.getCancelledBookings.bookingData.length > 0 && <a
                                href={`/export-admin-data?type=bookings&status[0]=cancelledByRider&status[1]=cancelledByDriver&keyword=${searchList ? searchList : ''}`}
                                className={cx('pull-right', s.exportText)}>
                                <span className={cx(s.vtrMiddle, s.exportText, 'exportTextRTL')}><FormattedMessage {...messages.exportDataIntoCSV} /></span>
                                <span className={s.vtrTextBottom}>
                                    <img src={ExportImage} className={s.exportImg} />
                                </span>
                            </a>
                        }
                    </div>
                </div>
                {
                    loading && <div>
                        <Loader type="circle" />
                    </div>
                }
                {!loading &&
                <div className={cx(s.tableCss, 'tableCss', 'tableSticky', 'NewResponsiveTable')}>
                    <Table className="table">
                        <thead>
                            <tr>
                                <th scope="col"><FormattedMessage {...messages.id} /></th>
                                {/* <th scope="col"><FormattedMessage {...messages.pickUpLocation} /></th>
                                <th scope="col"><FormattedMessage {...messages.dropLocation} /></th> */}
                                <th scope="col"><FormattedMessage {...messages.riderName} /></th>
                                <th scope="col"><FormattedMessage {...messages.driverName} /></th>
                                <th scope="col"><FormattedMessage {...messages.category} /></th>
                                <th scope="col"><FormattedMessage {...messages.vehicleNumber} /></th>
                                <th scope="col"><FormattedMessage {...messages.tripStatus} /></th>
                                <th scope="col"><FormattedMessage {...messages.cancelReason} /></th>
                                {/* <th scope="col"><FormattedMessage {...messages.totalRideDistance} /></th>
                                <th scope="col"><FormattedMessage {...messages.totalDuration} /></th> */}
                                <th scope="col"><FormattedMessage {...messages.totalFare} /></th>
                                <th scope="col"><FormattedMessage {...messages.details} /></th>
                                <th scope="col"><FormattedMessage {...messages.chatLabel} /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                cancelledTrips && cancelledTrips.getCancelledBookings && cancelledTrips.getCancelledBookings.bookingData && cancelledTrips.getCancelledBookings.bookingData.length > 0 && cancelledTrips.getCancelledBookings.bookingData.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td data-label={formatMessage(messages.id)}>{item.id}</td>
                                            {/* <td data-label={formatMessage(messages.id)}>{item.pickUpLocation}</td>
                                            <td data-label={formatMessage(messages.id)}>{item.dropOffLocation}</td> */}
                                            <td data-label={formatMessage(messages.riderName)}>{item && item.riderDetails && capitalizeFirstLetter(item.riderDetails.firstName)}</td>
                                            <td data-label={formatMessage(messages.driverName)}>{item && item.driverDetails && capitalizeFirstLetter(item.driverDetails.firstName)}</td>
                                            <td data-label={formatMessage(messages.category)}>{item && item.categoryDetails && item.categoryDetails.categoryName}</td>
                                            <td data-label={formatMessage(messages.vehicleNumber)}>{item && item.vehicleNumber && item.vehicleNumber.toUpperCase()}</td>
                                            <td data-label={formatMessage(messages.tripStatus)}>{item.tripStatus && messages[item.tripStatus] ? formatMessage(messages[item.tripStatus]) : item.tripStatus}</td>
                                            <td data-label={formatMessage(messages.cancelReason)}>{item && item.cancelReason && capitalizeFirstLetter(item.cancelReason.reason)}</td>
                                            {/* <td data-label={formatMessage(messages.id)}>{item.totalRideDistance}</td>
                                            <td data-label={formatMessage(messages.id)}>{item.totalDuration}</td> */}
                                            <td data-label={formatMessage(messages.totalFare)}><CurrencyConverter from={item.currency} amount={item.totalFare} /></td>
                                            <td data-label={formatMessage(messages.details)}><Link to={'/siteadmin/cancelled-bookings/view/' + item.id}><FormattedMessage {...messages.view} /></Link></td>
                                            <td data-label={formatMessage(messages.chatLabel)}>
                                                {item.messageData && item.messageData.threadItemsCount > 0 && <Link to={'/siteadmin/cancelled-bookings/chat-message/' + item.id}><FormattedMessage {...messages.view} /></Link>}
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                            {
                                cancelledTrips && cancelledTrips.getCancelledBookings && cancelledTrips.getCancelledBookings.bookingData && cancelledTrips.getCancelledBookings.bookingData.length == 0 && (
                                    <tr>
                                        <td colspan="12" className={s.noRecords}><FormattedMessage {...messages.noResult} /></td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </Table>
                </div>
    }
                {
                    cancelledTrips && cancelledTrips.getCancelledBookings && cancelledTrips.getCancelledBookings.bookingData && cancelledTrips.getCancelledBookings.bookingData.length > 0
                    && <div className={cx(bt.space5, bt.spaceTop5)}>
                        <CustomPagination
                            total={cancelledTrips.getCancelledBookings.count}
                            currentPage={currentPage}
                            defaultCurrent={1}
                            defaultPageSize={10}
                            change={this.paginationData}
                            paginationLabel={formatMessage(messages.manageCancelledTrips)}
                        />
                    </div>
                }
            </div>
        )
    }
}
const mapState = (state) => ({
    loading: state.intl.loading
});
export default compose(injectIntl,
    withStyles(s, bt),
    connect(mapState),
)(CancelBookingList);

