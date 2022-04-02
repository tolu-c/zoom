import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import withStyles from 'isomorphic-style-loader/withStyles';
import s from './CancelBookingModal.css';

import CancelBookingForm from './CancelBookingForm';

import messages from '../../../locale/messages';

import { closeCancelBookingModal } from '../../../actions/siteadmin/modalActions';

class CancelBookingModal extends Component {
  render() {
    const { closeCancelBookingModal, cancelBookingModal, booking } = this.props;
    return (
      <div>
        <Modal show={cancelBookingModal} onHide={closeCancelBookingModal} className={'wooberlyModal'}>
          <Modal.Header closeButton>
            <Modal.Title><h2> <FormattedMessage {...messages.cancelBooking} /></h2></Modal.Title>
          </Modal.Header>
          <Modal.Body className={s.logInModalBody}>
            <div className={s.root}>
              <div className={s.container}>
                <CancelBookingForm booking={booking} />
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

const mapState = (state) => ({
  cancelBookingModal: state.adminModalStatus.cancelBookingModal
});

const mapDispatch = {
  closeCancelBookingModal
};

export default withStyles(s)(connect(mapState, mapDispatch)(CancelBookingModal));