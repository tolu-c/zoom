import React from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout'
import messages from '../../../locale/messages';
import ChatMessage from './ChatMessage';

function action({ store, params, intl }) {
    // const title = 'Currency List';
    const title = intl.formatMessage(messages.chatMessageLabel);

    //From Redux Store
    let isAdminAuthenticated = store.getState().runtime.isAdminAuthenticated;
    let isSuperAdmin = store.getState().runtime.isSuperAdmin

    if (!isAdminAuthenticated || !isSuperAdmin) {
        return { redirect: '/login' }
    }

    if (!isSuperAdmin) {
        return { redirect: '/siteadmin' }
    }

    const bookingId = Number(params.id)
    const from = params.from;

    return {
        title,
        component: (
            <AdminLayout>
                <ChatMessage bookingId={bookingId} from={from} />
            </AdminLayout>
        ),
    }
}

export default action;