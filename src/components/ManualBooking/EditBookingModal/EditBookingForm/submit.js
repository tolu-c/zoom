import { toastr } from 'react-redux-toastr';
import { change } from 'redux-form';
import moment from 'moment';

import { closeEditBookingModal } from '../../../../actions/siteadmin/modalActions';
import updateBooking from '../../../../actions/siteadmin/ManualBooking/updateBooking';

import { getDistanceAndDuration } from '../../../../helpers/ManualBooking/googleMapAPI';

export default async function submit(values, dispatch) {
    try {
        dispatch(change("EditBookingForm", "loading", true));

        let booking = values.booking || {}, data = { bookingId: booking.id, isSchedule: true };

        if (booking.tripStatus === 'scheduled') data['scheduleFrom'] = moment(values.scheduleFromField).unix();
        else {
            let locations = values.locationsInput.map(item => ({ id: item.id, lat: item.data.location.lat, lng: item.data.location.lng, location: item.data.label, locationStatus: item.locationStatus }));

            let havingChanges = false;

            if (locations.length !== booking.bookingLocations.length) havingChanges = true;
            else booking.bookingLocations.map((item, index) => {
                if (item.location !== locations[index].location) havingChanges = true;
            });

            if (!havingChanges) {
                toastr.error("Error!", "Oops! No changes made");
                dispatch(change("EditBookingForm", "loading", false));
                return '';
            }

            locations = [{ lat: booking.pickUpLat, lng: booking.pickUpLng, location: booking.pickUpLocation }, ...locations];

            const estimation = await getDistanceAndDuration({ distanceType: booking.distanceType, locations });
            if (!estimation || !estimation.bookingLocations || estimation.bookingLocations.length <= 0 || !estimation.totalDistance || !estimation.totalDuration) {
                toastr.error("Error!", "Oops! something went wrong. Please try again. ");
                dispatch(change("EditBookingForm", "loading", false));
                return '';
            }

            data['bookingLocations'] = [];
            estimation.bookingLocations.map((item, index) => index !== 0 && data['bookingLocations'].push({
                id: item.id,
                location: item.location,
                locationLat: item.locationLat,
                locationLng: item.locationLng,
                locationType: item.locationType,
                locationDistance: item.locationDistance,
                locationDuration: item.locationDuration,
                locationStatus: item.locationStatus
            }));
            data['isSchedule'] = false;
        }
        await dispatch(updateBooking(data));
        dispatch(closeEditBookingModal())
        dispatch(change("EditBookingForm", "loading", false));
    }
    catch (error) {
        toastr.error("Error!", "Oops! something went wrong. Please try again. " + error);
        dispatch(change("EditBookingForm", "loading", false));
    }
}