import { Booking, User } from '../../data/models';

export async function getUsers(id) {

    const bookingData = await Booking.findOne({
        attributes: ['driverId', 'riderId'],
        where: { id },
        raw: true
    });

    let riderId = bookingData && bookingData.riderId, driverId = bookingData && bookingData.driverId;
    
    return await {
        riderId,
        driverId,
    };
}

export async function getUserDetails(id) {
    return await User.findOne({
        attributes: ['id', 'email'],
        where: {
            id,
            deletedAt: null,
            isBan: false
        },
        raw: true
    });
}