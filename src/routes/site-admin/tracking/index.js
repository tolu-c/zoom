import React from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import Tracking from './Tracking';
import messages from '../../../locale/messages';
import { getMapViewData } from '../../../actions/siteadmin/Tracking/getMapViewData';

async function action({ store, intl }) {
  // const title =  'Manage Admin Roles'
  const title = intl.formatMessage(messages.tracking);

  let isAdminAuthenticated = store.getState().runtime.isAdminAuthenticated;

  if (!isAdminAuthenticated) {
    return { redirect: '/login' }
  }

  await store.dispatch(getMapViewData("1", "today"));

  return {
    title,
    component: (
      <AdminLayout><Tracking /></AdminLayout>
    )
  }
}

export default action;
