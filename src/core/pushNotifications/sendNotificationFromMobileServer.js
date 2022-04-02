import fetch from 'node-fetch';
import { api } from '../../config';

export async function getPushNotificationMessage(variables) {
    try {
        const resp = await fetch(api.apiEndpoint + '/get-push-notification-message', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(variables),
            credentials: 'include'
        });
        return await resp.json();
    }
    catch (error) {
        console.log('***************** Get Push Notification error *********************');
        console.log(error);
        return {};
    }
}

export async function sendNotificationFromMobileServer(type, requestContent, userId, lang) {

    const response = await getPushNotificationMessage({ type, requestData: requestContent, lang });
    let title = response && response.result && response.result.title,
        message = response && response.result && response.result.message;

    if (!message) return '';

    let content = requestContent;
    content['title'] = title;
    content['message'] = message;
    content['notificationType'] = type;

    const resp = await fetch(api.apiEndpoint + '/push-notification', {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content,
            userId
        }),
        credentials: 'include'
    });

    const { status, errorMessge } = await resp.json();
    return '';
}