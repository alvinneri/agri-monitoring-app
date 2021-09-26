import {
  LOADING,
  SUCCESS_MSG,
  SET_LINK_CODE,
  SET_USER,
  SET_SCANNED_ASSET,
} from "./constants";

const initialState = {
  isLoading: false,
  successMsg: "",
  user: null,
  scannedAsset: null,
};

export default function reducer(state = initialState, { type, payload }) {
  switch (type) {
    case SET_USER: {
      return {
        ...state,
        user: payload,
      };
    }
    case LOADING: {
      return {
        ...state,
        isLoading: payload,
      };
    }
    case SUCCESS_MSG: {
      return {
        ...state,
        successMsg: payload,
      };
    }
    case SET_SCANNED_ASSET: {
      return {
        ...state,
        scannedAsset: payload,
      };
    }
    default:
      return state;
  }
}
