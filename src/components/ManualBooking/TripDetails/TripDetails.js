import React, { Component } from 'react';
import { change, formValueSelector, reset } from 'redux-form';
import { connect } from 'react-redux';
import Swiper from 'react-id-swiper';
import { FormControl } from 'react-bootstrap';
import moment from 'moment';

import { FormattedMessage, injectIntl } from 'react-intl';
import messages from '../../../locale/messages';

import CurrencyConverter from '../../CurrencyConverter';
import CustomCheckbox from '../../Common/CustomCheckbox';
import ShowMap from '../../Common/ShowMap/ShowMap';
import Loader from '../../Common/Loader/Loader';

import withStyles from 'isomorphic-style-loader/withStyles';
import s from './TripDetails.css';
import cx from 'classnames';
import bt from '../../../components/commonStyle.css';

import createBooking from '../../../actions/siteadmin/ManualBooking/createBooking';
import getTripDetails from '../../../actions/siteadmin/ManualBooking/getTripDetails';

import { api } from "../../../config";

//imgaes
import assignIcon from '../../../../public/Icons/assignDriver.svg';
import tickIcon from '../../../../public/Icons/tickIcon.png';
import referIcon from '../../../../public/Icons/referIcon.png';
import startIcon from '../../../../public/Icons/starIcon.svg';
import driverAvatar from '../../../../public/Icons/driverAvatar.svg';

class TripDetails extends Component {

    state = { isUpdate: false };

    componentDidUpdate(prevProps) {
        const { locale } = this.props.intl;
        const { locale: prevLocale } = prevProps.intl;
        if (locale !== prevLocale) {
            this.setState({ isUpdate: true });
            clearTimeout(this.loadSync);
            this.loadSync = null;
            this.loadSync = setTimeout(() => this.setState({ isUpdate: false }), 450);
        }
    }

    getFormattedDistance = (distance, distanceType) => {
        let unit = distanceType;
        const { formatMessage } = this.props.intl;
        if (distanceType === 'mile' && distance > 1) unit = 'miles'
        return `${distance.toFixed(2)} ${messages[unit] ? formatMessage(messages[unit]) : distanceType}`
    }

    handleCategory = (category) => {
        const { change } = this.props;
        change('ManualBookingForm', 'selectedCategory', category);
        change('ManualBookingForm', 'selectedDriver', category.nearByDrivers && category.nearByDrivers[0]);
        change('ManualBookingForm', 'searchDriver', '');
    };

    handleDriver = (driver) => !this.props.loaders.finalStep && this.props.change('ManualBookingForm', 'selectedDriver', driver);

    handleDriverAssign = (isAutoAssign) => {
        const { change } = this.props;
        change('ManualBookingForm', 'manualAssignDriver', !isAutoAssign);
        change('ManualBookingForm', 'searchDriver', '');
    };

    handleReload = () => {
        const {
            riderId,
            bookingLocations,
            totalDistance,
            totalDuration,
            currency,
            distanceType,
            bookingType,
            loaders,
            getTripDetails,
            change
        } = this.props;
        if (!loaders.finalStep && !loaders.reloadButton) {
            change('ManualBookingForm', 'selectedCategory', null);
            change('ManualBookingForm', 'selectedDriver', null);
            change('ManualBookingForm', 'searchDriver', '');
            getTripDetails({
                variables: {
                    riderId,
                    pickUpLat: bookingLocations[0].locationLat,
                    pickUpLng: bookingLocations[0].locationLng,
                    totalDistance,
                    totalDuration,
                    currency,
                    distanceType,
                    bookingType
                },
                isReload: true
            });
        }
    };

    handleBookbutton = () => {
        const {
            riderId,
            selectedDriver,
            selectedCategory,
            totalDistance,
            totalDuration,
            riderFirstName,
            riderLastName,
            riderEmail,
            riderPhoneDialCode,
            riderPhoneNumber,
            riderPhoneCountryCode,
            currency,
            distanceType,
            bookingLocations,
            bookingType,
            manualAssignDriver,
            createBooking,
            scheduleFrom
        } = this.props;
        createBooking({
            riderId,
            driverId: manualAssignDriver && selectedDriver.id || '',
            categoryId: selectedCategory.id,
            totalDistance,
            totalDuration,
            firstName: riderFirstName,
            lastName: riderLastName,
            email: riderEmail,
            phoneDialCode: riderPhoneDialCode,
            phoneNumber: riderPhoneNumber,
            phoneCountryCode: riderPhoneCountryCode,
            currency,
            distanceType,
            bookingLocations,
            bookingType,
            scheduleFrom: bookingType === 2 && moment(scheduleFrom).unix() || undefined
        });
    };

