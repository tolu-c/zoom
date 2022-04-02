import React from 'react';
import { change } from 'redux-form';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/withStyles';

import Geosuggest from 'react-geosuggest';
import ReactGoogleMapLoader from "react-google-maps-loader";
import c from 'react-geosuggest/module/geosuggest.css';

import { googleMapAPI } from '../../../config';

class PlaceGeoSuggest extends React.Component {

    static defaultProps = {
        label: '',
        className: '',
        defaultValue: '',
        containerClassName: ''
    };

    render() {
        const { label, disabled, handleSelectSuggest, onSuggestNoResults, initialValue, id } = this.props;

        return (
            <ReactGoogleMapLoader
                params={{
                    key: googleMapAPI,
                    libraries: "geometry,drawing,places"
                }}
                render={
                    googleMaps => googleMaps && (
                        <div>
                            <Geosuggest
                                id={id}
                                ref={el => this._geoSuggest = el}
                                initialValue={initialValue}
                                placeholder={label ? label : ''}
                                onSuggestSelect={handleSelectSuggest}
                                onSuggestNoResults={onSuggestNoResults}
                                disabled={disabled}
                                autoComplete={'off'}
                            />
                        </div>
                    )
                }
            />
        );
    }
}

const mapState = (state) => ({});

const mapDispatch = {
    change
};

export default withStyles(c)(connect(mapState, mapDispatch)(PlaceGeoSuggest));