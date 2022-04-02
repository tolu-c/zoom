import React, { Component } from 'react';
import {
    Field,
    reduxForm,
    formValueSelector,
    getFormSyncErrors,
    FieldArray
} from 'redux-form';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import moment from 'moment';
import cx from 'classnames';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from '../../../locale/messages';

import withStyles from 'isomorphic-style-loader/withStyles';
import s from './ManualBookingForm.css';
import {
    Form,
    FormGroup,
    FormControl,
    Button,
    Row,
    Col
} from 'react-bootstrap';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import Flatpickr from "react-flatpickr";

import PlaceGeoSuggest from '../../Common/PlaceGeoSuggest/PlaceGeoSuggest';
import Loader from '../../Common/Loader/Loader';
import SwitchButton from '../../Common/Switch';
import Link from '../../Link/Link';

import validate from './validate';
import isRiderExists from '../../../actions/siteadmin/ManualBooking/isRiderExists';
import getTripDetails from '../../../actions/siteadmin/ManualBooking/getTripDetails';

//images
import closeIcon from '../../../../public/Icons/close.png';
import clockIcon from '../../../../public/Icons/clock.svg';
import upArrow from '../../../../public/upArrow.svg';
import downArrow from '../../../../public/downArrow.svg';
import { flatPickerLocale } from '../../../helpers/flatPickerHelper';


class ManualBookingForm extends Component {

    flatPickerRef = undefined;

    state = {
        showDate: ''
    };

    componentDidUpdate(prevProps) {
        const { intl: { formatMessage, locale }, scheduleFrom } = this.props;
        const { locale: prevLocale } = prevProps.intl;
        if (locale !== prevLocale) {
            this.setState({ showDate: moment(scheduleFrom).locale(locale).format(`ddd, MMM D, [${formatMessage(messages.at)}] h:mma`) });
        }
    }

    changeDate = dates => {
        const { change, intl: { formatMessage, locale } } = this.props;
        if (dates && dates[0]) {
            change('scheduleFrom', dates[0]);
            this.setState({ showDate: moment(dates[0]).locale(locale).format(`ddd, MMM D, [${formatMessage(messages.at)}] h:mma`) });
        }
    };

    checkUserExists = () => {
        const {
            fieldErrors,
            isRiderExists,
            riderPhoneDialCode,
            riderPhoneNumber
        } = this.props;

        let errors = Object.assign({}, (fieldErrors || {}));

        if (errors.riderPhoneNumber) toastr.error("Error", "Invalid Phone Number");
        else isRiderExists({ phoneNumber: riderPhoneNumber, phoneDialCode: riderPhoneDialCode })
    };

    resetStepTwoFields = (isSwitchBookingType) => {
        const { change } = this.props;
        let resetFields = ['categories', 'totalDistance', 'totalDuration', 'bookingLocations', 'stepTwoCompleted', 'selectedCategory', 'selectedDriver', 'mapRouteDirections', 'mapMarkerPoints'];
        //To reset the field
        resetFields.map(field => change(field, null));
        if (isSwitchBookingType === true) {
            change('locations', null);
            change('scheduleFrom', null);
            //Math.random is used to get the UI updated, if the field (second from bottom) is removed.
            change('locations', [{ key: Math.random() }, { key: Math.random() }]);
        }
    };

    getTripData = () => {
        const { riderId, fieldErrors, touch, getTripDetails, locations, currency, distanceType, bookingType, riderEmail } = this.props;

        let keys = Object.keys(fieldErrors || {});

        if (fieldErrors.locations && fieldErrors.locations.length > 0) {
            fieldErrors.locations.map((item, index) => item && keys.push(`locations[${index}].data`));
        }

        if (keys.length > 0) {
            if (keys.length === 1 && keys.includes('scheduleFrom')) toastr.error("Error", "Please select a date");
            touch(...keys)
        }
        else {
            let data = locations.map(item => ({ lat: item.data.location.lat, lng: item.data.location.lng, location: item.data.label }));
            //Currency is initialized in the props of this component
            getTripDetails({
                variables: {
                    email: riderEmail,
                    riderId,
                    pickUpLat: data[0].lat,
                    pickUpLng: data[0].lng,
                    currency,
                    distanceType,
                    bookingType
                },
                locations: data
            });
        }
    }

