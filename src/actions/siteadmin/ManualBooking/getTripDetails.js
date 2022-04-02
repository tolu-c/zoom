import { toastr } from 'react-redux-toastr';
import { change } from 'redux-form';

import query from './getTripDetailsQuery.graphql';

import { getDistanceAndDuration, getMapDirections } from '../../../helpers/ManualBooking/googleMapAPI';

export default function getTripDetails({ variables, isReload, locations }) {
  return async (dispatch, getState, { client }) => {
    let bookingLocations = [], loaderName = isReload ? 'reloadButton' : 'stepTwo';
    try {

      dispatch(change("ManualBookingForm", ("loaders." + loaderName), true));

      if (!isReload) {
        const estimation = await getDistanceAndDuration({ distanceType: variables.distanceType, locations });
        variables.totalDistance = estimation.totalDistance;
        variables.totalDuration = estimation.totalDuration;
        bookingLocations = estimation.bookingLocations;
      }

      if (!variables.totalDistance || !variables.totalDuration) {
        dispatch(change("ManualBookingForm", ("loaders." + loaderName), false));
        toastr.error("Error!", "Oops! something went wrong. Please try again.");
        return false;
      }

      const { data } = await client.query({
        query,
        variables,
        fetchPolicy: 'network-only'
      });

      if (data && data.getTripDetails && data.getTripDetails.status === 200) {
        if (!isReload) {
          if (bookingLocations && bookingLocations.length > 0) {
            let requestData = {
              origin: { lat: bookingLocations[0].locationLat, lng: bookingLocations[0].locationLng },
              destination: {
                lat: bookingLocations[bookingLocations.length - 1].locationLat,
                lng: bookingLocations[bookingLocations.length - 1].locationLng
              }
            };
            if (bookingLocations.length > 2) {
              requestData['waypoints'] = [];
              bookingLocations.map((location, index) =>
                index !== 0 && index !== bookingLocations.length - 1 &&
                requestData['waypoints'].push({ location: new google.maps.LatLng(location.locationLat, location.locationLng) })
              );
            }

            let mapRouteDirections = await getMapDirections(requestData), mapMarkerPoints = [];

            if (mapRouteDirections && mapRouteDirections.request && mapRouteDirections.request.origin && mapRouteDirections.request.destination) {
              //mapMarkerPoints should be always start with origin and end with destination. In between stops should be added. 
              // Based on this variable index, the orgin, destination and stop points are differentiated in the map.
              if (mapRouteDirections.request.origin.location) {
                let lat = mapRouteDirections.request.origin.location.lat(),
                  lng = mapRouteDirections.request.origin.location.lng();
                if (lat && lng) mapMarkerPoints.push({ lat, lng })
              }
              if (mapRouteDirections.request.waypoints && mapRouteDirections.request.waypoints.length > 0) {
                mapRouteDirections.request.waypoints.map(point => {
                  let lat = point && point.location && point.location.location.lat(),
                    lng = point && point.location && point.location.location.lng();
                  if (lat && lng) mapMarkerPoints.push({ lat, lng });
                });
              }
              if (mapRouteDirections.request.destination.location) {
                let lat = mapRouteDirections.request.destination.location.lat(),
                  lng = mapRouteDirections.request.destination.location.lng();
                if (lat && lng) mapMarkerPoints.push({ lat, lng });
              }
            }

            if (mapMarkerPoints.length === bookingLocations.length) {
              await dispatch(change("ManualBookingForm", 'mapRouteDirections', mapRouteDirections));
              await dispatch(change("ManualBookingForm", 'mapMarkerPoints', mapMarkerPoints));
            }
          }
          await dispatch(change("ManualBookingForm", 'totalDistance', variables.totalDistance));
          await dispatch(change("ManualBookingForm", 'totalDuration', variables.totalDuration));
          await dispatch(change("ManualBookingForm", 'bookingLocations', bookingLocations));
          await dispatch(change("ManualBookingForm", 'stepTwoCompleted', true));
        }
        await dispatch(change("ManualBookingForm", 'categories', data.getTripDetails.results));
        await dispatch(change("ManualBookingForm", ("loaders." + loaderName), false));
      }
      else {
        let errorMessage = data && data.getTripDetails && data.getTripDetails.errorMessage;
        toastr.error("Error!", errorMessage || "Oops! something went wrong. Please try again.");
        dispatch(change("ManualBookingForm", ("loaders." + loaderName), false));
      }
      return true;
    } catch (error) {
      dispatch(change("ManualBookingForm", ("loaders." + loaderName), false));
      toastr.error("Error!", "Oops! something went wrong. Please try again. " + error);
      return false;
    }
  };
}