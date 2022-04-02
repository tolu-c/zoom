import React, { Component } from 'react'
import { connect } from 'react-redux'
import withStyles from 'isomorphic-style-loader/withStyles';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { siteSettings } from '../../../actions/siteadmin/siteSettings'
import {
  Button,
  Row,
  FormGroup,
  Col,
  FormControl,
  Container,
  Form,
  InputGroup
} from 'react-bootstrap';
import cx from 'classnames';
import s from './MobileSettingsForm.css';
import bt from '../../../components/commonStyle.css';
import { injectIntl, FormattedMessage } from 'react-intl';
import messages from '../../../locale/messages'
import submit from './submit'
import validate from './validate'
import Loader from '../../Common/Loader/Loader';

export class MobileSettingsForm extends Component {
  static defaultProps = {
    loading: false
  };

  renderFormControl = ({ input, label, type, meta: { touched, error }, className, maxlength }) => {
    const { formatMessage } = this.props.intl;
    return (
      <div>
        <FormGroup className={s.formGroup}>
          <div>
            <label className={cx(bt.labelText, s.normalFontWeight)} >{label}</label>
          </div>
          <div>
            <FormControl {...input} placeholder={label} type={type} className={bt.formControlInput} maxlength={maxlength} />
            {touched && error && <span className={bt.errorMessage}>{formatMessage(error)}</span>}
          </div>
        </FormGroup>
      </div>
    );
  }