    toogleStepOne = () => this.props.change('isStepOneClosed', !this.props.isStepOneClosed);

    toogleStepTwo = () => this.props.stepTwoEnabled && this.props.change('isStepTwoClosed', !this.props.isStepTwoClosed);

    onChangePhoneNumber = (value, event) => {
        const { change } = this.props;
        let phoneNumber = value.replace(/[^0-9]+/g, '').slice(event.dialCode.length);
        change('riderPhoneCountryCode', (event.countryCode.toUpperCase()));
        change('riderPhoneDialCode', `+${event.dialCode}`);
        change('riderPhoneNumber', phoneNumber);
        change('riderPhoneFieldValue', value);
    };

    switchBookingType = (bookingType) => {
        const { change } = this.props;
        change('bookingType', bookingType ? 2 : 1);
        this.setState({ showDate: '' });
        this.resetStepTwoFields(true);
    };

    openCalendar = () => this.flatPickerRef && this.flatPickerRef.flatpickr.open();

    renderFormControl = ({ input, type, label, disabled, className, meta: { touched, error } }) => (
        <div>
            <FormGroup>
                <div>
                    <FormControl disabled={disabled} {...input} placeholder={label} type={type} className={className} />
                    {touched && error && <span className={s.errorMessage}>{this.props.intl.formatMessage(error)}</span>}
                </div>
            </FormGroup>
        </div>
    );

    renderPlacesSuggest = ({ input, id, label, meta: { touched, error }, initialValue, className, isTouched, disabled }) => (
        <FormGroup className='bookingNowForm'>
            <PlaceGeoSuggest
                {...input}
                label={label}
                handleSelectSuggest={(data) => this.props.change(input.name, data || '')}
                disabled={disabled}
                initialValue={initialValue}
                id={id}
            />
            {isTouched && error && <span className={cx(s.errorMessage)}>{this.props.intl.formatMessage(error)}</span>}
        </FormGroup>
    );

    renderLocations = ({ fields, disabled, meta: { error, submitFailed }, className, label }) => fields.map((field, index) => {
        const { bookingType, locations, intl: { formatMessage }, locationsField } = this.props;
        let key = index === 0 && 'pickUpLocation' || 'dropLocation', today = moment();
        if (bookingType === 1 && index !== 0 && fields.length > 2) key = 'locationName';
        let maxLocationsCount = 4,
            isTouched = locationsField[index] && locationsField[index].data && locationsField[index].data.touched,
            isLastIndex = index === fields.length - 1;
        return (
            <div key={locations[index].key} >
                <div className={cx(s.flex, s.baseLine)}>
                    <Field
                        name={`${field}.data`}
                        type="text"
                        component={this.renderPlacesSuggest}
                        label={formatMessage(messages[key])}
                        isTouched={isTouched || false}
                        disabled={disabled}
                        autoComplete='off'
                        id={`geo_suggest_${index}`}
                        initialValue={locations[index].data && locations[index].data.label}
                    />
                    {bookingType === 1 && fields.length > 2 && index !== 0 && <Button disabled={disabled} onClick={() => fields.remove(index)} className={cx(s.deleteIcon, 'deleteIconRTL')}><img src={closeIcon} /></Button>}
                </div>
                {
                    bookingType === 1 && fields.length < maxLocationsCount && isLastIndex && (
                        <div className={'textAlignRightRTL'}> <Link noLink onClick={() => !disabled && fields.push({ key: Math.random() })} className={cx(s.addStopLink, [disabled ? s.disable : ''])}><span>&#43;</span>{formatMessage(messages.addStop)}</Link> </div>
                    )
                }
            </div>
        );
    });

