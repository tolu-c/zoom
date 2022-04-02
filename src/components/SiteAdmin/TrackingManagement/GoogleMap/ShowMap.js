import React, { Component } from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';

import ReactGoogleMapLoader from "react-google-maps-loader";
import {
	GoogleMap,
	Marker,
	HeatmapLayer,
} from "@react-google-maps/api";

import { googleMapAPI } from '../../../../config';

import users from '../../../../../public/Icons/MapMarker/users.png';
import availableDrivers from '../../../../../public/Icons/MapMarker/availableDrivers.png';
import unActivatedDrivers from '../../../../../public/Icons/MapMarker/unActivatedDrivers.png';
import unAvailableDrivers from '../../../../../public/Icons/MapMarker/unAvailableDrivers.png';

class ShowMap extends Component {
	static defaultProps = {
		zoom: 4,
		height: '400px',
		width: '100%',
		center: { lat: 55.3781, lng: 3.4360 },
		bounds: []
	};


	constructor(props) {
		super(props);
		this.onLoad = this.onLoad.bind(this);
	}

	onLoad(map) {
		const { mapMarkerPoints, heatMapData, showSection, type } = this.props;
		let bounds = new google.maps.LatLngBounds();

		if (showSection === 0 && map && mapMarkerPoints && mapMarkerPoints.length > 0) {
			mapMarkerPoints.map((i) => {
				let positionData;
				if (type == 3) {
					positionData = new google.maps.LatLng(parseFloat(i.lat), parseFloat(i.lng))
				} else {
					positionData = new google.maps.LatLng(parseFloat(i.profile.lat), parseFloat(i.profile.lng))
				}
				bounds.extend(positionData);
			});
			map.fitBounds(bounds);
		}
		else if (showSection === 1 && map && heatMapData && heatMapData.length > 0) {
			heatMapData.map((i) => {
				bounds.extend(i);
			});
			map.fitBounds(bounds);
		}
	}

	render() {
		const { mapMarkerPoints, type, zoom, height, width, center, heatMapData, showSection } = this.props;
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

		let options = {
			styles: mapStyles,
			disableDefaultUI: true,
			minZoom: 2,
			maxZoom: 22,
			zoomControl: true,
		}

		if (showSection === 1) {
			options['mapTypeId'] = "satellite"
		} else {
			options['mapTypeId'] = "roadmap"
		}

		return (
			<ReactGoogleMapLoader
				params={{
					key: googleMapAPI,
					libraries: "geometry,drawing,places,visualization"
				}}
				render={googleMaps =>
					googleMaps && (
						<div>
							<GoogleMap
								ref={(map) => this.map = map}
								zoom={zoom}
								center={center}
								mapContainerStyle={{ height, width }}
								options={{
									...options,
									zoomControlOptions: {
										position: google.maps.ControlPosition.LEFT_TOP
									}
								}}
								onLoad={(map) => this.onLoad(map)}
							>
								{
									showSection === 0 && mapMarkerPoints && mapMarkerPoints.length > 0 && mapMarkerPoints.map((position, index) => {
										let positionData, icon = users;
										if (type === '1') {
											if (position.userType === 1) {
												icon = users;
											} else if (position.userType === 2) {
												if (position.isActive === 1 && position.activeStatus == 'active') {
													icon = availableDrivers;
												} else if (position.isActive === 1 && position.activeStatus == 'inactive') {
													icon = unAvailableDrivers;
												} else if (position.isActive === 0 && position.activeStatus == 'inactive') {
													icon = unActivatedDrivers;
												}
											}
										} else if (type === '2') {
											icon = users;
										} else if (type === '3') {
											icon = availableDrivers;
										} else if (type === '4') {
											icon = unAvailableDrivers;
										} else if (type === '5') {
											icon = unActivatedDrivers;
										}

										if (type == 3) {
											positionData = new google.maps.LatLng(parseFloat(position.lat), parseFloat(position.lng))
										} else {
											positionData = new google.maps.LatLng(parseFloat(position.profile.lat), parseFloat(position.profile.lng))
										}

										return (<Marker
											key={index}
											position={positionData}
											icon={icon}
										/>)
									})
								}

								{
									showSection === 1 && heatMapData && heatMapData.length > 0 && <HeatmapLayer
										data={heatMapData}
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
