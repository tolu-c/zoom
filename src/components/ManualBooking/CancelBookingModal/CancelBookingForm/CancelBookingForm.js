import React, { Component } from 'react';
import { Field, reduxForm, formValueSelector } from 'redux-form';

import { injectIntl } from 'react-intl';
import messages from '../../../../locale/messages';

import { connect } from 'react-redux';

import { Form } from 'react-bootstrap';
import withStyles from 'isomorphic-style-loader/withStyles';
import cx from 'classnames';
import s from './CancelBookingForm.css';
import bt from '../../../../components/commonStyle.css';

import Loader from '../../../Common/Loader/Loader';

import onSubmit from './submit';
import validate from './validate';

class CancelBookingForm extends Component {

  renderTextAreaField = ({ input, label, type, meta: { touched, error }, children, labelClass, fieldClass, placeholder }) => {
    const { formatMessage } = this.props.intl;
    return (
      <Form.Group>
        <label className={bt.labelText} >{label}</label>
        <Form.Control as="textarea" rows="3" {...input} placeholder={placeholder} type={type} className={fieldClass} />
        {touched && error && <span className={bt.errorMessage}>{formatMessage(error)}</span>}
      </Form.Group>
    );
  };

  render() {
    const { handleSubmit, booking: { tripStatus }, intl: { formatMessage }, loading } = this.props;
    return (
      <div className={cx('maxwidthcenter', 'empty')}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {
            tripStatus === 'scheduled' && <div className={s.textAlignCenter}>{formatMessage(messages.cancelScheduleMessage)}</div>
          }
          {
            tripStatus !== 'scheduled' && <Field
              name="reasonField"
              type="text"
              placeholder={formatMessage(messages.reason)}
              component={this.renderTextAreaField}
              label={formatMessage(messages.reason)}
              labelClass={bt.labelText}
              fieldClass={bt.formControlInput}
            />
          }
          <div className={cx(s.textAlignCenter, s.marginTop, 'loaderRTL')}>
            <Loader
              type={"button"}
              buttonType={"submit"}
              show={loading}
              className={cx(bt.btnPrimary)}
              label={formatMessage(messages.cancelButton)}
            />
          </div>
        </form>
      </div>
    );
  }
}

CancelBookingForm = reduxForm({
  form: "CancelBookingForm", // a unique name for this form
  validate
})(CancelBookingForm);

const selector = formValueSelector('CancelBookingForm');
const mapState = (state) => ({
  booking: selector(state, 'booking') || {},
  loading: selector(state, 'loading')
});

const mapDispatch = {

};

export default injectIntl(withStyles(s, bt)(connect(mapState, mapDispatch)(CancelBookingForm)));