    handleResetbutton = () => {
        const { reset, change, riderPhoneDialCode } = this.props;
        reset('ManualBookingForm');
        change('ManualBookingForm', 'riderPhoneFieldValue', riderPhoneDialCode && riderPhoneDialCode.slice(1))
    };

    handleSearchDriver = (e) => this.props.change('ManualBookingForm', 'searchDriver', e.target && e.target.value || '');

    showDriverDetails = (nearByDrivers) => {
        const { intl: { formatMessage }, searchDriver, selectedDriver } = this.props;

        if (searchDriver) {
            nearByDrivers = nearByDrivers.filter(
                driver => driver && (driver.profile && driver.profile.firstName && driver.profile.firstName.toString().includes(searchDriver) ||
                    driver.phoneNumber && driver.phoneNumber.toString().includes(searchDriver))
            );
        }

        return (
            <div>
                <div className={s.positionSticky}>
                    <div className={cx(s.assignDriverText, 'textAlignRightRTL')}><FormattedMessage {...messages.assignDriver} /></div>
                    <div className='searchDriver'>
                        <FormControl type='text' placeholder={formatMessage(messages.searchDriverName)} onChange={this.handleSearchDriver} className={s.driverSearch} />
                    </div>
                </div>
                {nearByDrivers.length <= 0 && <div className={s.noDriverFound}>{formatMessage(messages.noDriverFound)}</div>}

                {nearByDrivers.length > 0 && nearByDrivers.map((driver, key) => {
                    let isSelected = selectedDriver && selectedDriver.id === driver.id;
                    return (
                        <div
                            onClick={() => this.handleDriver(driver)}
                            key={key}
                        >
                            <div className={s.displayFlexDriver}>
                                <div className={s.positionRelative}>
                                    <img src={driver && driver.profile && driver.profile.picture ? `${api.apiEndpoint}/images/avatar/${driver.profile.picture}` : driverAvatar} className={s.driverImage} />
                                    {isSelected && <div className={cx(s.tickIcon, 'tickIconRTL')}><img src={tickIcon} /></div>}
                                </div>
                                <div className={cx(s.autoAssignText, 'autoAssignTextRTL')}>
                                    <div className={cx({ [s.hoverHidden]: !isSelected })}>
                                        <div>
                                            <span className={s.driverName}>{driver && driver.profile && driver.profile.firstName}</span>
                                            <span className={cx(s.reviewText, 'reviewTextRTL')}>({driver && driver.overallRating && driver.overallRating.toFixed(1) || 0} <span className={s.startIcon}><img src={startIcon} /></span>)</span>
                                        </div>
                                        <div className={s.driverNumber}>{driver && `${driver.phoneDialCode || ''} ${driver.phoneNumber || ''}`}</div>
                                    </div>
                                    {
                                        !isSelected && <div className={s.hoverVisible}>
                                            <span><img src={assignIcon} /></span>
                                            <span className={cx(s.assignText, 'assignTextRTL')}><FormattedMessage {...messages.assign} /></span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    )
                })
                }
            </div>
        );
    };

    showCategories = (categories) => {
        const { selectedCategory, selectedDriver, currency } = this.props;
        const { isUpdate } = this.state;
        const params = {
            slidesPerView: 4,
            breakpoints: {
                768: {
                    slidesPerView: '3',
                },
                640: {
                    slidesPerView: '2',
                    centeredSlides: true,
                }
            }
        };

        let specificParams = {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        };

        if (categories) {
            if (categories.length > 4) params['navigation'] = specificParams;
            else if (typeof window !== 'undefined') {
                if ((window.matchMedia('(max-width: 768px) and (min-width: 640px)').matches && categories.length > 3)
                    || (window.matchMedia('(max-width: 640px)').matches && categories.length > 1)) {
                    params['navigation'] = specificParams;
                }
            }
        }

        return (
            <div className={'manualBookingSlider'}>
                <Swiper {...params} rebuildOnUpdate={isUpdate} >
                    {
                        categories.map((category, key) => {
                            const { loaders, bookingType, intl: { formatMessage } } = this.props;
                            let nearByDriver = category && category.nearByDrivers && category.nearByDrivers[0],
                                isSelected = selectedCategory && selectedCategory.id === category.id;

                            if (isSelected) nearByDriver = selectedDriver;

                            let havingDuration = nearByDriver && bookingType === 1 && nearByDriver.durationToReachRider;

                            return (
                                <div className={cx({ [s.disabledCategory]: !nearByDriver && bookingType === 1 })} onClick={() => (nearByDriver || bookingType === 2) && !loaders.finalStep && !loaders.reloadButton && this.handleCategory(category, key)} key={key}>
                                    {!nearByDriver && bookingType === 1 && <div className={s.vehicalTime}><FormattedMessage {...messages.noCabs} /></div>}
                                    {havingDuration && `${nearByDriver.durationToReachRider}`}
                                    {nearByDriver && bookingType === 1 && !havingDuration && `-`}
                                    {category && category.categoryImage && <div className={cx(s.vehicalImages, 'vehicalImages', { [s.activeBorder]: isSelected }, { ['disableBorder']: !nearByDriver && bookingType === 1 })}><img src={`${api.apiEndpoint}/images/category/${category.categoryImage}`} /></div>}
                                    <div className={s.vehicalType}>{category && category.categoryName}</div>
                                    <div className={s.vehicalPricing}>{category && category.priceDetails && <CurrencyConverter from={currency} amount={category.priceDetails.riderPayableFare || 0} />}</div>
                                </div>
                            );
                        })
                    }
                </Swiper>
            </div>
        );
    };

    showInformation = (information, key) => {
        const { currency, intl: { formatMessage } } = this.props;
        return (
            <div key={key} className={s.showInformation}>
                <div>{formatMessage(messages[information.messageKey])}</div>
                <div>
                    {information.messageKey !== 'capacity' && information.value && !isNaN(information.value) && <CurrencyConverter from={currency} amount={(information.value.toFixed(2))} />}
                    {(information.messageKey === 'capacity' || !information.value || isNaN(information.value)) && information.value}
                </div>
            </div>
        );
    }

    render() {
        const {
            intl: { formatMessage },
            mapRouteDirections,
            manualAssignDriver,
            mapMarkerPoints,
            selectedCategory,
            stepTwoCompleted,
            totalDistance,
            totalDuration,
            distanceType,
            bookingType,
            categories,
            loaders
        } = this.props;

        let nearByDrivers = selectedCategory && selectedCategory.nearByDrivers || [],
            pricingDetails = selectedCategory && selectedCategory.priceDetails || {};

        let estimationDetails = [
            { messageKey: 'distance', value: (!totalDistance ? '' : this.getFormattedDistance(totalDistance, distanceType)) },
            { messageKey: 'duration', value: (!totalDuration ? '' : `${totalDuration.toFixed(2)} ${formatMessage(messages.minutesShort)}`) },
            { messageKey: 'travelFare', value: pricingDetails.totalFare },
            { messageKey: 'bookingFee', value: pricingDetails.riderServiceFee },
            { messageKey: 'total', value: pricingDetails.riderPayableFare }
        ],
            categoryPricing = [
                { messageKey: 'capacity', value: selectedCategory && selectedCategory.capacity },
                { messageKey: 'baseFare', value: pricingDetails.basePrice },
                { messageKey: distanceType === 'km' ? 'perKm' : 'perMile', value: pricingDetails.unitPrice },
                { messageKey: 'perMinute', value: pricingDetails.minutePrice }
            ];

        return (
            <div>
                <div className={s.mapBox}>
                    <div className={s.positionRelative}>
                        <ShowMap mapRouteDirections={mapRouteDirections} mapMarkerPoints={mapMarkerPoints} />
                        {
                            stepTwoCompleted && bookingType === 1 && nearByDrivers.length > 0 && <div className={cx(s.autoAssign, 'autoAssignRTL')}>
                                <CustomCheckbox
                                    className={'icheckbox_square-green'}
                                    value={!manualAssignDriver}
                                    name={`Auto Assign`}
                                    checked={!manualAssignDriver}
                                    onChange={this.handleDriverAssign}
                                />
                                <span className={cx(s.autoAssignText, 'autoAssignTextRTL')}><FormattedMessage {...messages.autoAssign} /></span>
                            </div>
                        }

                        {
                            stepTwoCompleted && bookingType === 1 && nearByDrivers.length > 0 && manualAssignDriver &&
                            <div className={cx(s.searchDriver, 'searchDriverRTL')}>{this.showDriverDetails(nearByDrivers)}</div>
                        }
                        {
                            stepTwoCompleted &&
                            <>
                                {!loaders.reloadButton && <div onClick={this.handleReload} className={cx(s.referIcon, 'referIconRTL')}><img src={referIcon} /></div>}
                                {loaders.reloadButton && <div className={cx(s.referIcon, 'referIconRTL', s.mapLoader, 'mapLoaderRTL', 'loaderRTL')}><Loader type="circle" show={true} /></div>}
                            </>
                        }

                    </div>

                    {stepTwoCompleted && categories && categories.length > 0 && this.showCategories(categories)}
                </div>
                {
                    stepTwoCompleted && selectedCategory && selectedCategory.id && (
                        <div>
                            <div className={s.showInformationBox}>
                                {categoryPricing.map(this.showInformation)}
                                <div className={cx(s.headingText, 'headingTextRTL')}>
                                    <FormattedMessage {...messages.fareEstimation} />
                                </div>
                                {estimationDetails.map(this.showInformation)}
                            </div>
                            <div className={cx(s.flexBtn, 'loaderRTL')}>
                                <Loader
                                    type={"button"}
                                    buttonType={"button"}
                                    className={cx(s.Button, bt.btnSecondary, s.secondaryBtn, 'secondaryBtnRTL')}
                                    label={formatMessage(messages.reset)}
                                    handleClick={this.handleResetbutton}
                                />
                                <Loader
                                    type={"button"}
                                    buttonType={"button"}
                                    className={cx(s.Button, bt.btnPrimary)}
                                    show={loaders && loaders.finalStep}
                                    label={formatMessage(messages[bookingType === 2 ? 'scheduleNow' : 'bookNow'])}
                                    handleClick={this.handleBookbutton}
                                />
                            </div>
                        </div>
                    )
                }
            </div >
        );
    }
}

const selector = formValueSelector('ManualBookingForm');

const mapState = (state) => ({
    loaders: selector(state, 'loaders') || {},
    riderId: selector(state, 'riderId'),
    currency: selector(state, 'currency'),
    categories: selector(state, 'categories'),
    bookingType: selector(state, 'bookingType'),
    distanceType: selector(state, 'distanceType'),
    searchDriver: selector(state, 'searchDriver') || '',
    totalDistance: selector(state, 'totalDistance'),
    totalDuration: selector(state, 'totalDuration'),
    selectedDriver: selector(state, 'selectedDriver'),
    mapMarkerPoints: selector(state, 'mapMarkerPoints'),
    stepTwoCompleted: selector(state, 'stepTwoCompleted'),
    selectedCategory: selector(state, 'selectedCategory'),
    manualAssignDriver: selector(state, 'manualAssignDriver'),
    mapRouteDirections: selector(state, 'mapRouteDirections'),
    riderPhoneDialCode: selector(state, 'riderPhoneDialCode'),
    riderFirstName: selector(state, 'riderFirstName'),
    riderLastName: selector(state, 'riderLastName'),
    riderEmail: selector(state, 'riderEmail'),
    riderPhoneCountryCode: selector(state, 'riderPhoneCountryCode'),
    riderPhoneNumber: selector(state, 'riderPhoneNumber'),
    bookingLocations: selector(state, 'bookingLocations'),
    scheduleFrom: selector(state, 'scheduleFrom')
});

const mapDispatch = {
    change,
    reset,
    createBooking,
    getTripDetails
};

export default injectIntl(withStyles(s, bt)(connect(mapState, mapDispatch)(TripDetails)));