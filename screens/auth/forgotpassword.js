import React, { FC, useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../../firebase/config";
import { TextInput, Button } from "react-native-paper";
import { useForm } from "react-hook-form";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { setLoading, setUser } from "../../redux/public/actions";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function ForgotPasswordScreen() {
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
  });
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { register, setValue, handleSubmit, errors, reset } = useForm();

  useEffect(() => {
    register({ name: "email" }, { required: true });
  }, []);

  const submit = async (values) => {
    setLoading(true);
    try {
      await auth.sendPasswordResetEmail(values.email);
      Toast.show({
        type: "success",
        position: "bottom",
        text1: "Password reset link was sent to you email.",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: err.message,
      });
    } finally {
      setLoading(false);
      setValue("email", "", true);
    }
  };

  if (!fontsLoaded) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        <Text
          style={{
            fontSize: 30,
            marginVertical: 20,
            fontFamily: "Poppins_700Bold",
          }}
        >
          Password Reset
        </Text>
        <TextInput
          name="email"
          autoCapitalize="none"
          style={{
            width: 300,
            marginBottom: 10,
            fontFamily: "Poppins_700Bold",
          }}
          label="Email Address"
          onChangeText={(text) => setValue("email", text, true)}
        />
        <Button
          mode="contained"
          style={{
            width: 300,
            marginBottom: 10,
            padding: 10,
            fontFamily: "Poppins_700Bold",
          }}
          onPress={handleSubmit(submit)}
        >
          SUBMIT
        </Button>
        <TouchableOpacity
          style={{
            marginRight: 50,
            marginVertical: 10,
            alignSelf: "flex-end",
            fontFamily: "Poppins_700Bold",
          }}
          onPress={() => {
            navigation.navigate("Login");
          }}
        >
          <Text>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
