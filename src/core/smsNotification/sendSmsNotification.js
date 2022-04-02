import twilio from 'twilio';
import { User } from '../../data/models';
import { sms } from '../../config';
import { getPushNotificationMessage } from '../pushNotifications/sendNotificationFromMobileServer';

const client = new twilio(sms.twilio.accountSid, sms.twilio.authToken);

export async function getUserPhoneNumber(id) {
    if (!id) return '';

    const userData = await User.findOne({
        attributes: ['phoneNumber', 'phoneDialCode'],
        where: { id }
    });

    if (!userData) return '';
    else return `${userData.phoneDialCode || ''}${userData.phoneNumber || ''}`
}

export async function sendMessage({ id, type, otherDetails, lang }) {
    try {
        let response = await getPushNotificationMessage({ type, requestData: otherDetails, lang }),
            to = await getUserPhoneNumber(id);

        let body = response && response.result && response.result.message;
        if (!body || !to) return '';

        await client.messages
            .create({
                from: sms.twilio.phoneNumber,
                body,
                to
            });

        return '';
    }
    catch (error) {
        console.log('******** Twilio Error ********')
        console.log(error);
        return '';
    }
}