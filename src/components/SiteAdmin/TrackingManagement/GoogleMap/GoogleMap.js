import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import { injectIntl } from 'react-intl';
import cx from 'classnames';
import { googleMapAPI } from '../../../../config';

// Google Libraries
import ReactGoogleMapLoader from "react-google-maps-loader";

// Styling
import s from './GoogleMap.css';
import bt from '../../../../components/commonStyle.css';
import c from 'react-geosuggest/module/geosuggest.css';

// Locale
import messages from '../../../../locale/messages';
import DrawPolygonMap from './DrawPolygonMap';

class GoogleMap extends React.Component {

  static defaultProps = {
    label: '',
    className: '',
    defaultValue: '',
    containerClassName: ''
  };

  constructor(props) {
    super(props);

    this.state = {
      noResult: false,
      lat: 37.0902,
      lng: -95.7129
    };

    this.handleSelectSuggest = this.handleSelectSuggest.bind(this);
  }

  handleSelectSuggest(data) {
    if (data) {
      this.setState({
        lat: data.location && data.location.lat,
        lng: data.location && data.location.lng
      })
    }
  }

  render() {
    const { label, className, defaultValue, containerClassName } = this.props;
    const { formName, fieldName, paths } = this.props;
    const { formatMessage } = this.props.intl;
    const { lat, lng } = this.state;

    return (
      <div>
        <ReactGoogleMapLoader
          params={{
            key: googleMapAPI, // Define your api key here
            libraries: "places,geometry,markerwithlabel"// To request multiple libraries, separate them with a comma
          }}
          render={googleMaps =>
            googleMaps && (
              <DrawPolygonMap
                lat={lat}
                lng={lng}
                formName={formName}
                fieldName={fieldName}
                paths={paths}
              />
            )}
        />

      </div>
    );
  }
}

export default injectIntl(withStyles(c, s, bt)(GoogleMap));
