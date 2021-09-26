import { LOADING, SET_USER, SET_SCANNED_ASSET } from "./constants";

export const setLoading = (state) => ({
  type: LOADING,
  payload: state,
});

export const setUser = (payload) => ({
  type: SET_USER,
  payload: payload,
});

export const setScannedAsset = (payload) => ({
  type: SET_SCANNED_ASSET,
  payload: payload,
});
