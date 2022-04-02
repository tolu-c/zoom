import {
  GET_MAP_DATA_START,
  GET_MAP_DATA_SUCCESS,
  GET_MAP_DATA_ERROR
} from '../../../constants';

import gql from 'graphql-tag';

import { setLoaderStart, setLoaderComplete } from '../../loader/loader';


const getMapViewDataQuery = gql`query ($id: String!, $period: String!) {
  getMapViewData(id: $id, period: $period) {
      status
      results {
        id
        userType
        isActive
        activeStatus
        lat
        lng
        profile {
          lat
          lng
        }
    }
  }
}
`;

const getHeatMapDataQuery = gql`query ($id: String!, $period: String!) {
  getHeatMapData(id: $id, period: $period) {
    status
      results {
        id
        userType
        lat
        lng
        profile {
          lat
          lng
        }
      }
      bookingResults{
        id
        pickUpLat
        pickUpLng
      }
  }
}
`;

export function getMapViewData(id, period) {
  return async (dispatch, getState, { client }) => {
    let status, errorMessage = 'Oops! something went wrong! Please try again.';

    try {
      dispatch({
        type: GET_MAP_DATA_START,
      });

      const { data: { getMapViewData } } = await client.query({
        query: getMapViewDataQuery,
        variables: { id, period },
        fetchPolicy: 'network-only'
      });

      dispatch(setLoaderStart('GetMapData'));

      if (getMapViewData.status && getMapViewData.status === 200) {
        await dispatch({
          type: GET_MAP_DATA_SUCCESS,
          payload: {
            data: getMapViewData.results
          }
        });
        dispatch(setLoaderComplete('GetMapData'));
      } else {
        await dispatch({
          type: GET_MAP_DATA_ERROR,
        });
        dispatch(setLoaderComplete('GetMapData'));
      }
    } catch (error) {
      errorMessage = "Something went wrong! " + error;
      await dispatch({
        type: GET_MAP_DATA_ERROR,
      });
      dispatch(setLoaderComplete('GetMapData'));
    }
  }
}

export function getHeatMapData(id, period) {
  return async (dispatch, getState, { client }) => {

    try {
      dispatch({
        type: GET_MAP_DATA_START,
      });

      const { data: { getHeatMapData } } = await client.query({
        query: getHeatMapDataQuery,
        variables: { id, period },
        fetchPolicy: 'network-only'
      });

      dispatch(setLoaderStart('GetMapData'));

      if (getHeatMapData.status && getHeatMapData.status === 200) {

        let heatMapData = [];

        if (id === '6' && getHeatMapData.bookingResults && getHeatMapData.bookingResults.length > 0) {
          heatMapData = getHeatMapData.bookingResults.map((item, index) => {
            if (item.pickUpLat && item.pickUpLng) {
              return new google.maps.LatLng(item.pickUpLat, item.pickUpLng)
            }
          });
        } else if (id === '7' && getHeatMapData.results && getHeatMapData.results.length > 0) {
          heatMapData = getHeatMapData.results.map((item, index) => {
            if (item.lat && item.lng) {
              return new google.maps.LatLng(item.lat, item.lng)
            }
          });
        }

        await dispatch({
          type: GET_MAP_DATA_SUCCESS,
          payload: {
            heatMapData,
          }
        });
        dispatch(setLoaderComplete('GetMapData'));
      } else {
        await dispatch({
          type: GET_MAP_DATA_ERROR,
        });
        dispatch(setLoaderComplete('GetMapData'));
      }
    } catch (error) {
      await dispatch({
        type: GET_MAP_DATA_ERROR,
      });
      dispatch(setLoaderComplete('GetMapData'));
    }
  }
}


