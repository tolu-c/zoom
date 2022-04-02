import messages from '../../../../locale/messages';

const validate = values => {
    const errors = {};
    if (values.booking && values.booking.tripStatus !== 'scheduled') {
        if (!values.reasonField || !values.reasonField.toString().trim()) errors.reasonField = messages.required;
        else if (values.reasonField.toString().length > 200) errors.reasonField = messages.exceedLimit200;
    }
    return errors;
};

export default validate