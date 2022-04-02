import messages from '../../../locale/messages'

const validate = values => {

  const errors = {}

  if (!values.riderAndroidVersion) {
    errors.riderAndroidVersion = messages.required;
  } else if (values.riderAndroidVersion && values.riderAndroidVersion.toString().trim() === '') {
    errors.riderAndroidVersion = messages.required;
  } else if (values.riderAndroidVersion && !/^\d+(\.\d+){0,2}$/i.test(values.riderAndroidVersion)) {
    errors.riderAndroidVersion = messages.invalidVersionNumber;
  }

  if (!values.riderIosVersion) {
    errors.riderIosVersion = messages.required
  } else if (values.riderIosVersion.trim() == '') {
    errors.riderIosVersion = messages.required
  } else if (values.riderIosVersion && !/^\d+(\.\d+){0,2}$/i.test(values.riderIosVersion)) {
    errors.riderIosVersion = messages.invalidVersionNumber;
  }
  if (!values.driverAndroidVersion) {
    errors.driverAndroidVersion = messages.required
  } else if (values.driverAndroidVersion.trim() == '') {
    errors.driverAndroidVersion = messages.required
  } else if (values.driverAndroidVersion && !/^\d+(\.\d+){0,2}$/i.test(values.driverAndroidVersion)) {
    errors.driverAndroidVersion = messages.invalidVersionNumber;
  }
  if (!values.driverIosVersion) {
    errors.driverIosVersion = messages.required
  } else if (values.driverIosVersion.trim() == '') {
    errors.driverIosVersion = messages.required
  } else if (values.driverIosVersion && !/^\d+(\.\d+){0,2}$/i.test(values.driverIosVersion)) {
    errors.driverIosVersion = messages.invalidVersionNumber;
  }


  if (!values.stripePublishableKey) {
    errors.stripePublishableKey = messages.required;
  } else if (values.stripePublishableKey && values.stripePublishableKey.toString().trim() == "") {
    errors.stripePublishableKey = messages.required;
  }

  if (!values.contactEmail) {
    errors.contactEmail = messages.required;
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i.test(values.contactEmail)) {
    errors.contactEmail = messages.emailInvalid;
  }

  if (!values.contactPhoneNumber) {
    errors.contactPhoneNumber = messages.required;
  } else if (!/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(values.contactPhoneNumber)) {
    errors.contactPhoneNumber = messages.phoneError;
  }

  if (values.skype && values.skype.toString().trim() === '') {
    errors.skype = messages.invalid;
  }

  return errors
}

export default validate;
