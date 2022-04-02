import fetch from 'node-fetch';
import { googleMapServerKey, unitTypes } from '../../config';

const mapLink = 'https://maps.googleapis.com/maps/api/distancematrix/json';

export async function getDistanceAndDuration({ distanceType, locations }) {
    let result = { totalDistance: 0, totalDuration: 0, bookingLocations: [] }, origins = [], destinations = [], units = unitTypes[distanceType];

    if (!locations || locations.length < 2 || !units || !units.value || !google || !google.maps) return result;

    locations.map((location, index) => {
        if (index > 0) destinations.push({ lat: location.lat, lng: location.lng });
        if (index < locations.length - 1) origins.push({ lat: location.lat, lng: location.lng });
        result['bookingLocations'].push({
            id: location.id, //for edit locations, this value may or may not be exists
            location: location.location,
            locationLat: location.lat,
            locationLng: location.lng,
            locationStatus: location.locationStatus || 'pending',
            locationDistanceType: distanceType,
            locationType: index === 0 ? 'pickup' : ((index === locations.length - 1) ? 'drop' : 'stop'),
            locationDistance: 0,
            locationDuration: 0
        });
    });

    let googleService = new google.maps.DistanceMatrixService();
    if (!googleService) return result;
    const data = await new Promise((resolve, reject) => googleService.getDistanceMatrix(
        {
            origins,
            destinations,
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem[units.value.toUpperCase()]
        },
        (data, status) => resolve(status === google.maps.DirectionsStatus.OK && data ? data : null)
    ));

    if (data && data.rows && data.rows.length > 0) {
        data.rows.map((item, index) => {
            if (item && item.elements && item.elements[index] && item.elements[index].distance && item.elements[index].duration) {
                result['totalDistance'] += (item.elements[index].distance.value || 0);
                result['totalDuration'] += (item.elements[index].duration.value || 0);
                if (result['bookingLocations'][index + 1]) {
                    result['bookingLocations'][index + 1]['locationDistance'] = item.elements[index].distance.value ? (item.elements[index].distance.value / units.convertFromMeter) : 0;
                    result['bookingLocations'][index + 1]['locationDuration'] = item.elements[index].duration.value ? (item.elements[index].duration.value / 60) : 0;
                }
            }
        });
    }

    if (result['totalDuration'] > 0) result['totalDuration'] /= 60 //second to minute convertion
    if (result['totalDistance'] > 0) result['totalDistance'] /= units.convertFromMeter; //meter to either km or mile convertion

    return result;
}

export async function getDetailsFromGoogleMap({ distanceType, destinations, origins }) {
    let units = unitTypes[distanceType];

    if (!destinations || !units || !units.value || !origins) return [];

    const URL = `${mapLink}?key=${googleMapServerKey}&units=${units.value}&origins=${origins}&destinations=${destinations}`,
        resp = await fetch(URL),
        data = await resp.json();
    return data;
}

export async function getMapDirections({ destination, waypoints, origin }) {
    if (!google || !google.maps) return null;

    const directionsService = new google.maps.DirectionsService();

    if (!directionsService) return null;

    return await new Promise((resolve, reject) => directionsService.route(
        {
            travelMode: 'DRIVING',
            destination,
            waypoints,
            origin
        },
        (directions, status) => resolve(status === google.maps.DirectionsStatus.OK && directions ? directions : null)
    ));
}