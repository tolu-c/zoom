import React, { Component } from 'react'
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './MobileSettings.css';
import MobileSettingsForm from '../../../components/SiteAdmin/MobileSettingsForm/MobileSettingsForm';
import { graphql } from 'react-apollo';
import { flowRight as compose } from 'lodash';
import getSiteSettings from './getSiteSettings.graphql'
import Loader from '../../../components/Common/Loader/Loader';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from '../../../locale/messages'

export class MobileSettings extends Component {

  render() {
    const { formatMessage } = this.props.intl;
    const { getSiteSettings: { loading, getSiteSettings, refetch } } = this.props;
    let mobileSettingsCollection = {}

    if (!loading) {
      getSiteSettings.map((item) => {
        mobileSettingsCollection[item.name] = item.value
      })
      return (
        <div className={s.root}>
          <div className={s.container}>
            <div className={s.heading}>
              {formatMessage(messages.mobileSettings)}
            </div>
            <div className={s.paddingRoutesSection}>
              <MobileSettingsForm refetch={refetch} getSiteSettings={getSiteSettings} initialValues={mobileSettingsCollection} />
            </div>
          </div>
        </div>
      )
    }
    else {
      return <Loader type={"page"} show={loading} />
    }

  }
}


export default compose(injectIntl,
  withStyles(s),
  graphql(getSiteSettings, {
    name: 'getSiteSettings',
    options: (props) => ({
      variables: {
        type: 'appSettings'
      },
      ssr: true,
    }),
  })
)(MobileSettings)
