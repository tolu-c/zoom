import messages from '../../../../locale/messages';

const validate = values => {
    const errors = {};

    if (values.tripStatus !== 'scheduled' && values.locationsInput) {
        let errorLocations = [];
        values.locationsInput.map((item, index) => {

            let previousLocation = index > 0 && values.locationsInput[index - 1].data && { ...values.locationsInput[index - 1].data.location, label: values.locationsInput[index - 1].data.label };
            if (index === 0) previousLocation = values.booking && { lat: values.booking.pickUpLat, lng: values.booking.pickUpLng, label: values.booking.pickUpLocation };

            if (item.data && item.data.disabled) {
                //No validations
            }
            else if (!item.data || !item.data.location || !item.data.location.lat || !item.data.location.lng)
                errorLocations[index] = { data: messages.required };
            else if (previousLocation && ((previousLocation.lat === item.data.location.lat && previousLocation.lng === item.data.location.lng) || previousLocation.label === item.data.label)) {
                errorLocations[index] = { data: messages.invalid };
            }
        });
        if (errorLocations.length > 0) errors.locationsInput = errorLocations;
    }

    if (values.tripStatus === 'scheduled' && (!values.scheduleFromField || isNaN((new Date(values.scheduleFromField)).getTime()))) {
        errors.scheduleFromField = messages.required;
    }

    return errors;
};

export default validate;