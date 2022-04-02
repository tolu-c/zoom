import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { flowRight as compose } from 'lodash';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './Tracking.css';
import adminRolesQuery from './adminRolesQuery.graphql';
import TrackingManagement from '../../../components/SiteAdmin/TrackingManagement/TrackingManagement';
import Loader from '../../../components/Common/Loader/Loader';
import { injectIntl } from 'react-intl';
import messages from '../../../locale/messages'
class Tracking extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool,
      getAllAdminRoles: PropTypes.array,
    })
  };

  static defaultProps = {
    data: {
      loading: true
    }
  };

  render () {
    const { formatMessage } = this.props.intl;
    const { data: { loading, getAllAdminRoles } } = this.props;

    if(loading){
      return <Loader type={"text"} />;
    } else {
      return(<div className={s.root}>
        <div className={s.container}>
          <div className={s.heading}>
            {formatMessage(messages.tracking)}
          </div>
          <div className={s.paddingRoutesSection}>
          <TrackingManagement data={getAllAdminRoles} />
          </div>
        </div>
      </div>) 
      
    }
  }

}

export default compose(
    injectIntl,
    withStyles(s),
    graphql(adminRolesQuery, {
      options: {
        fetchPolicy: 'network-only'
      }
    }),
)(Tracking);