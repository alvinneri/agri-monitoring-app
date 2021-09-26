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
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { db } from "../../../firebase/config";
import moment from "moment";
import { Divider, useTheme } from "react-native-paper";
import { CarouselComponent } from "../../../components/carousel";
import RNPickerSelect, { defaultStyles } from "react-native-picker-select";
import { theme } from "../../../theme";

export default function ReportsScreen() {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.public);
  const [tickets, setTickets] = useState([]);
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState("");
  const reportsRef = db.collection("maintenance");
  const engRef = db.collection("users");
  const [isHead, setIsHead] = useState(false);
  const [engEmployee, setEngEmployee] = useState([]);
  const [assignee, setAssignee] = useState(null);
  const [reports, setReports] = useState([]);

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

  const getEngineeringEmployees = () => {
    const unsubscribe = engRef
      .where("userType", "==", "EMPLOYEE")
      .where("invitedBy", "==", user.invitedBy)
      .where("accessModules", "array-contains", "ENGINEERING")
      .onSnapshot((snapshot) => {
        let _engEmployees = [];
        snapshot.docs.forEach((doc) => {
          _engEmployees.push({
            value: doc.data().uid,
            label: `${doc.data().firstName} ${doc.data().lastName}`,
          });
        });
        setEngEmployee(_engEmployees);
      });
    return unsubscribe;
  };

  const getTickets = async () => {
    if (user.accessModules.includes("ENGINEERING_HEAD")) {
      setIsHead(true);
      const unsubscribe = reportsRef
        .where("condoId", "==", user?.invitedBy)
        .where("status", "not-in", ["OPEN", "REJECT"])
        .onSnapshot((snapshot) => {
          let _reports = [];
          snapshot.docs.forEach((doc) => {
            let _doc = {
              ...doc.data(),
              id: doc.id,
            };
            _reports.push(_doc);
          });
          setReports(_reports);
        });

      return unsubscribe;
    } else {
      setIsHead(false);
      const unsubscribe = reportsRef
        .where("condoId", "==", user?.invitedBy)
        .where("assignee.id", "==", user?.uid)
        .orderBy("date", "desc")
        .onSnapshot((snapshot) => {
          console.log(snapshot.docs);
          let _reports = [];
          snapshot.docs.forEach((doc) => {
            let _doc = {
              ...doc.data(),
              id: doc.id,
            };
            _reports.push(_doc);
          });
          console.log(_reports);
          setReports(_reports);
        });

      return unsubscribe;
    }
  };

  const handleAssign = async (id) => {
    let emp = engEmployee.filter((item) => item.value === assignee);
    console.log(emp);
    await reportsRef.doc(id).update({
      status: "ASSIGNED",
      assignee: {
        id: assignee,
        name: emp[0].label,
      },
    });
  };

  const submitForApproval = async (id) => {
    await reportsRef.doc(id).update({
      status: "DONE",
    });
  };

  useEffect(() => {
    getEngineeringEmployees();
    getTickets();
  }, []);

  const getBg = (status, level) => {
    if (status === "DONE") {
      return styles.bgDone;
    } else if (level <= 2) {
      return styles.bgOne;
    } else if (level <= 4) {
      return styles.bgThree;
    } else if (level == 5) {
      return styles.bgFive;
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.name}>All Tickets</Text>
        <Divider style={{ height: hp("0.2%") }} />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsHorizontalScrollIndicator={false}
        >
          {reports.map((item, index) => {
            return (
              <View key={index}>
                <View
                  style={[styles.card, getBg(item.status, item.priorityLevel)]}
                >
                  <Text style={styles.text}>
                    Asset Code:{" "}
                    {item?.asset.assetCode ? item?.asset.assetCode : "N/A"}
                  </Text>
                  <Text style={styles.text}>
                    Description: {item?.description}
                  </Text>
                  <Text style={styles.text}>
                    Date:{" "}
                    {moment(item?.date.toDate()).format("MMM DD YYYY h:mm A")}
                  </Text>
                  <Text style={styles.text}>Status: {item?.status}</Text>
                  <Text style={styles.text}>
                    Priority Level:{" "}
                    {item?.priorityLevel ? item?.priorityLevel : "Not Set"}
                  </Text>
                  {isHead ? (
                    <Text style={styles.text}>
                      Assigned To: {item?.assignee?.name}
                    </Text>
                  ) : null}

                  {isHead && item.status !== "DONE" ? (
                    <View
                      style={{
                        marginVertical: 10,
                        justifyContet: "center",
                        alignItem: "center",
                        alignSelf: "center",
                        width: wp("80%"),
                      }}
                    >
                      <RNPickerSelect
                        disabled={item?.status === "ASSIGNED" ? true : false}
                        placeholder={{
                          label: "Select Engineering Staff",
                          color: "#ffffff",
                        }}
                        items={engEmployee}
                        onValueChange={(value) => {
                          console.log(value);
                          setAssignee(value);
                        }}
                        style={pickerSelectStyles}
                        value={assignee}
                        useNativeAndroidPickerStyle={false}
                      />
                      <TouchableOpacity
                        disabled={item?.status === "ASSIGNED" ? true : false}
                        style={{
                          backgroundColor:
                            item?.status === "ASSIGNED"
                              ? "#c1c1c1"
                              : theme.colors.accent,
                          padding: 10,
                          marginVertical: 10,
                        }}
                        onPress={() => {
                          handleAssign(item.id);
                        }}
                      >
                        <Text style={{ color: "#ffffff", fontSize: wp("4%") }}>
                          ASSIGN
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
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
                    navigation.navigate("ReportsDetails", { ticket: item });
                  }}
                >
                  <Text style={{ color: "#ffffff", fontSize: wp("3%") }}>
                    Details
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
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
    fontWeight: "bold",
    fontSize: wp("6%"),
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
  btnDone: {
    marginVertical: 5,
    padding: 10,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    width: wp("90%"),
  },
  btnOptions: {
    marginVertical: 5,
    padding: 10,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    width: wp("80%"),
  },
  options: {
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
  bgOne: {
    backgroundColor: "yellow",
  },
  bgTwo: {
    backgroundColor: "yellow",
  },

  bgThree: {
    backgroundColor: "orange",
  },
  bgFour: {
    backgroundColor: "orange",
  },

  bgFive: {
    backgroundColor: "red",
  },

  bgDone: {
    backgroundColor: "green",
  },
});