  renderFieldApp = ({ input, label, type, meta: { touched, error }, className, maxlength }) => {
    return (
      <div className={cx('inputFormAddon', 'addonBorder')}>
        <Form.Group>
          <label className={cx(bt.labelText, s.normalFontWeight)} >{label}</label>
          <InputGroup>
            <InputGroup.Append>
              <InputGroup.Text>
                V
              </InputGroup.Text>
            </InputGroup.Append>
            <FormControl {...input} placeholder={label} type={type} className={bt.formControlInput} maxlength={maxlength} />
          </InputGroup>
          {touched && error && <span className={bt.errorMessage}>{error.defaultMessage}</span>}
        </Form.Group>
      </div>
    )
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { handleSubmit, logo, loading, submitting, appForceUpdate } = this.props;
    const waitingTime = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return (
      <div>
        <div className={s.paddingTop}>
          <Container fluid>
            <form onSubmit={handleSubmit(submit)}>
              <h5 className={cx(s.headingMobile, 'headingMobileRTL')}>{formatMessage(messages.manageForceUpdate)}</h5>
              <Row>
                <Col lg={6} md={6} sm={6} xs={12}>
                  <Form.Group className={s.formGroup}>
                    <div>
                      <label className={cx(bt.labelText, s.normalFontWeight)} >{formatMessage(messages.forceUpdate)}</label><br />
                      <Field name="appForceUpdate" className={cx(bt.formControlSelect, bt.formControlInput)} component="select">{formatMessage(messages.forceUpdate)}
                        <option value="true">{formatMessage(messages.Enable)}</option>
                        <option value="false">{formatMessage(messages.Disable)}</option>
                      </Field>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {
                String(appForceUpdate) === 'true' && <Row>
                  <Col xs={12} sm={12} md={12} lg={6} className={bt.space2}>
                    <Form.Group className={s.formGroup}>
                      <div>
                        <Field name="riderAndroidVersion" type="text" component={this.renderFieldApp} label={formatMessage(messages.riderAndriodVersion)}
                          maxlength={10} />
                      </div>
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={12} md={12} lg={6} className={bt.space2}>
                    <Form.Group className={s.formGroup}>
                      <div>
                        <Field name="riderIosVersion" type="text" component={this.renderFieldApp} label={formatMessage(messages.rideriosVersion)} maxlength={10} />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={6} className={bt.space2}>
                    <Form.Group className={s.formGroup}>
                      <div>
                        <Field name="driverAndroidVersion" type="text" component={this.renderFieldApp} label={formatMessage(messages.driverAndriodVersion)}
                          maxlength={10} />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={6} className={bt.space2}>
                    <Form.Group className={s.formGroup}>
                      <div>
                        <Field name="driverIosVersion" type="text" component={this.renderFieldApp} label={formatMessage(messages.driveriosVersion)} maxlength={10} />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              }

              <h5 className={cx(s.headingMobile, 'headingMobileRTL')}>{formatMessage(messages.stripeSettings)}</h5>
              <Row>
                <Col xs={12} sm={12} md={12} lg={6} className={bt.space2}>
                  <Field name="stripePublishableKey" type="text" component={this.renderFormControl} label={formatMessage(messages.stripePublishableKey)} />
                </Col>
              </Row>

              <h5 className={cx(s.headingMobile, 'headingMobileRTL')}>{formatMessage(messages.mulitStopSettings)}</h5>
              <Row>
                <Col lg={6} md={6} sm={6} xs={12}>
                  <Form.Group className={s.formGroup}>
                    <div>
                      <label className={cx(bt.labelText, s.normalFontWeight)} >{formatMessage(messages.multipleStopsWaitingTime)}</label><br />
                      <Field name="multipleStopsWaitingTime" className={cx(bt.formControlSelect, bt.formControlInput)} component="select">{formatMessage(messages.multipleStopsWaitingTime)}
                        {
                          waitingTime.map(data => (
                            <option key={data} value={data}>{data}</option>
                          ))
                        }
                      </Field>
                    </div >
                  </Form.Group>
                </Col>
                <Col lg={6} md={6} sm={6} xs={12}>
                  <Form.Group className={s.formGroup}>
                    <div>
                      <label className={cx(bt.labelText, s.normalFontWeight)} >{formatMessage(messages.preferredDistanceType)}</label><br />
                      <Field name="preferredDistanceType" className={cx(bt.formControlSelect, bt.formControlInput)} component="select">{formatMessage(messages.preferredDistanceType)}
                        <option value="km">{formatMessage(messages.km)}</option>
                        <option value="mile">{formatMessage(messages.miles)}</option>
                      </Field>
                    </div >
                  </Form.Group>
                </Col>
              </Row>

              <h5 className={cx(s.headingMobile, 'headingMobileRTL')}>{formatMessage(messages.tripRequestWindow)}</h5>
              <Row>
                <Col lg={6} md={6} sm={6} xs={12}>
                  <Form.Group className={s.formGroup}>
                    <div>
                      <label className={cx(bt.labelText, s.normalFontWeight)} >{formatMessage(messages.distance)}</label><br />
                      <Field name="distance" className={cx(bt.formControlSelect, bt.formControlInput)} component="select">{formatMessage(messages.preferredDistanceType)}
                        <option value="0">{formatMessage(messages.hide)}</option>
                        <option value="1">{formatMessage(messages.show)}</option>
                      </Field>
                    </div >
                  </Form.Group>
                </Col>
                <Col lg={6} md={6} sm={6} xs={12}>
                  <Form.Group className={s.formGroup}>
                    <div>
                      <label className={cx(bt.labelText, s.normalFontWeight)} >{formatMessage(messages.duration)}</label><br />
                      <Field name="duration" className={cx(bt.formControlSelect, bt.formControlInput)} component="select">{formatMessage(messages.multipleStopsWaitingTime)}
                        <option value="0">{formatMessage(messages.hide)}</option>
                        <option value="1">{formatMessage(messages.show)}</option>
                      </Field>
                    </div >
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col lg={6} md={6} sm={6} xs={12}>
                  <Form.Group className={s.formGroup}>
                    <div>
                      <label className={cx(bt.labelText, s.normalFontWeight)} >{formatMessage(messages.pickUpLocation)}</label><br />
                      <Field name="pickupLocation" className={cx(bt.formControlSelect, bt.formControlInput)} component="select">{formatMessage(messages.multipleStopsWaitingTime)}
                        <option value="0">{formatMessage(messages.hide)}</option>
                        <option value="1">{formatMessage(messages.show)}</option>
                      </Field>
                    </div >
                  </Form.Group>
                </Col>
                <Col lg={6} md={6} sm={6} xs={12}>
                  <Form.Group className={s.formGroup}>
                    <div>
                      <label className={cx(bt.labelText, s.normalFontWeight)} >{formatMessage(messages.dropLocation)}</label><br />
                      <Field name="destinationLocation" className={cx(bt.formControlSelect, bt.formControlInput)} component="select">{formatMessage(messages.preferredDistanceType)}
                        <option value="0">{formatMessage(messages.hide)}</option>
                        <option value="1">{formatMessage(messages.show)}</option>
                      </Field>
                    </div >
                  </Form.Group>
                </Col>
              </Row>

              <Row>
              <Col lg={6} md={6} sm={6} xs={12}>
                  <Form.Group className={s.formGroup}>
                    <div>
                      <label className={cx(bt.labelText, s.normalFontWeight)} >{formatMessage(messages.estimatedPrice)}</label><br />
                      <Field name="estimatedPrice" className={cx(bt.formControlSelect, bt.formControlInput)} component="select">{formatMessage(messages.preferredDistanceType)}
                        <option value="0">{formatMessage(messages.hide)}</option>
                        <option value="1">{formatMessage(messages.show)}</option>
                      </Field>
                    </div >
                  </Form.Group>
                </Col>
              </Row>

              <h5 className={cx(s.headingMobile, 'headingMobileRTL')}>{formatMessage(messages.sleepMode)}</h5>

              <Row>
                <Col lg={6} md={6} sm={6} xs={12}>
                  <Form.Group className={s.formGroup}>
                    <div>
                      <label className={cx(bt.labelText, s.normalFontWeight)} >{formatMessage(messages.sleepDriverios)}</label><br />
                      <Field name="sleepDriverios" className={cx(bt.formControlSelect, bt.formControlInput)} component="select">{formatMessage(messages.preferredDistanceType)}
                        <option value="0">{formatMessage(messages.inactive)}</option>
                        <option value="1">{formatMessage(messages.active)}</option>
                      </Field>
                    </div >
                  </Form.Group>
                </Col>
                <Col lg={6} md={6} sm={6} xs={12}>
                  <Form.Group className={s.formGroup}>
                    <div>
                      <label className={cx(bt.labelText, s.normalFontWeight)} >{formatMessage(messages.sleepDriverAndroid)}</label><br />
                      <Field name="sleepDriverAndroid" className={cx(bt.formControlSelect, bt.formControlInput)} component="select">{formatMessage(messages.multipleStopsWaitingTime)}
                        <option value="0">{formatMessage(messages.inactive)}</option>
                        <option value="1">{formatMessage(messages.active)}</option>
                      </Field>
                    </div >
                  </Form.Group>
                </Col>
              </Row>

              <h5 className={cx(s.headingMobile, 'headingMobileRTL')}>{formatMessage(messages.Support)}</h5>
              <Row>
                <Col xs={12} sm={12} md={12} lg={6} className={bt.space2}>
                  <Field name="contactPhoneNumber" type="text" component={this.renderFormControl} label={formatMessage(messages.contactPhoneNumber)} maxLength={15}/>
                </Col>
                <Col xs={12} sm={12} md={12} lg={6} className={bt.space2}>
                  <Field name="contactEmail" type="text" component={this.renderFormControl} label={formatMessage(messages.contactEmail)} />
                </Col>
                <Col xs={12} sm={12} md={12} lg={6} className={bt.space2}>
                  <Field name="skype" type="text" component={this.renderFormControl} label={formatMessage(messages.skype)} />
                </Col>
              </Row>

              <Col lg={12} md={12} sm={12} xs={12} className={cx(bt.textAlignRight, bt.spaceTop3, 'textAlignLeftRTL', 'loadingBtnRTL')}>
                <FormGroup className={s.formGroup}>
                  <div>
                    <Loader
                      type={"button"}
                      label={formatMessage(messages.submitButton)}
                      show={loading}
                      buttonType={'submit'}
                      className={cx(bt.btnPrimary)}
                      disabled={submitting || loading}
                      isSuffix={true}
                    />
                  </div>
                </FormGroup>
              </Col>

            </form>
          </Container>
        </div>
      </div>
    )
  }
}
const callSiteSettings = async (result, dispatch, props) => {
  const { refetch } = props
  await refetch()
  dispatch(siteSettings())
}
MobileSettingsForm = reduxForm({
  form: 'MobileSettingsForm',
  onSubmit: submit,
  validate,
  onSubmitSuccess: callSiteSettings
})(MobileSettingsForm);

const selector = formValueSelector('MobileSettingsForm')

const mapState = (state) => ({
  appForceUpdate: selector(state, 'appForceUpdate'),
  loading: state.loader.MobileSettings
})
const mapDispatch = {
  siteSettings
}
export default injectIntl(withStyles(s, bt)(connect(mapState, mapDispatch)(MobileSettingsForm)));