    renderRiderInput = () => {
        const { riderId, stepTwoCompleted, intl: { formatMessage } } = this.props;
        return (
            <div>
                <Row>
                    <Col lg={6} md={6} sm={6} xs={12} className={cx(s.noPaddingLeft, 'noPaddingLeftRTL')}>
                        <Field
                            name="riderFirstName"
                            type="text"
                            label={formatMessage(messages.firstName)}
                            component={this.renderFormControl}
                            disabled={riderId || stepTwoCompleted}
                            className={s.formControl}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={6} xs={12} className={cx(s.noPaddingRight, 'noPaddingRightRTL')}>
                        <Field
                            name="riderLastName"
                            type="text"
                            label={formatMessage(messages.lastName)}
                            component={this.renderFormControl}
                            disabled={riderId || stepTwoCompleted}
                            className={s.formControl}
                        />
                    </Col>
                </Row>
                <div>
                    <Field
                        name="riderEmail"
                        type="text"
                        label={formatMessage(messages.email)}
                        component={this.renderFormControl}
                        disabled={riderId || stepTwoCompleted}
                        className={s.formControl}
                    />
                </div>
            </div>
        );
    };

    renderLocationInput = ({ disabled, bookingType }) => (
        <>
            <div className={s.bookingBtn}>
                <FormattedMessage {...messages.now} />
                <div className={s.toggleBtn}>
                    <SwitchButton
                        checked={bookingType === 2}
                        onChange={this.switchBookingType}
                        handleDiameter={30}
                        offColor='#000000'
                        onColor='#000000'
                        disabled={disabled}
                    />
                </div>
                <FormattedMessage {...messages.schedule} />
            </div>
            <FieldArray
                name="locations"
                component={this.renderLocations}
                disabled={disabled}
            />
        </>
    );

