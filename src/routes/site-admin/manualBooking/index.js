import React from 'react';

import ManualBooking from './ManualBooking';
import AdminLayout from '../../../components/Layout/AdminLayout';

import messages from '../../../locale/messages';
import { restrictUrls } from '../../../helpers/adminPrivileges';

function action({ store, intl }) {

    //From Redux Store
    let isAdminAuthenticated = store.getState().runtime.isAdminAuthenticated;
    let adminPrivileges = store.getState().adminPrevileges.privileges && store.getState().adminPrevileges.privileges.privileges;

    if (!isAdminAuthenticated) return { redirect: '/login' };

    // Admin restriction
    if (!restrictUrls('/siteadmin/manual-bookings', adminPrivileges)) return { redirect: '/siteadmin' };

    return {
        title: intl.formatMessage(messages.manualBookings),
        component: <AdminLayout> <ManualBooking /> </AdminLayout>
    };
}

export default action;