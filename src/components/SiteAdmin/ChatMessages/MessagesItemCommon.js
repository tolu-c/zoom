import React, { Component } from 'react';
import s from './MessagesItem.css';
import bt from '../../../components/commonStyle.css';
import withStyles from 'isomorphic-style-loader/withStyles';
import { injectIntl } from 'react-intl';
//Style
import cx from 'classnames';
import {
  Col,
  Row,
} from 'react-bootstrap';
import { api, profilePhotouploadDir } from '../../../config';

import batchIcon from '../../../../public/Icons/batch-icon3.png';

export class MessagesItemCommon extends Component {
  render() {
    const { avatarImage, text, chatPadding, userImage } = this.props;
    return (
      <div className={cx(bt.space5)}>
        <Row>
          <Col lg={12} md={12} sm={12} xs={12} className={s.noPadding}>
            <div className={cx({ [s.displayFlexSender]: chatPadding == 'left' }, { [s.displayFlexReverse]: chatPadding == 'right' })}>
              {
                userImage &&
                <div className={cx({ [s.senderBgScetion]: chatPadding == 'left' }, { [s.recsiverBgScetion]: chatPadding == 'right' })}>
                  <span className={s.positionRelative}>
                  <div className={s.bgImage} style={{ backgroundImage: `url(${api.apiEndpoint + profilePhotouploadDir}small_${userImage})` }} >
                  {chatPadding == 'right' && <span><img src={batchIcon} className={s.batchIconDriver} /></span>}
                  </div>
                  </span>
                </div>
              }
              {!userImage && <div className={cx(s.avartarSectionWidth, { [s.imageRight]: chatPadding == 'right' }, 'avartarSectionWidthRTL')}>
                <span className={s.positionRelative}>
                  <img src={avatarImage} className={s.avatarImage} />
                  {chatPadding == 'right' && <span><img src={batchIcon} className={s.batchIcon} /></span>}
                </span>
              </div>}
              <div className={cx({ [s.senderPadding]: chatPadding == 'left' }, { [s.receiverPadding]: chatPadding == 'right' })}>
                {text}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default injectIntl(withStyles(s, bt)((MessagesItemCommon)));