import React, { FC, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { db } from "../../firebase/config";
import moment from "moment";
import { Divider, useTheme } from "react-native-paper";
import { CarouselComponent } from "../../components/carousel";
import { theme } from "../../theme";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function MaintenanceScreen() {
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
  });
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.public);
  const [tickets, setTickets] = useState([]);
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState("");

  const getTickets = async () => {
    console.log(user, "user");
    const maintenanceRef = await db
      .collection("maintenance")
      .where("condoId", "==", user.invitedBy.trim())
      .where("reporterUid", "==", user.uid);

    const unsubscribed = maintenanceRef.onSnapshot((querySnapshot) => {
      let _tickets = [];
      querySnapshot.forEach((doc) => {
        console.log(doc.data());
        _tickets.push(doc.data());
      });
      console.log(_tickets, "_tickets");
      setTickets(_tickets);
    });
    return unsubscribed;
  };

  useEffect(() => {
    getTickets();
  }, []);

  if (!fontsLoaded) {
    return null;
  } else {
    return (
      <>
        <View style={styles.container}>
          <Text style={styles.name}>My Reported Tickets</Text>
          <Divider style={{ height: hp("0.2%") }} />
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsHorizontalScrollIndicator={false}
          >
            {tickets.length ? (
              tickets.map((item, index) => {
                return (
                  <View key={index}>
                    <View style={styles.card}>
                      <Text style={styles.text}>
                        Asset Code:{" "}
                        {item?.asset?.assetCode
                          ? item?.asset?.assetCode
                          : "N/A"}
                      </Text>
                      <Text style={styles.text}>
                        Description: {item?.description}
                      </Text>
                      <Text style={styles.text}>
                        Date:{" "}
                        {moment(item?.date.toDate()).format(
                          "MMM DD YYYY h:mm A"
                        )}
                      </Text>
                      <Text style={styles.text}>
                        Date Approved:{" "}
                        {item?.dateApproved
                          ? moment(item?.dateApproved.toDate()).format(
                              "MMM-DD-YYYY h:mm A"
                            )
                          : "None"}
                      </Text>
                      <Text style={styles.text}>
                        Date Assigned:{" "}
                        {item?.dateAssigned
                          ? moment(item?.dateAssigned.toDate()).format(
                              "MMM-DD-YYYY h:mm A"
                            )
                          : "None"}
                      </Text>
                      <Text style={styles.text}>
                        Assignee:{" "}
                        {item?.assignee ? item?.assignee.name : "None"}
                      </Text>
                      <Text style={styles.text}>
                        Assignee Remarks:{" "}
                        {item?.remarks ? item?.remarks : "None"}
                      </Text>
                      <Text style={styles.text}>Status: {item?.status}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        {
                          backgroundColor: colors.primary,
                          position: "absolute",
                          top: 15,
                          right: 20,
                          padding: 7,
                          borderRadius: 3,
                        },
                      ]}
                      onPress={() => {
                        setImage(item?.image);
                        setModalVisible(true);
                      }}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: wp("3%"),
                          fontFamily: "Poppins_400Regular",
                        }}
                      >
                        View Image
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View
                style={{ flex: 1, justifyContent: "center", height: hp("70%") }}
              >
                <Text style={{ fontSize: 20, fontStyle: "italic" }}>
                  No Tickets Found
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Pressable
                style={[styles.btn, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>Close</Text>
              </Pressable>
              <CarouselComponent photos={image} />
            </View>
          </View>
        </Modal>
      </>
    );
  }
}

const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
  name: {
    padding: 20,
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: wp("6%"),
    fontFamily: "Poppins_700Bold",
  },
  scrollContainer: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  card: {
    width: wp("90%"),
    alignSelf: "stretch",
    textAlign: "center",
    padding: 20,
    backgroundColor: theme.colors.primary,
    marginTop: 10,
    justifyContent: "center",
    borderRadius: 20,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.6,
    shadowRadius: 4.84,

    elevation: 5,
  },
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
    color: theme.colors.light,
    fontFamily: "Poppins_400Regular",
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
  },
  modalView: {
    height: 700,
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
    fontFamily: "Poppins_400Regular",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
  },
});
