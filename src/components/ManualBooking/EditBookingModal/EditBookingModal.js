import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import withStyles from 'isomorphic-style-loader/withStyles';
import s from './EditBookingModal.css';

import EditBookingForm from './EditBookingForm';

import messages from '../../../locale/messages';

import { closeEditBookingModal } from '../../../actions/siteadmin/modalActions';

class EditBookingModal extends Component {
  render() {
    const { closeEditBookingModal, editBookingModal, booking } = this.props;
    return (
      <div>
        <Modal show={editBookingModal} onHide={closeEditBookingModal} className={'wooberlyModal editBookingModal'} backdrop='static'>
          <Modal.Header closeButton>
            <Modal.Title><h2> <FormattedMessage {...messages.editBooking} /></h2></Modal.Title>
          </Modal.Header>
          <Modal.Body className={s.logInModalBody}>
            <div className={s.root}>
              <div className={s.container}>
                <EditBookingForm booking={booking} />
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

const mapState = (state) => ({
  editBookingModal: state.adminModalStatus.editBookingModal
});

const mapDispatch = {
  closeEditBookingModal
};

export default withStyles(s)(connect(mapState, mapDispatch)(EditBookingModal));