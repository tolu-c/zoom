import {
  GET_MAP_DATA_SUCCESS
} from '../constants';

export default function mapData(state = {}, action) {
  switch (action.type) {

    case GET_MAP_DATA_SUCCESS:
      return {
        ...state,
        data: action.payload.data,
        heatMapData: action.payload.heatMapData,
      };

    default:
      return {
        ...state,
      };
  }
}
