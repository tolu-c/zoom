import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './MessagesItem.css';
import cx from 'classnames';
import MessagesItemCommon from './MessagesItemCommon';
import bt from '../../../components/commonStyle.css';
import Link from '../../Link';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from '../../../locale/messages'
import { Button } from 'react-bootstrap';
import { flowRight as compose } from 'lodash';

//Images
import DriverIcon from '../../../../public/Icons/userProfile.svg';
import RiderDriverDetails from './RiderDriverDetails/RiderDriverDetails';

class MessagesItem extends React.Component {
  render() {
    const { threadItems: { getAllThreadItems }, loadMore, from } = this.props;
    let link = '/siteadmin/' + from;

    return (
      <div className={cx(s.pagecontentWrapper, s.widthInner, bt.space5)}>
        <div className={s.contentBox}>
          <div className={cx(s.displayBlock, bt.space2, bt.textAlignRight, 'textAlignLeftRTL')}>
            <Link to={link} className={cx(s.backBtn, s.backBtn, bt.btnSecondary, s.linkText)}>
              <FormattedMessage {...messages.goBack} />
            </Link>
          </div>
          <div>
            <RiderDriverDetails
              riderDetails={getAllThreadItems && getAllThreadItems.riderDetails}
              driverDetails={getAllThreadItems && getAllThreadItems.driverDetails} />
          </div>
          {
            getAllThreadItems && getAllThreadItems.threadItems != null && getAllThreadItems.threadItems.length > 0 && getAllThreadItems.threadItems.map((item, index) => (
              <div key={index}>
                <MessagesItemCommon
                  avatarImage={DriverIcon}
                  text={item.message}
                  text={item.message}
                  chatPadding={getAllThreadItems.riderDetails && (item.authorId == getAllThreadItems.riderDetails.id) ? 'left' : 'right'}
                  userImage={(getAllThreadItems.riderDetails && item.authorId == getAllThreadItems.riderDetails.id) ? getAllThreadItems.riderDetails.profile.picture : getAllThreadItems.driverDetails.profile.picture}
                />
              </div>
            ))
          }
          {
            getAllThreadItems && getAllThreadItems.threadItems != null && getAllThreadItems.threadItems.length > 0 && getAllThreadItems.threadItems.length < getAllThreadItems.count && <div className={s.textCenter}>
              <Button href="javascript:void(0)" onClick={() => loadMore()} className={cx(s.btnRadius, bt.btnPrimary)}><FormattedMessage {...messages.loadMoreMsg} /></Button>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default compose(injectIntl,
  withStyles(s, bt)
)(MessagesItem);