    render() {
        const { isStepTwoClosed, stepTwoEnabled, stepTwoCompleted, bookingType, intl: { formatMessage, locale }, loaders, riderPhoneFieldValue, isStepOneClosed } = this.props;
        const { showDate } = this.state;
        let today = moment();

        return (
            <div className={cx(s.dispatcherGrid, 'manualDispatcher')}>
                <div className={s.borderColor}>
                    <Form>
                        <div className={cx(s.stepOneHeading, 'textAlignRightRTL')} onClick={this.toogleStepOne}>
                            {formatMessage(messages.stepOneTitle)}
                            <img width={'35px'} src={!isStepOneClosed ? upArrow : downArrow} className={cx(s.arrow, 'arrowRTL')} />
                        </div>
                        {
                            !isStepOneClosed && <div className={s.stepOne}>
                                <PhoneInput
                                    value={riderPhoneFieldValue}
                                    country={'us'}
                                    label={formatMessage(messages.phoneNumber)}
                                    onChange={this.onChangePhoneNumber}
                                    countryCodeEditable={false}
                                    disabled={stepTwoEnabled}
                                    disableDropdown={stepTwoEnabled}
                                />
                                <div className={cx(s.textAlignRight, 'textAlignLeftRTL', 'loaderRTL')}>
                                    <Loader
                                        type={"button"}
                                        buttonType={"button"}
                                        className={cx(s.Button)}
                                        disabled={stepTwoEnabled}
                                        show={loaders && loaders.stepOne}
                                        label={formatMessage(messages.next)}
                                        handleClick={this.checkUserExists}
                                    />
                                </div>
                            </div>
                        }

                        {
                            stepTwoEnabled && <div className={cx(s.stepOneHeading, s.stepTwoHeadingMargin, 'textAlignRightRTL')} onClick={this.toogleStepTwo}>
                                {formatMessage(messages.bookingDetails)}
                                <img width={'35px'} src={stepTwoEnabled && !isStepTwoClosed ? upArrow : downArrow} className={cx(s.arrow, 'arrowRTL')} />
                            </div>
                        }
                        {
                            stepTwoEnabled && !isStepTwoClosed && <div className={s.stepTwoPadding}>
                                {this.renderRiderInput()}
                                {this.renderLocationInput({ disabled: stepTwoCompleted || (loaders && loaders.stepTwo), bookingType })}
                                {
                                    bookingType === 2 && (
                                        <>
                                            <div className={cx('customFlatpickr', s.flex)}>
                                                <Flatpickr
                                                    data-enable-time
                                                    ref={el => this.flatPickerRef = el}
                                                    options={{
                                                        disableMobile: 'true',
                                                        minDate: ((new Date()).getTime() + 1200000),
                                                        maxDate: today.add(31, 'day').format('YYYY-MM-DD'),
                                                        dateFormat: 'Y-m-d h:i K',
                                                        locale: locale ? flatPickerLocale[locale] : undefined
                                                    }}
                                                    onClose={this.changeDate}
                                                    disabled={stepTwoCompleted || (loaders && loaders.stepTwo)}
                                                />
                                                <Button disabled={stepTwoCompleted || (loaders && loaders.stepTwo)} onClick={this.openCalendar} className={cx(s.clockBtn, 'clockBtnRTL')}><img src={clockIcon} /></Button>
                                            </div>
                                            <span className={s.tripText}>{showDate && `${formatMessage(messages.tripScheduledOn)} ${showDate}`}</span>
                                        </>
                                    )
                                }
                                <div className={cx(s.textAlignRight, 'textAlignLeftRTL', 'loaderRTL')}>
                                    <Loader
                                        type={"button"}
                                        buttonType={"button"}
                                        className={cx(stepTwoCompleted ? s.btnSecondary : s.Button)}
                                        show={loaders && loaders.stepTwo}
                                        label={formatMessage(messages[stepTwoCompleted ? 'editAction' : 'next'])}
                                        handleClick={stepTwoCompleted ? this.resetStepTwoFields : this.getTripData}
                                        disabled={loaders.finalStep || loaders.reloadButton}
                                    />
                                </div>
                            </div>
                        }
                    </Form>
                </div>
            </div>
        );
    }
}

ManualBookingForm = reduxForm({
    form: 'ManualBookingForm', // a unique name for this form
    validate,
    shouldError: () => true
})(ManualBookingForm);

const selector = formValueSelector('ManualBookingForm');

const mapState = (state) => ({
    riderEmail: selector(state, 'riderEmail'),
    loaders: selector(state, 'loaders') || {},
    isStepOneClosed: selector(state, 'isStepOneClosed'),
    isStepTwoClosed: selector(state, 'isStepTwoClosed'),
    currency: selector(state, 'currency') || '',
    riderPhoneNumber: selector(state, 'riderPhoneNumber'),
    riderPhoneDialCode: selector(state, 'riderPhoneDialCode'),
    riderId: selector(state, 'riderId'),
    fieldErrors: getFormSyncErrors('ManualBookingForm')(state),
    stepTwoEnabled: selector(state, 'stepTwoEnabled'),
    bookingType: selector(state, 'bookingType'),
    stepTwoCompleted: selector(state, 'stepTwoCompleted'),
    locations: selector(state, 'locations'),
    riderPhoneFieldValue: selector(state, 'riderPhoneFieldValue') || '',
    scheduleFrom: selector(state, 'scheduleFrom') || '',
    distanceType: selector(state, 'distanceType') || '',
    locationsField: state.form && state.form.ManualBookingForm && state.form.ManualBookingForm.fields && state.form.ManualBookingForm.fields.locations || {}
});

const mapDispatch = {
    isRiderExists,
    getTripDetails
};

export default injectIntl(withStyles(s)(connect(mapState, mapDispatch)(ManualBookingForm)));