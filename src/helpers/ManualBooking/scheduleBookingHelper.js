import moment from 'moment';
import {
    ScheduleBookingHistory,
    ScheduleBooking
} from '../../data/models';

import sequelize from '../../data/sequelize';

export function checkScheduleBookingDuration(requestDate, from = 15, to = 30, fromDuration = 'minutes', toDuration = 'days') {
    let errorMessage;
    if (from && to) {
        const today = moment().utc().unix();
        const expectedStartTime = moment().add(from, fromDuration).utc().unix();
        const expectedEndTime = moment().add(to, toDuration).utc().unix();
        const requestedDate = moment(requestDate).utc().unix();
        if (today < requestedDate) {
            if (requestedDate < expectedStartTime || requestedDate > expectedEndTime) {
                errorMessage = 'Oops! You are trying to book a restricted date and time. Please contact our support team.';
            }
        } else {
            errorMessage = 'Oops! It looks like you are trying to book a past date and please try with the future dates.';
        }
    } else {
        errorMessage = 'Oops! Something went wrong. Please try again.';
    }

    return {
        status: errorMessage ? 400 : 200,
        errorMessage
    };
}

export async function createScheduleBookingAndHistory({ bookingId, riderId, scheduleFrom, scheduleTo }) {
    const createSchedule = await ScheduleBooking.create({
        bookingId,
        riderId,
        scheduleFrom,
        scheduleTo,
        tripStatus: "scheduled"
    });

    let scheduleId = createSchedule && createSchedule.dataValues && createSchedule.dataValues.id;
    await createScheduleBookingHistory({ bookingId, scheduleId, scheduleFrom, scheduleTo, tripStatus: "scheduled" });
}

export async function createScheduleBookingHistory({ bookingId, scheduleId, scheduleFrom, scheduleTo, tripStatus }) {
    return await ScheduleBookingHistory.create({
        bookingId,
        scheduleId,
        scheduleFrom,
        scheduleTo,
        tripStatus
    });
}

export async function updateOnScheduleCancel({ bookingData, cancelledByAdminId }) {

    const scheduledBookingData = await ScheduleBooking.findOne({
        attributes: ['id', 'scheduleFrom', 'scheduleTo'],
        where: {
            bookingId: bookingData.id,
            riderId: bookingData.riderId
        },
        raw: true
    });

    await ScheduleBooking.update({ tripStatus: 'failed' }, { where: { bookingId: bookingData.id } });

    if (scheduledBookingData) {
        await ScheduleBookingHistory.create({
            bookingId: bookingData.id,
            scheduleId: scheduledBookingData.id,
            tripStatus: 'failed',
            scheduleFrom: scheduledBookingData.scheduleFrom,
            scheduleTo: scheduledBookingData.scheduleTo,
            cancelledByAdminId
        });
    }
}

export async function updateScheduleBooking({ scheduleFrom, riderId, bookingId }) {
    scheduleFrom = Number(scheduleFrom) * 1000;//Convert to milli second

    let scheduleDateTime = new Date(Number(scheduleFrom)).toJSON().replace('T', ' ').split('.')[0], secondDifference = 600;

    let scheduleTo = Number(scheduleFrom) + (secondDifference * 1000);

    let previousSchedules = await ScheduleBooking.findOne({
        attributes: [
            [sequelize.literal(`TIMESTAMPDIFF(MINUTE, scheduleFrom,"${scheduleDateTime}")`), 'minute_difference']
        ],
        where: {
            and: [
                { tripStatus: "scheduled" },
                {
                    bookingId: {
                        $in: sequelize.literal(`(select id from Booking where riderId = "${riderId}" and (tripStatus="scheduled" or tripStatus="created") and id != ${bookingId})`)
                    }
                }
            ]
        },
        having: { minute_difference: { between: [-30, 30] } }
    });

    if (previousSchedules) {
        return {
            status: 400,
            errorMessage: "You have already scheduled a ride before 30 minutes"
        };
    }

    let schedule = await ScheduleBooking.findOne({
        attributes: ['id'],
        where: { bookingId },
        raw: true
    });

    if (!schedule || !schedule.id) {
        return {
            status: 400,
            errorMessage: "Oops! something went wrong. Please try again."
        };
    }

    const isUpdated = await ScheduleBooking.update(
        {
            scheduleFrom: Number(scheduleFrom),
            scheduleTo: Number(scheduleTo)
        },
        { where: { id: schedule.id } }
    );

    if (!isUpdated || isUpdated.includes(0)) {
        return {
            status: 400,
            errorMessage: "Oops! something went wrong. Please try again."
        };
    }

    await ScheduleBookingHistory.create({
        bookingId,
        scheduleId: schedule.id,
        scheduleFrom: Number(scheduleFrom),
        scheduleTo: Number(scheduleTo),
        tripStatus: "updated"
    });

    return { status: 200 };
}