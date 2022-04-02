import React from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Col,
  Table
} from 'react-bootstrap';
// Style
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './AdminUserManagement.css';
import bt from '../../../components/commonStyle.css';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from '../../../locale/messages';
// Redux Actions
import { openAdminUserModal } from '../../../actions/siteadmin/modalActions';
import { deleteAdminUser } from '../../../actions/siteadmin/AdminUser/manageAdminUser';
// Components
import AdminUserModal from '../AdminUserModal';
import Link from '../../Link';

import EditIcon from '../../../../public/Icons/edit.png';
import TrashIcon from '../../../../public/Icons/bin.svg';
import Loader from '../../../components/Common/Loader';

class AdminUserManagement extends React.Component {
  static defaultProps = {
    data: [],
    roles: []
  };
  render() {
    const { data, openAdminUserModal, deleteAdminUser, roles, loading } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <div className={cx(s.widthInner)}>
        <div className={s.contentBox}>
          <AdminUserModal roles={roles} />
          <Col xs={12} sm={6} md={6} lg={3} className={cx(bt.noPadding, s.buttonMargin, 'textAlignRightRTL')}>
            <Button
              className={cx(bt.btnPrimary, s.marginBottom20)}
              onClick={() => openAdminUserModal('add')}>
              <FormattedMessage {...messages.addNewLabel} />
            </Button>
          </Col>
          {
            loading && <div>
              <Loader type="circle" />
            </div>
          }
          {!loading && <div className={cx(s.tableCss, 'tableCss', 'tableSticky', 'NewResponsiveTable')}>
            <Table className="table">
              <thead>
                <tr>
                  <th scope="col"><FormattedMessage {...messages.id} /></th>
                  <th scope="col"><FormattedMessage {...messages.emailText} /></th>
                  <th scope="col"><FormattedMessage {...messages.adminRole} /></th>
                  <th scope="col"><FormattedMessage {...messages.edit} /></th>
                  <th scope="col"><FormattedMessage {...messages.deleteAction} /></th>
                </tr>
              </thead>
              <tbody>
                {
                  data && data.length > 0 && data.map((value, key) => {
                    return (
                      <tr key={key}>
                        <td data-label={formatMessage(messages.id)}>{key + 1} </td>
                        <td data-label={formatMessage(messages.emailText)}>{value.email}</td>
                        <td data-label={formatMessage(messages.adminRole)}>{value.adminRole && value.adminRole.name}</td>
                        <td data-label={formatMessage(messages.editAction)}>
                          <Link noLink onClick={() => openAdminUserModal('edit', value)} className={cx(s.noLink)}>
                            <span><img src={EditIcon} className={cx(s.editIcon, 'editIconRTL')} /></span>
                            <span className={s.vtrMiddle}>
                              <FormattedMessage {...messages.editAction} />
                            </span>
                          </Link>
                        </td>
                        <td data-label={formatMessage(messages.deleteAction)}>
                          <Link noLink onClick={() => deleteAdminUser(value.id)} className={s.noLink}>
                            <img src={TrashIcon} className={cx(s.editIcon, 'editIconRTL')} />
                            <span className={s.vtrMiddle}>
                              <FormattedMessage {...messages.deleteAction} />
                            </span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                }
                {
                  data && data.length === 0 && <tr>
                    <td colspan="5" className={s.noRecords}><FormattedMessage {...messages.noResult} /></td>
                  </tr>
                }
              </tbody>
            </Table>
          </div>}
        </div>
      </div>
    );
  }
}
const mapState = (state) => ({
  loading: state.intl.loading
});
const mapDispatch = {
  openAdminUserModal,
  deleteAdminUser
};
export default injectIntl(withStyles(s, bt)(connect(mapState, mapDispatch)(AdminUserManagement)));