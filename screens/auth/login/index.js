import React, { FC, useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../../../firebase/config";
import { TextInput, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm } from "react-hook-form";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { setLoading, setUser } from "../../../redux/public/actions";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { theme } from "../../../theme";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function LoginScreen() {
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
  });
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { register, setValue, handleSubmit, errors, reset } = useForm();

  useEffect(() => {
    register({ name: "email" }, { required: true });
    register({ name: "password" }, { required: true });
  }, []);

  const setUserLogin = async (values) => {
    try {
      const jsonValue = JSON.stringify(values);
      await AsyncStorage.setItem("@user", jsonValue);
      dispatch(setUser(values));
      dispatch(setLoading(false));
      Toast.show({
        position: "bottom",
        text1: "Successfully login",
      });
      navigation.navigate("Home");
    } catch (err) {
      dispatch(setLoading(false));
      console.log(err);
    }
  };

  const login = async (values, e) => {
    dispatch(setLoading(true));

    try {
      const response = await auth.signInWithEmailAndPassword(
        values.email,
        values.password
      );

      if (response && response.user) {
        try {
          const user = await db
            .collection("users")
            .doc(response.user.uid)
            .get();

          if (user.data().userType === "EMPLOYEE") {
            await setUserLogin(user.data());
          } else {
            dispatch(setLoading(false));
            Toast.show({
              type: "error",
              position: "bottom",
              text1: "Login as Employee",
            });
          }
        } catch (err) {
          dispatch(setLoading(false));
          console.log(err);
        }
      }
    } catch (err) {
      dispatch(setLoading(false));
      Toast.show({
        type: "error",
        position: "bottom",
        text1: err.message,
      });
    }
  };

  if (!fontsLoaded) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <FontAwesomeIcon5
            name="home"
            size={wp("15%")}
            style={{ color: theme.colors.lighta, marginRight: 20 }}
          ></FontAwesomeIcon5>
          <FontAwesomeIcon
            name="building-o"
            size={wp("20%")}
            style={{ color: theme.colors.lighta }}
          />
        </View>
        <Text
          style={{
            fontSize: 30,
            marginVertical: 20,
            color: theme.colors.light,
            fontFamily: "Poppins_700Bold",
          }}
        >
          Welcome to 360 PMS
        </Text>
        <TextInput
          name="email"
          autoCapitalize="none"
          style={{
            width: 300,
            marginBottom: 10,
            backgroundColor: theme.colors.lighta,
          }}
          label="Email Address"
          onChangeText={(text) => setValue("email", text, true)}
        />
        <TextInput
          name="password"
          secureTextEntry={true}
          autoCapitalize="none"
          style={{
            width: 300,
            marginBottom: 10,
            backgroundColor: theme.colors.lighta,
          }}
          label="Password"
          onChangeText={(text) => setValue("password", text, true)}
        />
        <TouchableOpacity
          style={{ marginRight: 50, marginVertical: 10, alignSelf: "flex-end" }}
          onPress={() => {
            navigation.navigate("ForgotPassword");
          }}
        >
          <Text
            style={{
              color: theme.colors.light,
              fontFamily: "Poppins_400Regular",
            }}
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>
        <Button
          mode="contained"
          style={{
            width: 300,
            marginBottom: 10,
            padding: 10,
            backgroundColor: theme.colors.lighta,
            fontFamily: "Poppins_400Regular",
          }}
          onPress={handleSubmit(login)}
        >
          <Text style={{ color: theme.colors.primary }}> LOGIN</Text>
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
