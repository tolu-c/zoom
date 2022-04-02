import React from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import NotFound from '../../../components/NotFound/NotFound';
import EditVehicle from './EditVehicle';
import messages from '../../../locale/messages';
import { restrictUrls } from '../../../helpers/adminPrivileges';

function action({ store, params, intl }) {
    const title = intl.formatMessage(messages.editVehicle);

    // From Redux Store
    let isAdminAuthenticated = store.getState().runtime.isAdminAuthenticated;
    let adminPrivileges = store.getState().adminPrevileges.privileges && store.getState().adminPrevileges.privileges.privileges;

    if (!isAdminAuthenticated) {
        return { redirect: '/login' }
    }

    // Admin restriction
    if (!restrictUrls('/siteadmin/vehicles', adminPrivileges)) {
        return { redirect: '/siteadmin' };
    }

    if (!params || !params.id || isNaN(params.id) || !(parseInt(params.id, 10) == params.id)) {
        return {
            title,
            component: (
                <AdminLayout>
                    <NotFound title={'Page Not Found'} />;
                </AdminLayout>
            ),
        };
    }

    const id = Number(params.id);
    return {
        title,
        component: (
            <AdminLayout>
                <EditVehicle title={title} id={id} />
            </AdminLayout>
        )
    }
}

export default action;