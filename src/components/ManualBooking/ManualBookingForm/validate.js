import messages from '../../../locale/messages';

const validate = values => {
    const errors = {};

    if (!values.riderPhoneNumber || isNaN(values.riderPhoneNumber) || values.riderPhoneNumber.trim() === "") {
        errors.riderPhoneNumber = messages.required;
    }

    if (!values.riderEmail || !values.riderEmail.toString().match(/^(([^<>()[\]\\.,;.!-#$_&%*+/=?:{|}~-\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i)) {
        errors.riderEmail = messages.required;
    }

    if (!values.riderFirstName || values.riderFirstName.toString().trim() === "") {
        errors.riderFirstName = messages.required;
    }

    if (!values.riderLastName || values.riderLastName.toString().trim() === "") {
        errors.riderLastName = messages.required;
    }

    if (values.locations) {
        let errorLocations = [];
        values.locations.map((item, index) => {
            let previousLocation = index > 0 && values.locations[index - 1].data && { ...values.locations[index - 1].data.location, label: values.locations[index - 1].data.label };
            if (!item.data || !item.data.location || !item.data.location.lat || !item.data.location.lng)
                errorLocations[index] = { data: messages.required };
            else if (previousLocation && ((previousLocation.lat === item.data.location.lat && previousLocation.lng === item.data.location.lng) || previousLocation.label === item.data.label)) {
                errorLocations[index] = { data: messages.invalid };
            }
        });
        if (errorLocations.length > 0) errors.locations = errorLocations;
    }

    if (values.bookingType === 2 && (!values.scheduleFrom || isNaN((new Date(values.scheduleFrom)).getTime()))) {
        errors.scheduleFrom = messages.required;
    }

    return errors;
};

export default validate;