import {
  SET_LOCALE_START,
  SET_LOCALE_SUCCESS,
  SET_LOCALE_ERROR,
} from '../constants';

export default function intl(state = null, action) {
  if (state === null) {
    return {
      initialNow: Date.now(),
    };
  }

  switch (action.type) {
    case SET_LOCALE_START: {
      const locale = state[action.payload.locale]
        ? action.payload.locale
        : state.locale;
      return {
        ...state,
        locale,
        newLocale: action.payload.locale,
        loading: action.payload.loading,
      };
    }

    case SET_LOCALE_SUCCESS: {
      return {
        ...state,
        locale: action.payload.locale,
        newLocale: null,
        messages: {
          ...state.messages,
          [action.payload.locale]: action.payload.messages,
        },
        loading: action.payload.loading,
      };
    }

    case SET_LOCALE_ERROR: {
      return {
        ...state,
        newLocale: null,
        loading: action.payload.loading,
      };
    }

    default: {
      return state;
    }
  }
}
