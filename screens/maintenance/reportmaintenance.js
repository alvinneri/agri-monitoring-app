import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Camera } from "expo-camera";
import firebase from "../../firebase/config";
import { db, storage } from "../../firebase/config";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setScannedAsset } from "../../redux/public/actions";
import { useTheme, TextInput, Button } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { ImageModal } from "./ImageModal";
import { Scanner } from "./Scanner";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
let camera;
export default function ReportMaintenanceScreen() {
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
  });
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const [startCamera, setStartCamera] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState("off");
  const { user, scannedAsset } = useSelector((state) => state.public);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [open, setOpen] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);
  const [assetCode, setAssetCode] = useState("");
  const [assetName, setAssetName] = useState("");
  const [assetId, setAssetId] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [areaName, setAreaName] = useState("");

  const dispatch = useDispatch();

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
    setPreviewVisible(false);
    setStartCamera(false);
    let _photos = [...photos];
    _photos.push(capturedImage);
    console.log(_photos);
    setPhotos(_photos);
  };

  useEffect(() => {
    if (scannedAsset) {
      setAssetCode(scannedAsset.assetCode);
      setAssetName(scannedAsset.assetName);
      setAssetId(scannedAsset.id);
      setAreaName(scannedAsset.areaName);
      setAreaCode(scannedAsset.areaCode);
    }
  }, [scannedAsset]);

  const onSubmit = async (values) => {
    dispatch(setLoading(true));

    try {
      let _downdloadUrls = [];
      const date = new Date();
      const filename = `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`;

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
              (error) => {
                Toast.show({
                  position: "bottom",
                  text1: "Error uploading photos. ",
                });
                dispatch(setLoading(false));
                console.log(error.code);
              },
              async () => {
                const downloadURL =
                  await uploadTask.snapshot.ref.getDownloadURL();
                _downdloadUrls.push(downloadURL);
                if (index === photos.length - 1) {
                  const _values = {
                    condoId: user.invitedBy.trim(),
                    reporterUid: user.uid,
                    reporterName: `${user.firstName} ${user.lastName}`,
                    asset: scannedAsset ? scannedAsset : null,
                    description: description,
                    image: _downdloadUrls,
                    date: new Date(),
                    status: "OPEN",
                  };

                  db.collection("maintenance")
                    .add(_values)
                    .then((docRef) => {
                      setStartCamera(false);
                      setCapturedImage(null);
                      setPhotos([]);
                      setDescription("");
                      setScannedAsset(null);

                      if (assetId) {
                        db.collection("assets")
                          .doc(assetId)
                          .collection("history")
                          .add({
                            assetCode: assetCode,
                            assetName: assetName,
                            location: {
                              areaCode: areaCode,
                              areaName: areaName,
                            },
                            others: `Reported by ${user.firstName} ${user.lastName}`,
                            date: new Date(),
                            type: "ASSET_REPORTS",
                          });
                      }

                      Toast.show({
                        position: "bottom",
                        text1: "Report successfully submitted. ",
                      });

                      setAssetCode("");
                      setAssetName("");
                      setAssetId("");
                      setAreaName("");
                      setAreaCode("");

                      dispatch(setLoading(false));
                    });
                }
              }
            );
          });
      });
    } catch (e) {
      dispatch(setLoading(false));
      console.log(e);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <ImageModal image={photos} open={open} setOpen={setOpen} />
        <TouchableOpacity
          onPress={() => {
            setAssetCode("");
            setAssetName("");
            setDescription("");
            setScannedAsset(null);
          }}
          style={{
            width: 130,
            borderRadius: 4,
            backgroundColor: colors.lighta,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            height: 40,
            marginLeft: 5,
            marginTop: 10,
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontWeight: "bold",
              textAlign: "center",
              fontFamily: "Poppins_400Regular",
            }}
          >
            CLEAR ALL
          </Text>
        </TouchableOpacity>
        <Scanner setOpenScanner={setOpenScanner} openScanner={openScanner} />
        {startCamera ? (
          <View
            style={{
              flex: 1,
              width: wp("100%"),
              height: hp("100%"),
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
                    width: wp("100%"),
                    height: hp("100%"),
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
                      width: wp("100%"),
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
          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <TextInput
              autoCapitalize="none"
              name="assetCode"
              label="Scan Asset Code"
              disabled
              style={{
                marginVertical: 10,
                width: wp("95%"),
                padding: 5,
                paddingBottom: 0,
                fontSize: wp("4%"),
                backgroundColor: "#ffffff",
                fontFamily: "Poppins_400Regular",
              }}
              onChangeText={(value) => setSubject(value)}
              value={assetCode}
            />
            <TextInput
              autoCapitalize="none"
              name="assetName"
              label="Asset Name"
              disabled
              style={{
                marginBottom: 10,
                width: wp("95%"),
                padding: 5,
                paddingBottom: 0,
                fontSize: wp("4%"),
                backgroundColor: "#ffffff",
                fontFamily: "Poppins_400Regular",
              }}
              onChangeText={(value) => setSubject(value)}
              value={assetName}
            />

            <TextInput
              autoCapitalize="none"
              multiline={true}
              name="Description"
              label="Description"
              numberOfLines={4}
              style={{
                marginBottom: 10,
                backgroundColor: "#ffffff",
                height: hp("10%"),
                width: wp("95%"),
                padding: 5,
                fontSize: wp("4%"),
                fontFamily: "Poppins_400Regular",
              }}
              onChangeText={(value) => setDescription(value)}
              value={description}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => setOpenScanner(true)}
                style={{
                  width: wp("30%"),
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 40,
                  marginLeft: 10,
                }}
              >
                <Text
                  style={{
                    color: colors.lighta,
                    fontWeight: "bold",
                    textAlign: "center",
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  Scan Asset QR Code
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={__startCamera}
                style={{
                  width: wp("30%"),
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 40,
                  marginLeft: 5,
                }}
              >
                <Text
                  style={{
                    color: colors.lighta,
                    fontWeight: "bold",
                    textAlign: "center",
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  Take A Picture
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (photos.length) {
                    setOpen(true);
                  } else {
                    Toast.show({
                      position: "bottom",
                      text1: "No Photos to display.",
                    });
                  }
                }}
                style={{
                  width: wp("30%"),
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 40,
                  marginLeft: 5,
                }}
              >
                <Text
                  style={{
                    color: colors.lighta,
                    fontWeight: "bold",
                    textAlign: "center",
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  View Photos
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {description ? (
          photos.length !== 0 ? (
            <Button
              mode="outline"
              style={{
                width: wp("50%"),
                marginBottom: 10,
                padding: 10,
                backgroundColor: colors.primary,
              }}
              onPress={onSubmit}
            >
              <Text
                style={{
                  color: colors.lighta,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                SUBMIT
              </Text>
            </Button>
          ) : null
        ) : null}

        <StatusBar style="auto" />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

const CameraPreview = ({ photo, retakePicture, savePhoto }) => {
  return (
    <View
      style={{
        backgroundColor: "transparent",
        flex: 1,
        width: wp("100%"),
        height: hp("100%"),
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
                  fontFamily: "Poppins_400Regular",
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
                  fontFamily: "Poppins_400Regular",
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
