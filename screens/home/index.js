import React, { FC, useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View, Image } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { setLoading, setUser } from "../../redux/public/actions";
import { theme } from "../../theme";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { checkUserType } from "../../utils";
import { db } from "../../firebase/config";
import { BG } from "../../assets";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { AppLoading } from "expo";

export default function HomeScreen() {
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
  });

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.public);
  const isFocus = useIsFocused();
  const [condoInfo, setCondoInfo] = useState();

  const checkUser = async () => {
    dispatch(setLoading(true));
    try {
      const user = await AsyncStorage.getItem("@user");
      const _user = JSON.parse(user);
      if (!_user) {
        dispatch(setLoading(false));
        navigation.navigate("Auth");
        return;
      }
      dispatch(setUser(_user));
      dispatch(setLoading(false));
    } catch (e) {
      dispatch(setUser(null));
      navigation.navigate("Auth");
      console.log(e);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Get Condo Information
  const getCondoInfo = () => {
    if (!user) {
      return;
    }

    const condoRef = db.collection("condos").doc(user.invitedBy);

    const unsubscribed = condoRef.onSnapshot((doc) => {
      setCondoInfo(doc.data());
    });
    return unsubscribed;
  };

  useEffect(() => {
    getCondoInfo();
  }, [isFocus]);

  if (!fontsLoaded) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        <Image
          style={{
            opacity: 0.8,
            height: hp("100%"),
            width: wp("100%"),
            ...StyleSheet.absoluteFillObject,
            resizeMode: "cover",
          }}
          blurRadius={3}
          source={BG}
        />
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 30,
            height: hp("50%"),
          }}
        >
          <Text
            style={{
              marginBottom: 10,
              fontSize: wp("6%"),
              fontWeight: "bold",
              textAlign: "center",
              fontFamily: "Poppins_700Bold",
            }}
          >
            {" "}
            Welcome To {condoInfo?.name}, {user?.greetName}
          </Text>
          <Text
            style={{
              marginBottom: 10,
              fontSize: wp("5%"),

              textAlign: "center",
            }}
          >
            You are logged in as: {checkUserType(user?.userType)}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
  },
  name: {
    fontSize: 20,
    color: theme.colors.primary,
  },
});
