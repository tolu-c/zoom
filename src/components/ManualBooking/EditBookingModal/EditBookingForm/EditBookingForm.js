import React, { Component } from 'react';
import {
  FieldArray,
  reduxForm,
  formValueSelector,
  getFormSyncErrors,
  Field
} from 'redux-form';
import Flatpickr from "react-flatpickr";
import moment from 'moment';

import { injectIntl } from 'react-intl';
import messages from '../../../../locale/messages';

import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';

import { FormGroup, Button, FormControl } from 'react-bootstrap';
import withStyles from 'isomorphic-style-loader/withStyles';
import cx from 'classnames';
import s from './EditBookingForm.css';
import bt from '../../../../components/commonStyle.css';

import PlaceGeoSuggest from '../../../Common/PlaceGeoSuggest/PlaceGeoSuggest';
import Loader from '../../../Common/Loader/Loader';
import Link from '../../../Link/Link';

import onSubmit from './submit';
import validate from './validate';

//images
import closeIcon from '../../../../../public/Icons/close.png';
import clockIcon from '../../../../../public/Icons/clock.svg';

import { flatPickerLocale } from '../../../../helpers/flatPickerHelper';
import { isRTL } from '../../../../helpers/formatLocale';

class EditBookingForm extends Component {
  flatPickerRef = undefined;

  state = {
    showDate: ''
  };

  componentDidMount() {
    const { intl: { locale, formatMessage }, scheduleFromField } = this.props;
    this.setState({ showDate: moment(scheduleFromField).locale(isRTL(locale) ? locale : 'en').format(`ddd, MMM D, [${formatMessage(messages.at)}] h:mma`) });
  }

  componentDidUpdate(prevProps) {
    const { intl: { locale, formatMessage }, scheduleFromField } = this.props;
    const { locale: prevLocale } = prevProps.intl;
    if (locale !== prevLocale) {
      this.setState({ showDate: moment(scheduleFromField).locale(isRTL(locale) ? locale : 'en').format(`ddd, MMM D, [${formatMessage(messages.at)}] h:mma`) });
    }
  }

  openCalendar = () => this.flatPickerRef && this.flatPickerRef.flatpickr.open();

  changeDate = dates => {
    const { change, intl: { formatMessage, locale } } = this.props;
    if (dates && dates[0]) {
      change('scheduleFrom', dates[0]);
      this.setState({ showDate: moment(dates[0]).locale((isRTL(locale) ? locale : 'en')).format(`ddd, MMM D, [${formatMessage(messages.at)}] h:mma`) });
    }
  };

  handleUpdate = () => {
    const { submit, fieldErrors, touch } = this.props;
    let keys = Object.keys(fieldErrors || {});

    if (fieldErrors.locationsInput && fieldErrors.locationsInput.length > 0) {
      fieldErrors.locationsInput.map((item, index) => item && keys.push(`locationsInput[${index}].data`));
    }

    if (keys.length === 1 && keys.includes('scheduleFromField')) toastr.error("Error", "Please select a date");
    if (keys.length > 0) touch(...keys);
    else submit();

  };

  renderField = ({ input, type, meta: { touched, error }, labelClass, fieldClass, placeholder, disabled }) => {
    const { formatMessage } = this.props.intl;
    return (
      <FormGroup className={s.noMargin}>
        <FormControl {...input} type={type} className={cx(bt.formControlInput, s.cursorDisable)} disabled={disabled} />
        {touched && error && <span className={cx(bt.errorMessage, s.position)}>{formatMessage(error)}</span>}
      </FormGroup>
    );
  }

  renderDatePicker = () => {
    const { scheduleFromField, loading, intl: { locale } } = this.props;
    let today = moment();
    return (
      <div className={cx(s.flex, 'customFlatpickr editcustomFlatpickr')}>
        <Flatpickr
          data-enable-time
          ref={el => this.flatPickerRef = el}
          options={{
            disableMobile: 'true',
            static: true,
            minDate: ((new Date()).getTime() + 1200000),
            maxDate: today.add(31, 'day').format('YYYY-MM-DD'),
            dateFormat: 'Y-m-d h:i K',
            locale: locale ? flatPickerLocale[locale] : undefined
          }}
          onClose={this.changeDate}
          defaultValue={moment(scheduleFromField).format('YYYY-MM-DD HH:mm a')}
        />
        <Button disabled={loading} onClick={this.openCalendar} className={cx(s.clockBtn, 'clockBtnRTL')}><img src={clockIcon} /></Button>
      </div>
    );
  };

