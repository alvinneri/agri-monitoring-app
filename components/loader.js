import React from "react";
import Spinner from "react-native-loading-spinner-overlay";
import { useSelector } from "react-redux";

export default Loader = () => {
  const { isLoading } = useSelector((state) => state.public);

  return (
    <Spinner
      //visibility of Overlay Loading Spinner
      visible={isLoading}
      //Text with the Spinner
      textContent={"Loading..."}
    />
  );
};
