import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Camera } from "expo-camera";
import firebase from "../../firebase/config";
import { db, storage } from "../../firebase/config";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setScannedAsset } from "../../redux/public/actions";
import { useTheme, TextInput, Button, Avatar } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function ProfileScreen() {
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
  });
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const { user } = useSelector((state) => state.public);
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [photo, setPhoto] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);

      fetch(result.uri)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "File name", { type: "image/png" });
          const uploadTask = storage
            .ref()
            .child(`/profile-photo/${user.uid}/profilephoto`)
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

              db.collection("users")
                .doc(user.uid)
                .update({
                  photo: downloadURL,
                })
                .then((docRef) => {
                  Toast.show({
                    position: "bottom",
                    text1: "Profile Photo successfully updated. ",
                  });
                  dispatch(setLoading(false));
                });
            }
          );
        });
    }
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setMobileNumber(user.mobileNumber);
      setPhoto(user.photo);
      setEmail(user.email);
    }
  }, [isFocused, user]);

  const updateProfile = async (values) => {
    console.log(values);
    dispatch(setLoading(true));

    try {
      db.collection("users").doc(user.uid).update({
        firstName,
        lastName,
        mobileNumber,
      });
      dispatch(setLoading(false));
      Toast.show({
        position: "bottom",
        text1: "Profile Photo successfully updated. ",
      });
    } catch (e) {
      dispatch(setLoading(false));
      console.log(e);
    }
  };

  if (!fontsLoaded) {
    return null;
  }
  {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={pickImage}>
            <Avatar.Image
              size={wp("50%")}
              source={{ uri: image ? image : photo }}
            />
          </TouchableOpacity>
          <TextInput
            autoCapitalize="none"
            name="email"
            label="Email"
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
            onChangeText={(value) => setEmail(value)}
            value={email}
          />
          <TextInput
            autoCapitalize="none"
            name="firstName"
            label="First Name"
            style={{
              marginBottom: 10,
              width: wp("95%"),
              padding: 5,
              paddingBottom: 0,
              fontSize: wp("4%"),
              backgroundColor: "#ffffff",
              fontFamily: "Poppins_400Regular",
            }}
            onChangeText={(value) => setFirstName(value)}
            value={firstName}
          />

          <TextInput
            autoCapitalize="none"
            name="lastName"
            label="Last Name"
            style={{
              marginBottom: 10,
              backgroundColor: "#ffffff",

              width: wp("95%"),
              padding: 5,
              paddingBottom: 0,
              fontSize: wp("4%"),
              fontFamily: "Poppins_400Regular",
            }}
            onChangeText={(value) => setLastName(value)}
            value={lastName}
          />
          <TextInput
            autoCapitalize="none"
            name="mobileNumber"
            label="Mobile Number"
            style={{
              marginBottom: 10,
              backgroundColor: "#ffffff",
              fontFamily: "Poppins_400Regular",
              width: wp("95%"),
              padding: 5,
              paddingBottom: 0,
              fontSize: wp("4%"),
            }}
            onChangeText={(value) => setMobileNumber(value)}
            value={mobileNumber}
          />
          <Button
            mode="outline"
            style={{
              width: 300,
              marginBottom: 10,
              padding: 10,
              backgroundColor: colors.primary,
            }}
            onPress={updateProfile}
          >
            <Text
              style={{ color: colors.lighta, fontFamily: "Poppins_400Regular" }}
            >
              UPDATE
            </Text>
          </Button>
        </View>

        <StatusBar style="auto" />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
});