  renderPlacesSuggest = ({ input, id, label, meta: { touched, error }, className, isTouched, disabled, initialValue }) => (
    <FormGroup className='bookingNowForm'>
      <PlaceGeoSuggest
        {...input}
        label={label}
        handleSelectSuggest={(data) => this.props.change(input.name, data || '')}
        disabled={disabled}
        onSuggestNoResults={(data) => this.props.change(input.name, {})}
        initialValue={initialValue}
        id={id}
      />
      {isTouched && error && <span className={cx(bt.errorMessage)}>{this.props.intl.formatMessage(error)}</span>}
    </FormGroup>
  );

  renderLocations = ({ fields, disabled, meta: { error, submitFailed }, className, label }) => fields.map((field, index) => {
    const { locationsInput, intl: { formatMessage }, locationsField } = this.props;
    let key = fields.length === 1 && 'dropLocation' || 'locationName', maxLocationsCount = 3, startIndex = 1,
      isTouched = locationsField[index] && locationsField[index].data && locationsField[index].data.touched,
      isLastIndex = index === fields.length - 1,
      isDisable = locationsInput[index].data && locationsInput[index].data.disabled,
      disabledArray = locationsInput.filter(item => item && item.data && item.data.disabled);

    startIndex = startIndex + disabledArray.length;

    return (
      <div key={locationsInput[index].key} >
        <div className={cx(s.flex, s.baseLine)}>
          <Field
            id={`geo_suggest_${index}`}
            name={`${field}.data`}
            type="text"
            component={this.renderPlacesSuggest}
            label={formatMessage(messages[key])}
            isTouched={isTouched || false}
            disabled={isDisable}
            initialValue={locationsInput[index].data && locationsInput[index].data.label}
            autoComplete='off'
          />
          {!isDisable && fields.length > startIndex && <Button disabled={isDisable} onClick={() => fields.remove(index)} className={cx(s.deleteIcon, 'editdeleteIconRTL')}><img src={closeIcon} /></Button>}
        </div>
        {
          fields.length < maxLocationsCount && isLastIndex && (
            <div className={'textAlignRightRTL'}> <Link noLink onClick={() => fields.push({ key: Math.random() })} className={s.addStopLink}><span>&#43;</span>{formatMessage(messages.addStop)}</Link> </div>
          )
        }
      </div>
    );
  });

  render() {
    const { booking: { tripStatus }, loading, intl: { formatMessage } } = this.props;
    const { showDate } = this.state;

    return (
      <div className={cx('maxwidthcenter', 'empty')}>
        <form>
          {tripStatus === 'scheduled' &&
            <>
              {this.renderDatePicker()}
              <span className={s.tripText}>{showDate && `${formatMessage(messages.tripScheduledOn)} ${showDate}`}</span>
            </>
          }
          {
            tripStatus !== 'scheduled' && <>
              <Field
                name={'pickUpField'}
                type="text"
                component={this.renderField}
                disabled={true}
              />
              <FieldArray name="locationsInput" component={this.renderLocations} />
            </>
          }
          <div className={cx(s.textAlignRight, 'textAlignLeftRTL', 'loaderRTL')}>
            <Loader
              type={"button"}
              buttonType={"button"}
              show={loading}
              className={cx(s.Button)}
              label={formatMessage(messages.update)}
              handleClick={this.handleUpdate}
            />
          </div>
        </form>
      </div>
    );
  }
}

EditBookingForm = reduxForm({
  shouldError: () => true,
  form: "EditBookingForm", // a unique name for this form
  validate,
  onSubmit
})(EditBookingForm);

const selector = formValueSelector('EditBookingForm');

const mapState = (state) => ({
  scheduleFromField: selector(state, 'scheduleFromField'),
  booking: selector(state, 'booking') || {},
  loading: selector(state, 'loading'),
  locationsInput: selector(state, 'locationsInput'),
  fieldErrors: getFormSyncErrors('EditBookingForm')(state),
  locationsField: state.form && state.form.EditBookingForm && state.form.EditBookingForm.fields && state.form.EditBookingForm.fields.locationsInput || {}
});

const mapDispatch = {};

export default injectIntl(withStyles(s, bt)(connect(mapState, mapDispatch)(EditBookingForm)));