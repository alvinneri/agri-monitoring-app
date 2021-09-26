import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Camera } from "expo-camera";
import firebase from "../../firebase/config";
import { db, storage } from "../../firebase/config";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useTheme, Divider } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as ImagePicker from "expo-image-picker";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { theme } from "../../theme";

export default function AssignedRoutes() {
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
  });
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const { user } = useSelector((state) => state.public);
  const [assignedRoute, setAssignedRoute] = useState(null);

  const getAssignedRoute = async () => {
    const routeRef = db
      .collection("route_templates")
      .doc(user.assignedRoute.id);
    const unsubscribed = await routeRef.onSnapshot((doc) => {
      setAssignedRoute(doc.data());
    });
    return unsubscribed;
  };

  useEffect(() => {
    getAssignedRoute();
  }, [isFocused]);

  if (!fontsLoaded) {
    return null;
  }
  {
    return (
      <View style={styles.container}>
        <Text style={[styles.name, { fontFamily: "Poppins_700Bold" }]}>
          Assigned Routes
        </Text>
        <Divider style={{ height: hp("0.2%") }} />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            {assignedRoute?.routes.map((route, index) => {
              return (
                <View style={styles.card}>
                  <Text style={styles.text}>{route.time}</Text>
                  <Text style={styles.text}>Area:</Text>
                  {route.area.length ? (
                    route.area.map((item) => {
                      return (
                        <Text style={styles.text}>
                          {item.description}-{item.floorNumber}
                        </Text>
                      );
                    })
                  ) : (
                    <Text style={styles.text}>None</Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }
}
const width = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
  scrollContainer: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  name: {
    fontSize: 20,
    padding: 20,
    color: theme.colors.primary,
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
  text: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#fff",
  },
});
