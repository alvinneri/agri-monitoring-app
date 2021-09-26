import React from "react";
import Image from "react-native-image-progress";
import { ProgressBar } from "react-native-progress";

export const ImageComponent = (props) => {
  const { source, style } = props;
  return (
    <Image source={{ uri: source }} indicator={ProgressBar} style={style} />
  );
};
