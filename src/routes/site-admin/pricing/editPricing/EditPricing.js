import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { flowRight as compose } from 'lodash';
import getPricingQuery from './getPricingQuery.graphql';
import s from './EditPricing.css';
import PricingForm from '../../../../components/SiteAdmin/Pricing/PricingForm';
import Loader from '../../../../components/Common/Loader/Loader';
import NotFound from '../../../../components/NotFound/NotFound';
import { injectIntl } from 'react-intl';
import messages from '../../../../locale/messages';
class EditPricing extends React.Component {

  static defaultProps = {
    pricing: {
      loading: true
    }
  };

  render() {
    const { id, pricing: { loading, getPricing }, locations, categories } = this.props;
    const { formatMessage } = this.props.intl;
    let initialValues = {};

    if (!loading && getPricing && getPricing.result) {
      initialValues = getPricing && getPricing.result;
      initialValues['isActive'] = initialValues['isActive'] && initialValues['isActive'].toString();
    }

    if (loading) {
      return <div><Loader type={"page"} show={loading}></Loader></div>;
    }
    else if (!getPricing || !getPricing.result) {
      return <NotFound title={'Page Not Found'} />;
    }

    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.heading}>
            {formatMessage(messages.editFare)}
          </div>
          <div className={s.paddingRoutesSection}>
            {
              !loading && <PricingForm id={id}
                initialValues={initialValues}
                locations={locations}
                categories={categories}
              />
            }
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withStyles(s),
  graphql(getPricingQuery, {
    name: 'pricing',
    options: (props) => ({
      ssr: true,
      fetchPolicy: 'network-only',
      variables: {
        id: props.id
      }
    })
  }),
  graphql(gql`
    query {
      getAllLocation {
          LocationData {
              id
              locationName
              isActive
          }
      }
    }`, {
    name: 'locations',
    options: (props) => ({
      ssr: true,
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql`
    query {
      getOverallCategory {
      count
        categoryData {
            id
            categoryName
            isActive
        }
      }
    }`, {
    name: 'categories',
    options: (props) => ({
      ssr: true,
      fetchPolicy: 'network-only'
    })
  })
)(EditPricing);
