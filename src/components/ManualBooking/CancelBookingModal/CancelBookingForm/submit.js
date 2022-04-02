import cancelBooking from '../../../../actions/siteadmin/ManualBooking/cancelBooking';

export default async function submit(values, dispatch) {
    dispatch(cancelBooking({
        bookingId: values.booking && values.booking.id,
        reason: values.reasonField,
        requestBy: 'cancelledByRider'
    }));
}