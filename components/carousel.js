import React, { useRef, useEffect } from "react";
import { Dimensions, Text, View, StyleSheet } from "react-native";
import Carousel from "react-native-snap-carousel";
import Image from "react-native-image-progress";
import { ProgressBar } from "react-native-progress";

export const CarouselComponent = ({ photos, navigation, ...rest }) => {
  const carousel = useRef(null);
  const { width: viewportWidth, height: viewportHeight } =
    Dimensions.get("screen");
  const wp = (percentage) => {
    const value = (percentage * viewportWidth) / 100;
    return Math.round(value);
  };
  const slideWidth = wp(100);
  const itemHorizontalMargin = wp(1);
  const sliderWidth = viewportWidth;
  const itemWidth = slideWidth + itemHorizontalMargin * 10;

  const renderCard = ({ item }) => {
    return (
      <View>
        <View>
          <Image
            source={{ uri: item?.uri ? item.uri : item }}
            indicator={ProgressBar}
            style={[{ height: 350, width: "100%", backgroundColor: "#000000" }]}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  };

  return (
    <View>
      <Carousel
        ref={carousel}
        data={photos}
        renderItem={renderCard}
        sliderWidth={sliderWidth}
        itemWidth={itemWidth}
        activeSlideAlignment={"start"}
        inactiveSlideOpacity={1}
        inactiveSlideScale={1}
        callbackOffsetMargin={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
