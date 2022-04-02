import React, { Component } from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';

import ReactGoogleMapLoader from "react-google-maps-loader";
import {
    DirectionsRenderer,
    GoogleMap,
    Marker
} from "@react-google-maps/api";

import { googleMapAPI } from '../../../config';

import originMarker from '../../../../public/Icons/MapMarker/originMarker.png';
import destinationMarker from '../../../../public/Icons/MapMarker/destinationMarker.png';
import stopMarker from '../../../../public/Icons/MapMarker/stopMarker.png';

class ShowMap extends Component {
    static defaultProps = {
        zoom: 4,
        height: '400px',
        width: '100%',
        center: { lat: 37.0902, lng: -95.7129 }
    };

    render() {
        const { mapMarkerPoints, mapRouteDirections, zoom, height, width, center } = this.props;
        let mapStyles = [
            {
                featureType: "poi",
                elementType: "geometry",
                stylers: [
                    {
                        color: "#eeeeee",
                    },
                ],
            },
            {
                featureType: "poi",
                elementType: "labels.text",
                stylers: [
                    {
                        visibility: "off",
                    },
                ],
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [
                    {
                        color: "#9e9e9e",
                    },
                ],
            },
        ];


        return (
            <ReactGoogleMapLoader
                params={{
                    key: googleMapAPI,
                    libraries: "geometry,drawing,places"
                }}
                render={googleMaps =>
                    googleMaps && (
                        <div>
                            <GoogleMap
                                ref={(map) => this.map = map}
                                zoom={zoom}
                                center={center}
                                mapContainerStyle={{ height, width }}
                                onLoad={this.onPolygonLoad}
                                options={{
                                    styles: mapStyles,
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                    zoomControlOptions: {
                                        position: google.maps.ControlPosition.LEFT_BOTTOM
                                    }
                                }}
                            >
                                {
                                    mapRouteDirections && mapMarkerPoints && mapMarkerPoints.length > 0 && mapMarkerPoints.map((position, index) => (
                                        <Marker
                                            key={index}
                                            position={position}
                                            icon={index === 0 ? originMarker : (index === mapMarkerPoints.length - 1 ? destinationMarker : stopMarker)}
                                        />
                                    ))
                                }
                                {
                                    mapRouteDirections && <DirectionsRenderer
                                        directions={mapRouteDirections}
                                        options={{
                                            suppressMarkers: true,
                                            polylineOptions: {
                                                strokeWeight: 4,
                                                strokeOpacity: 1,
                                                strokeColor: '#000000'
                                            }
                                        }}
                                    />
                                }
                            </GoogleMap>
                        </div>
                    )
                }
            />
        )
    }
}

const mapState = state => ({});

const mapDispatch = {
    change
};

export default connect(mapState, mapDispatch)(ShowMap);