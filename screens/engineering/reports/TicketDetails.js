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
  ImageBackground,
  TextInput,
} from "react-native";
import firebase from "../../../firebase/config";
import Toast from "react-native-toast-message";
import { useSelector, useDispatch } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { db, storage } from "../../../firebase/config";
import moment from "moment";
import { Button, useTheme } from "react-native-paper";
import { CarouselComponent } from "../../../components/carousel";
import RNPickerSelect, { defaultStyles } from "react-native-picker-select";
import { theme } from "../../../theme";
import { Camera } from "expo-camera";
import { setLoading } from "../../../redux/public/actions";
let camera;

export default function ReportsDetailsScreen({ navigation, route }) {
  const [startCamera, setStartCamera] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState("off");
  const dispatch = useDispatch();
  const { ticket } = route.params;
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
  const [photos, setPhotos] = useState([]);
  const [duration, setDuration] = useState("");
  const [remarks, setRemarks] = useState("");

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

  const __startCamera = async () => {
    const { status } = await Camera.requestPermissionsAsync();
    console.log(status);
    if (status === "granted") {
      setStartCamera(true);
    } else {
      Alert.alert("Access denied");
    }
  };
  const __takePicture = async () => {
    const photo = await camera.takePictureAsync();
    setPreviewVisible(true);
    setCapturedImage(photo);
  };

  const __retakePicture = () => {
    setCapturedImage(null);
    setPreviewVisible(false);
    __startCamera();
  };
  const __handleFlashMode = () => {
    if (flashMode === "on") {
      setFlashMode("off");
    } else if (flashMode === "off") {
      setFlashMode("on");
    } else {
      setFlashMode("auto");
    }
  };
  const __switchCamera = () => {
    if (cameraType === "back") {
      setCameraType("front");
    } else {
      setCameraType("back");
    }
  };

  const __savePhoto = async () => {
    let _photos = [];
    _photos.push(capturedImage);
    setPreviewVisible(false);
    setStartCamera(false);
    setPhotos(_photos);
  };

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

    await reportsRef.doc(id).update({
      status: "ASSIGNED",
      dateAssigned: new Date(),
      assignee: {
        id: assignee,
        name: emp[0].label,
      },
    });
    Toast.show({
      position: "bottom",
      text1: "Assignee Updated.",
    });
  };

  const submitForApproval = async (id) => {
    dispatch(setLoading(true));
    const date = new Date();
    const filename = `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`;

    if (photos.length) {
      photos.forEach((item, index) => {
        fetch(item.uri)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "File name", { type: "image/png" });
            const uploadTask = storage
              .ref()
              .child(`/maintenance/${user.invitedBy}/${filename}_${index}`)
              .put(file);

            uploadTask.on(
              firebase.storage.TaskEvent.STATE_CHANGED,
              (snapshot) => {
                const progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Progress: ${progress}%`);
                if (snapshot.state === firebase.storage.TaskState.RUNNING) {
                  console.log("file uploading...");
                }
                // ...etc
              },
              (error) => console.log(error.code),
              async () => {
                const downloadURL =
                  await uploadTask.snapshot.ref.getDownloadURL();
                if (index === photos.length - 1) {
                  await reportsRef.doc(id).update({
                    status: "SUBMITTED",
                    imageSubmitted: downloadURL,
                    dateAssigneeSubmitted: new Date(),
                    remarks: remarks,
                    duration: duration,
                  });

                  Toast.show({
                    position: "bottom",
                    text1: "Report successfully submitted. ",
                  });
                  dispatch(setLoading(false));

                  setRemarks("");
                  setDuration("");

                  navigation.goBack();
                }
              }
            );
          });
      });
    } else {
      dispatch(setLoading(false));
    }
  };

  const returnToAssignee = () => {
    if (assignee) {
      reportsRef.doc(ticket.id).update({
        status: "ASSIGNED",
      });
      Toast.show({
        position: "bottom",
        text1: `Ticket returned to assignee.`,
      });
    }
  };

  const setAsDone = () => {
    if (assignee) {
      reportsRef.doc(ticket.id).update({
        status: "DONE",
        dateDone: new Date(),
      });
      if (ticket?.asset?.id) {
        assetsRef.doc(ticket.asset.id).collection("history").add({
          assetName: ticket.asset.assetName,
          assetCode: ticket.asset.assetCode,
          date: new Date(),
          type: "ASSET_REPORTS",
          others: "ITEM DONE FIXING",
        });
        Toast.show({
          position: "bottom",
          text1: `Ticket successfully set as done.`,
        });
      }
    }
  };

  const pulloutAsset = () => {
    reportsRef.doc(ticket.id).update({
      status: "PULLED-OUT",
    });
    if (ticket?.asset?.id) {
      assetsRef.doc(ticket.asset.id).collection("history").add({
        assetName: ticket.asset.assetName,
        assetCode: ticket.asset.assetCode,
        date: new Date(),
        location: "PULLED-OUT",
        type: "ASSET_REPORTS",
        others: "ITEM PULLED OUT",
      });
      Toast.show({
        position: "bottom",
        text1: `Asset tagged as Pull Out.`,
      });
    }
  };

  useEffect(() => {
    getEngineeringEmployees();
    getTickets();
  }, []);

  return (
    <>
      {startCamera ? (
        <View
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
          }}
        >
          {previewVisible && capturedImage ? (
            <CameraPreview
              photo={capturedImage}
              savePhoto={__savePhoto}
              retakePicture={__retakePicture}
            />
          ) : (
            <Camera
              type={cameraType}
              flashMode={flashMode}
              style={{ flex: 1 }}
              ref={(r) => {
                camera = r;
              }}
            >
              <View
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "transparent",
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    left: "5%",
                    top: "10%",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity onPress={() => setStartCamera(false)}>
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 20,
                        marginVertical: 10,
                      }}
                    >
                      BACK
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={__handleFlashMode}
                    style={{
                      backgroundColor: flashMode === "off" ? "#000" : "#fff",
                      borderRadius: 50,
                      height: 25,
                      width: 25,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                      }}
                    >
                      ⚡️
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={__switchCamera}
                    style={{
                      marginTop: 20,
                      borderRadius: 50,
                      height: 25,
                      width: 25,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                      }}
                    >
                      {cameraType === "front" ? "🤳" : "📷"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    flexDirection: "row",
                    flex: 1,
                    width: "100%",
                    padding: 20,
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      alignSelf: "center",
                      flex: 1,
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={__takePicture}
                      style={{
                        width: 70,
                        height: 70,
                        bottom: 0,
                        borderRadius: 50,
                        backgroundColor: "#ffffff",
                      }}
                    />
                  </View>
                </View>
              </View>
            </Camera>
          )}
        </View>
      ) : (
        <>
          <View style={styles.container}>
            <TouchableOpacity
              style={{ margin: 20 }}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Text style={{ color: theme.colors.primary, fontSize: wp("4%") }}>
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
                    Duration (hours):{" "}
                    {ticket?.duration ? ticket?.duration : "N/A"}
                  </Text>
                  {!isHead && (
                    <TextInput
                      autoCapitalize="none"
                      multiline={true}
                      name="duration"
                      label="Duration (hours)"
                      style={{
                        marginBottom: 10,
                        backgroundColor: "#ffffff",
                        padding: 10,
                        fontSize: wp("4%"),
                      }}
                      onChangeText={(value) => setDuration(value)}
                      value={duration}
                      keyboardType="numeric"
                    />
                  )}
                  <Text style={styles.text}>
                    Assignee Name:{" "}
                    {ticket?.assignee ? ticket?.assignee.name : "None"}
                  </Text>
                  <Text style={styles.text}>
                    Assignee Remarks:{" "}
                    {ticket?.remarks ? ticket?.remarks : "None"}
                  </Text>
                  {!isHead && (
                    <TextInput
                      autoCapitalize="none"
                      multiline={true}
                      name="remarks"
                      label="Remarks"
                      numberOfLines={4}
                      style={{
                        marginBottom: 10,
                        backgroundColor: "#ffffff",
                        padding: 10,
                        fontSize: wp("4%"),
                        height: hp("10%"),
                      }}
                      onChangeText={(value) => setRemarks(value)}
                      value={remarks}
                    />
                  )}

                  <Text style={styles.text}>After Fix Photo:</Text>
                  {ticket?.imageSubmitted ? (
                    <Image
                      source={{
                        uri: ticket?.imageSubmitted
                          ? ticket?.imageSubmitted
                          : photos[0]?.uri
                          ? photos[0]?.uri
                          : null,
                      }}
                      style={{ height: hp("30%"), width: wp("80%") }}
                    />
                  ) : photos?.length ? (
                    <Image
                      source={{
                        uri: ticket?.imageSubmitted
                          ? ticket?.imageSubmitted
                          : photos[0]?.uri
                          ? photos[0]?.uri
                          : null,
                      }}
                      style={{ height: hp("30%"), width: wp("80%") }}
                    />
                  ) : (
                    <Text style={styles.text}>None</Text>
                  )}
                  <Text style={styles.text}>
                    Priority Level:{" "}
                    {ticket?.priorityLevel ? ticket?.priorityLevel : "Not Set"}
                  </Text>
                  <Text style={styles.text}>Status: {ticket?.status}</Text>
                  <Text style={styles.text}>
                    Assigned To: {ticket?.assignee?.name}
                  </Text>

                  {!isHead ? (
                    <>
                      <TouchableOpacity
                        disabled={ticket?.status === "DONE" ? true : false}
                        style={{
                          backgroundColor:
                            ticket?.status === "DONE"
                              ? "#c1c1c1"
                              : theme.colors.accent,
                          padding: 10,
                          margin: 10,
                        }}
                        onPress={() => {
                          submitForApproval(ticket.id);
                        }}
                      >
                        <Text
                          style={{
                            color: "#ffffff",
                            fontSize: wp("4%"),
                            textAlign: "center",
                          }}
                        >
                          SUBMIT FOR APPROVAL
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={ticket?.status === "DONE" ? true : false}
                        style={{
                          backgroundColor:
                            ticket?.status === "DONE"
                              ? "#c1c1c1"
                              : theme.colors.accent,
                          padding: 10,
                          margin: 10,
                        }}
                        onPress={() => {
                          pulloutAsset();
                        }}
                      >
                        <Text
                          style={{
                            color: "#ffffff",
                            fontSize: wp("4%"),
                            textAlign: "center",
                          }}
                        >
                          PULL OUT ASSSET
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        disabled={ticket?.status === "DONE" ? true : false}
                        style={{
                          backgroundColor:
                            ticket?.status === "DONE"
                              ? "#c1c1c1"
                              : theme.colors.accent,
                          padding: 10,
                          margin: 10,
                        }}
                        onPress={__startCamera}
                      >
                        <Text
                          style={{
                            color: "#ffffff",
                            fontSize: wp("4%"),
                            textAlign: "center",
                          }}
                        >
                          UPLOAD AFTER FIX PHOTO
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : null}

                  {isHead && ticket.status !== "DONE" ? (
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
                        disabled={ticket?.status === "ASSIGNED" ? true : false}
                        placeholder={{
                          label: "Select Engineering Staff",
                          color: "#ffffff",
                        }}
                        items={engEmployee}
                        onValueChange={(value) => {
                          setAssignee(value);
                        }}
                        style={pickerSelectStyles}
                        value={assignee}
                        useNativeAndroidPickerStyle={false}
                      />
                      <TouchableOpacity
                        disabled={ticket?.status === "ASSIGNED" ? true : false}
                        style={{
                          backgroundColor:
                            ticket?.status === "ASSIGNED"
                              ? "#c1c1c1"
                              : theme.colors.accent,
                          padding: 10,
                          marginVertical: 10,
                        }}
                        onPress={() => {
                          handleAssign(ticket.id);
                        }}
                      >
                        <Text style={{ color: "#ffffff", fontSize: wp("4%") }}>
                          ASSIGN
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "green",
                          padding: 10,
                          marginVertical: 10,
                        }}
                        onPress={() => {
                          setAsDone();
                        }}
                      >
                        <Text style={{ color: "#ffffff", fontSize: wp("4%") }}>
                          SET AS DONE
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "red",
                          padding: 10,
                          marginVertical: 10,
                        }}
                        onPress={() => {
                          returnToAssignee();
                        }}
                      >
                        <Text style={{ color: "#ffffff", fontSize: wp("4%") }}>
                          RETURN TO ASSIGNEE
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
                {" "}
                Z
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
      )}
    </>
  );
}

const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
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
    zIndex: 9,
    height: hp("80%"),
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
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

const CameraPreview = ({ photo, retakePicture, savePhoto }) => {
  return (
    <View
      style={{
        backgroundColor: "transparent",
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <ImageBackground
        source={{ uri: photo && photo.uri }}
        style={{
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            padding: 15,
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={retakePicture}
              style={{
                width: 130,
                height: 40,

                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                }}
              >
                Re-take
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={savePhoto}
              style={{
                width: 130,
                height: 40,

                alignItems: "center",
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                }}
              >
                save photo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
