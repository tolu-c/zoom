import React, { Component } from 'react'
import withStyles from 'isomorphic-style-loader/withStyles';
import { Table, FormControl, Button } from 'react-bootstrap';
import s from './BookingList.css';
import bt from '../../../components/commonStyle.css';
import { FormattedMessage, injectIntl } from 'react-intl';
import cx from 'classnames';
import messages from '../../../locale/messages';
import CustomPagination from '../../CustomPagination';
import { graphql } from 'react-apollo';
import { flowRight as compose } from 'lodash';
import getAllBookings from './getAllBookings.graphql'
import PropTypes from 'prop-types';
import Link from '../../Link/Link';
import CurrencyConverter from '../../CurrencyConverter';
import { connect } from 'react-redux';

import ExportImage from '../../../../public/Icons/export.png';

//Helpers
import { capitalizeFirstLetter } from '../../../helpers/capitalizeFirst'
import debounce from '../../../helpers/debounce';

import Loader from '../../../components/Common/Loader';

export class BookingList extends Component {
    static propTypes = {
        bookingDetails: PropTypes.object,
        bookingType: PropTypes.number,
        manualBooking: PropTypes.bool
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
        const { bookingDetails: { refetch } } = this.props
        let variables = {
            currentPage: 1,
            searchList
        }
        this.setState(variables)
        refetch(variables)
    }
    paginationData(currentPage) {
        const { bookingDetails: { refetch } } = this.props;
        let variables = { currentPage };
        this.setState({ currentPage });
        refetch(variables);
    }
    createBookingButton = () => (
        <Link to={'/siteadmin/manual-bookings/create'}>
            <div className={cx(bt.noPadding, s.buttonMargin, 'textAlignRightRTL')}>
                <Button className={cx(bt.btnPrimary, s.marginBottom20)}>
                    <FormattedMessage {...messages.addNewLabel} />
                </Button>
            </div>
        </Link>
    );
    render() {
        const { bookingDetails, bookingDetails: { getAllBookings }, bookingType, loading, isManualBooking } = this.props;
        const { currentPage, searchList } = this.state;
        const { formatMessage } = this.props.intl;

        let exportType = bookingType === 1 ? 'bookings' : 'schedule-bookings';
        if (isManualBooking) exportType = 'manual-bookings'

        return (
            <div className={s.widthInner}>
                <div className={s.exportDisplay}>
                    <div className={cx(s.searchInput, 'searchInputRTL')}>
                        <FormControl type='text' placeholder={formatMessage(messages.searchOnly)} onChange={(e) => this.handleKeywordSearch(e.target && e.target.value)} className={bt.formControlInput} />
                    </div>

                    <div className={cx(s.exportTextSection, 'textAlignLeftRTL', 'textAlignRightMbRTL')}>
                        {
                            bookingDetails && bookingDetails.getAllBookings && bookingDetails.getAllBookings.bookingData && bookingDetails.getAllBookings.bookingData.length > 0 && <a
                                href={`/export-admin-data?type=${exportType}&keyword=${searchList ? searchList : ''}`}
                                className={cx('pull-right', s.exportText, 'exportTextBookingRTL')}>
                                <span className={cx(s.vtrMiddle, s.exportText, 'exportTextRTL')}><FormattedMessage {...messages.exportDataIntoCSV} /></span>
                                <span className={s.vtrTextBottom}>
                                    <img src={ExportImage} className={s.exportImg} />
                                </span>
                            </a>
                        }
                        <div className={cx(s.floatRight, 'floatLeftRTL')}>{isManualBooking && this.createBookingButton()}</div>
                    </div>
                </div>
                
                <div class="clearfix"></div>
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
                                    {/* <th scope="col"><FormattedMessage {...messages.totalRideDistance} /></th>
                                <th scope="col"><FormattedMessage {...messages.totalDuration} /></th> */}
                                    <th scope="col"><FormattedMessage {...messages.totalFare} /></th>
                                    <th scope="col"><FormattedMessage {...messages.tollFee} /></th>
                                    <th scope="col"><FormattedMessage {...messages.details} /></th>
                                    {!isManualBooking && <th scope="col"><FormattedMessage {...messages.chatLabel} /></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    bookingDetails && bookingDetails.getAllBookings && bookingDetails.getAllBookings.bookingData && bookingDetails.getAllBookings.bookingData.length > 0 && bookingDetails.getAllBookings.bookingData.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td data-label={formatMessage(messages.id)}>{item.id}</td>
                                                <td data-label={formatMessage(messages.riderName)}>{item && item.riderDetails && capitalizeFirstLetter(item.riderDetails.firstName)}</td>
                                                <td data-label={formatMessage(messages.driverName)}>{item && item.driverDetails && capitalizeFirstLetter(item.driverDetails.firstName)}</td>
                                                <td data-label={formatMessage(messages.category)}>{item && item.categoryDetails && item.categoryDetails.categoryName}</td>
                                                <td data-label={formatMessage(messages.vehicleNumber)}>{item && item.vehicleNumber && item.vehicleNumber.toUpperCase()}</td>
                                                <td data-label={formatMessage(messages.tripStatus)}>{item.tripStatus && messages[item.tripStatus] ? formatMessage(messages[item.tripStatus]) : item.tripStatus}</td>
                                                {/* <td data-label={formatMessage(messages.id)}>{item.totalRideDistance}</td>
                                            <td data-label={formatMessage(messages.id)}>{item.totalDuration}</td> */}
                                                <td data-label={formatMessage(messages.totalFare)}><CurrencyConverter from={item.currency} amount={item.totalFare} /></td>
                                                <td data-label={formatMessage(messages.tollFee)}><CurrencyConverter from={item.currency} amount={item.tollFee} /></td>
                                                <td data-label={formatMessage(messages.details)}>
                                                    <Link to={'/siteadmin/' + (exportType) + '/view/' + item.id}><FormattedMessage {...messages.view} /></Link></td>
                                                {
                                                    !isManualBooking && <td data-label={formatMessage(messages.chatLabel)}>
                                                        {item.messageData && item.messageData.threadItemsCount > 0 && <Link to={'/siteadmin/' + (exportType) + '/chat-message/' + item.id}><FormattedMessage {...messages.view} /></Link>}
                                                    </td>
                                                }
                                            </tr>
                                        )
                                    })
                                }
                                {
                                    bookingDetails && bookingDetails.getAllBookings && bookingDetails.getAllBookings.bookingData && bookingDetails.getAllBookings.bookingData.length == 0 && (
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
                    bookingDetails && bookingDetails.getAllBookings && bookingDetails.getAllBookings.bookingData && bookingDetails.getAllBookings.bookingData.length > 0
                    && <div className={cx(bt.space5, bt.spaceTop5)}>
                        <CustomPagination
                            total={bookingDetails.getAllBookings.count}
                            currentPage={currentPage}
                            defaultCurrent={1}
                            defaultPageSize={10}
                            change={this.paginationData}
                            paginationLabel={formatMessage(messages.bookings)}
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
    graphql(getAllBookings, {
        name: 'bookingDetails',
        options: (props) => ({
            variables: {
                currentPage: 1,
                searchList: '',
                bookingType: props.bookingType,
                isManualBooking: props.isManualBooking
            },
            fetchPolicy: 'network-only'
        }),
    })
)(BookingList);