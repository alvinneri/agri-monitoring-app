import React, { FC, useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../firebase/config";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { ScrollView } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { theme } from "../../theme";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function HistoryScreen() {
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
  });
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [history, setHistory] = useState([]);

  const { user } = useSelector((state) => state.public);

  const getSecurityHistory = async () => {
    const historyRef = await db
      .collection("security")
      .doc(user.uid)
      .collection("history")
      .orderBy("time", "desc");

    const unsubscribed = historyRef.onSnapshot((querySnapshot) => {
      let _history = [];
      querySnapshot.forEach((doc) => {
        _history.push(doc.data());
      });
      setHistory(_history);
    });
    return unsubscribed;
  };

  useEffect(() => {
    (async () => {
      await getSecurityHistory();
    })();
  }, []);

  if (!fontsLoaded) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        <Text style={[styles.name, { fontFamily: "Poppins_700Bold" }]}>
          History
        </Text>
        <Divider style={{ height: hp("0.2%") }} />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {history.map((item, index) => {
            return (
              <View key={index} style={styles.card}>
                <Text
                  style={[styles.text, { fontFamily: "Poppins_400Regular" }]}
                >
                  Floor Number: {item?.floorNumber}
                </Text>
                <Text
                  style={[styles.text, , { fontFamily: "Poppins_400Regular" }]}
                >
                  Floor Description: {item?.description}
                </Text>
                <Text
                  style={[styles.text, , { fontFamily: "Poppins_400Regular" }]}
                >
                  Date: {moment(item?.time.toDate()).format("MMM DD YYYY")}
                </Text>
                <Text
                  style={[styles.text, , { fontFamily: "Poppins_400Regular" }]}
                >
                  Time: {moment(item?.time.toDate()).format("h:mm A")}
                </Text>
                <Text
                  style={[styles.text, , { fontFamily: "Poppins_400Regular" }]}
                >
                  Expected Time: {item?.expectedTime}
                </Text>
                <Text
                  style={[styles.text, , { fontFamily: "Poppins_400Regular" }]}
                >
                  IN-TIME:{" "}
                  {item?.inTime === "NOT IN ROUTE"
                    ? "NOT IN ROUTE"
                    : !item?.inTime
                    ? "NO"
                    : "YES"}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  card: {
    width: wp("90%"),
    alignSelf: "center",
    textAlign: "center",
    padding: 20,
    backgroundColor: theme.colors.primary,
    marginVertical: 10,
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
  h1: {
    fontSize: 30,
    padding: 10,
  },
  text: {
    fontSize: wp("4%"),
    marginVertical: 5,
    color: theme.colors.light,
  },
});
