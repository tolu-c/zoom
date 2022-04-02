import React from 'react';
// import { Table, tr, td } from 'reactable';
import { connect } from 'react-redux';
import {
  Button,
  Col,
  Table
} from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';
// Style
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './AdminRolesManagement.css';
import bt from '../../../components/commonStyle.css';
import messages from '../../../locale/messages';
// Redux Actions
import { openAdminRolesModal } from '../../../actions/siteadmin/modalActions';
import { deleteAdminRole } from '../../../actions/siteadmin/AdminRoles/manageAdminRoles';
// Components
import AdminRolesModal from '../AdminRolesModal';
import Link from '../../Link';
import EditIcon from '../../../../public/Icons/edit.png';
import TrashIcon from '../../../../public/Icons/bin.svg';
import Loader from '../../../components/Common/Loader';

class AdminRolesManagement extends React.Component {
  static defaultProps = {
    data: []
  };
  render() {
    const { data, openAdminRolesModal, deleteAdminRole, loading } = this.props;
    const { formatMessage } = this.props.intl;

    return (
      <div className={cx(s.widthInner)}>
        <div className={s.contentBox}>
          <AdminRolesModal />
          <Col xs={12} sm={6} md={6} lg={3} className={cx(bt.noPadding, s.buttonMargin, 'textAlignRightRTL')}>
            <Button
              className={cx(bt.btnPrimary, s.marginBottom20)}
              onClick={() => openAdminRolesModal('add')}
            >
              <FormattedMessage {...messages.addNewLabel} />
            </Button>
          </Col>
          {
            loading && <div>
              <Loader type="circle" />
            </div>
          }
          {!loading &&
            <div className={cx(s.tableCss, 'tableCss', 'tableSticky', 'NewResponsiveTable')}>
              <Table
                className="table"
              >
                <thead>
                  <tr>
                    <th scope="col"><FormattedMessage {...messages.id} /></th>
                    <th scope="col"><FormattedMessage {...messages.adminName} /></th>
                    <th scope="col"><FormattedMessage {...messages.description} /></th>
                    <th scope="col"><FormattedMessage {...messages.edit} /></th>
                    <th scope="col"><FormattedMessage {...messages.deleteAction} /></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    data && data.length > 0 && data.map((value, key) => {
                      return (
                        <tr key={key}>
                          <td data-label={formatMessage(messages.id)}>{value.id} </td>
                          <td data-label={formatMessage(messages.adminName)}>{value.name}</td>
                          <td data-label={formatMessage(messages.description)}>{value.description}</td>
                          <td data-label={formatMessage(messages.edit)}>
                            <Link noLink onClick={() => openAdminRolesModal('edit', value)} className={cx(s.noLink)}>
                              <span><img src={EditIcon} className={cx(s.editIcon, 'editIconRTL')} /></span>
                              <span className={s.vtrMiddle}>
                                <FormattedMessage {...messages.editAction} />
                              </span>
                            </Link>
                          </td>
                          <td data-label={formatMessage(messages.deleteAction)}>
                            <Link noLink onClick={() => deleteAdminRole(value.id)} className={s.noLink}>
                              <img src={TrashIcon} className={cx(s.editIcon, 'editIconRTL')} />
                              <FormattedMessage {...messages.deleteAction} />
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
            </div>
          }
        </div>
      </div>
    );
  }
}
const mapState = (state) => ({
  loading: state.intl.loading
});
const mapDispatch = {
  openAdminRolesModal,
  deleteAdminRole
};
export default injectIntl(withStyles(s, bt)(connect(mapState, mapDispatch)(AdminRolesManagement)));