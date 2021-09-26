import React, { FC, useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Modal,
  Pressable,
  TouchableOpacity,
  Image,
} from "react-native";

import { useSelector, useDispatch } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { db } from "../../../firebase/config";
import moment from "moment";
import { Button, useTheme } from "react-native-paper";
import { CarouselComponent } from "../../../components/carousel";
import { theme } from "../../../theme";
import RNPickerSelect, { defaultStyles } from "react-native-picker-select";

export default function ReportsDetailsScreen({ navigation, route }) {
  const { ticket } = route.params;
  const { user } = useSelector((state) => state.public);
  const [tickets, setTickets] = useState([]);
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState("");
  const reportsRef = db.collection("maintenance");
  const [priorityLevel, setPriorityLevel] = useState(null);

  const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: "gray",
      borderRadius: 4,
      color: colors.lighta,
      paddingRight: 30, // to ensure the text is never behind the icon
      backgroundColor: theme.colors.primary,
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 0.5,
      borderColor: "purple",
      borderRadius: 8,
      color: colors.lighta,
      paddingRight: 30, // to ensure the text is never behind the icon
    },
  });

  const priorityLevelOptions = [
    {
      value: 1,
      label: "1",
    },
    {
      value: 2,
      label: "2",
    },
    {
      value: 3,
      label: "3",
    },
    {
      value: 4,
      label: "4",
    },
    {
      value: 5,
      label: "5",
    },
  ];

  const getTickets = async () => {
    console.log(user, "user");
    const maintenanceRef = await db
      .collection("maintenance")
      .orderBy("date", "desc")
      .where("condoId", "==", user.invitedBy.trim());

    const unsubscribed = maintenanceRef.onSnapshot((querySnapshot) => {
      let _tickets = [];
      querySnapshot.forEach((doc) => {
        let _ticket = {
          ...doc.data(),
          id: doc.id,
        };
        _tickets.push(_ticket);
      });
      setTickets(_tickets);
    });
    return unsubscribed;
  };

  const changeStatusApprove = (id) => {
    reportsRef.doc(id).update({
      status: `APPROVED`,
      dateApproved: new Date(),
    });
  };

  const changeStatusReject = (id) => {
    reportsRef.doc(id).update({
      status: `REJECT`,
    });
  };

  useEffect(() => {
    getTickets();
  }, []);

  const updateTicket = () => {
    reportsRef.doc(ticket.id).update({
      priorityLevel: priorityLevel,
    });
    Toast.show({
      position: "bottom",
      text1: "Priority Level Updated.",
    });
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.btnOptions]}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Text style={{ color: colors.primary, fontSize: wp("4%") }}>
            BACK
          </Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsHorizontalScrollIndicator={false}
        >
          <View>
            <View style={styles.card}>
              <Text style={styles.text}>
                Asset Name:{" "}
                {ticket?.asset.assetName ? ticket?.asset.assetName : "N/A"}
              </Text>
              <Text style={styles.text}>
                Asset Code:{" "}
                {ticket?.asset.assetCode ? ticket?.asset.assetCode : "N/A"}
              </Text>
              <Text style={styles.text}>
                Description: {ticket?.description}
              </Text>
              <Text style={styles.text}>
                Reporter Name: {ticket?.reporterName}
              </Text>
              <Text style={styles.text}>
                Date Reported:
                {moment(ticket?.date.toDate()).format("MMM DD YYYY h:mm A")}
              </Text>
              <Text style={styles.text}>
                Date Approved:
                {ticket?.dateApproved
                  ? moment(ticket?.dateApproved.toDate()).format(
                      "MMM DD YYYY h:mm A"
                    )
                  : "None"}
              </Text>

              <Text style={styles.text}>
                Date Assigned:
                {ticket?.dateAssigned
                  ? moment(ticket?.dateAssigned.toDate()).format(
                      "MMM-DD-YYYY h:mm A"
                    )
                  : "None"}
              </Text>
              <Text style={styles.text}>
                Date Done:
                {ticket?.dateDone
                  ? moment(ticket?.dateDone.toDate()).format(
                      "MMM DD YYYY h:mm A"
                    )
                  : "None"}
              </Text>
              <Text style={styles.text}>
                Duration (hours): {ticket?.duration ? ticket?.duration : "N/A"}
              </Text>
              <Text style={styles.text}>
                Assignee Name:{" "}
                {ticket?.assignee ? ticket?.assignee.name : "None"}
              </Text>
              <Text style={styles.text}>
                Assignee Remarks: {ticket?.remarks ? ticket?.remarks : "None"}
              </Text>
              <Text style={styles.text}>After Fix Photo:</Text>
              {ticket?.imageSubmitted ? (
                <Image
                  source={{
                    uri: ticket?.imageSubmitted ? ticket?.imageSubmitted : null,
                  }}
                  style={{ height: hp("30%"), width: wp("80%") }}
                />
              ) : (
                <Text style={styles.text}>None</Text>
              )}

              <Text style={styles.text}>Status: {ticket?.status}</Text>
              {ticket.status === "OPEN" ? (
                <View style={styles.options}>
                  <TouchableOpacity
                    style={[styles.btnOptions, { backgroundColor: "green" }]}
                    onPress={() => {
                      changeStatusApprove(ticket.id);
                    }}
                  >
                    <Text style={{ color: "#ffffff", fontSize: wp("4%") }}>
                      APPROVE
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btnOptions, { backgroundColor: "red" }]}
                    onPress={() => {
                      changeStatusReject(item.id);
                    }}
                  >
                    <Text style={{ color: "#ffffff", fontSize: wp("4%") }}>
                      REJECT
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              <Text style={styles.text}>
                Priority Level:{" "}
                {ticket?.priorityLevel ? ticket?.priorityLevel : "Not Set"}
              </Text>
              <RNPickerSelect
                placeholder={{
                  label: "Select Priority Level",
                  color: "#ffffff",
                }}
                items={priorityLevelOptions}
                onValueChange={(value) => {
                  setPriorityLevel(value);
                }}
                style={pickerSelectStyles}
                value={priorityLevel}
                useNativeAndroidPickerStyle={false}
              />
              <Button
                onPress={() => {
                  updateTicket();
                }}
                style={{
                  backgroundColor: theme.colors.accent,
                  marginVertical: 10,
                }}
              >
                <Text style={{ fontSize: wp("4%") }}>UPDATE</Text>
              </Button>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                position: "absolute",
                top: 15,
                right: 20,
                padding: 7,
                borderRadius: 3,
              }}
              onPress={() => {
                setImage(ticket?.image);
                setModalVisible(true);
              }}
            >
              <Text style={{ color: "#ffffff", fontSize: wp("3%") }}>
                View Image
              </Text>
            </TouchableOpacity>
          </View>
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
            <CarouselComponent photos={image} />
            <Pressable
              style={[styles.btn, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    backgroundColor: theme.colors.lighta,
  },
  name: {
    fontSize: 20,
    padding: 20,
    color: theme.colors.primary,
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
    backgroundColor: "#ebebeb",
    marginTop: 10,
    justifyContent: "center",
    backgroundColor: theme.colors.light,
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
  btnOptions: {
    marginBottom: 5,
    padding: 10,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    width: wp("30%"),
  },
  options: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
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
    height: 500,
    margin: 20,
    backgroundColor: "white",
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
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
