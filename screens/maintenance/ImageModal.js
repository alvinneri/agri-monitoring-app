import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { CarouselComponent } from "../../components/carousel";
import { theme } from "../../theme";

export const ImageModal = ({ image, setOpen, open }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={open}
      onRequestClose={() => {
        setOpen(!open);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Pressable
            style={[styles.btn, styles.buttonClose]}
            onPress={() => setOpen(!open)}
          >
            <Text style={styles.textStyle}>Close</Text>
          </Pressable>
          <CarouselComponent photos={image} />
        </View>
      </View>
    </Modal>
  );
};

const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  btn: {
    marginBottom: 10,
    padding: 15,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    width: wp("90%"),
  },
  text: {
    fontSize: wp("4%"),
    marginVertical: 5,
  },
  image: {
    width: wp("90%"),
    height: hp("50%"),
  },

  // Modal
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    zIndex: 10,
  },
  modalView: {
    zIndex: 9,
    height: hp("80%"),
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: "#fff",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: theme.colors.primary,
  },
  textStyle: {
    color: theme.colors.lighta,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
