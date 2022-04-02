import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './RiderDriverDetails.css';
import cx from 'classnames';
import bt from '../../../../components/commonStyle.css';
import { flowRight as compose } from 'lodash';
import DriverIcon from '../../../../../public/Icons/userProfile.svg';
import chatIcon from '../../../../../public/Icons/Chat-icon.png';
import batchIcon from '../../../../../public/Icons/batch-icon3.png';
import { api, profilePhotouploadDir } from '../../../../config';


class RiderDriverDetails extends React.Component {
  render() {
    const { riderDetails, driverDetails } = this.props;
    let riderImage, driverImage;

    if (riderDetails && riderDetails.profile && riderDetails.profile.picture) {
      riderImage = api.apiEndpoint + profilePhotouploadDir + riderDetails.profile.picture;
    } else {
      riderImage = DriverIcon;
    }

    if (driverDetails && driverDetails.profile && driverDetails.profile.picture) {
      driverImage = api.apiEndpoint + profilePhotouploadDir + driverDetails.profile.picture;
    } else {
      driverImage = DriverIcon;
    }

    return (
      <div className={cx(s.containerWidth, s.hiddenXs)}>
        <div className={cx(s.displayGrid)}>
          <div className={s.textAlignRight}>{riderDetails && riderDetails.profile && riderDetails.profile.firstName}</div>
          <div className={s.textAlignCenter}>
            <div className={s.icon} style={{ backgroundImage: `url(${riderImage})` }} />
            <div className={s.centerChatIcon}>
              <div className={s.iconBG}>
                <img src={chatIcon} responsive />
              </div>
            </div>
            <div className={s.icon} style={{ backgroundImage: `url(${driverImage})` }}>
              <span><img src={batchIcon} className={s.batchIcon} /></span>
            </div>
          </div>
          <div className={s.textAlignLeft}>{driverDetails && driverDetails.profile && driverDetails.profile.firstName}</div>
        </div>
      </div>
    );
  }
}

export default compose(
  withStyles(s, bt)
)(RiderDriverDetails);