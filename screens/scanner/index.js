import React, { useEffect, useState } from "react";
import {
  Button,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { BarCodeScanner, BarCodeScannerResult } from "expo-barcode-scanner";
import BarcodeMask from "react-native-barcode-mask";
import { useSelector, useDispatch } from "react-redux";
import { db, auth } from "../../firebase/config";
import Toast from "react-native-toast-message";
import { setLoading } from "../../redux/public/actions";
import { useIsFocused } from "@react-navigation/core";
import moment from "moment";
const finderWidth = 280;
const finderHeight = 230;
const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
const viewMinX = (width - finderWidth) / 2;
const viewMinY = (height - finderHeight) / 2;

export default function BarCodeScanScreen() {
  const isFocused = useIsFocused();
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(BarCodeScanner.Constants.Type.back);
  const [scanned, setScanned] = useState(false);
  const { user } = useSelector((state) => state.public);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const getAssignedRoute = async () => {
    const routeRef = await db
      .collection("route_templates")
      .doc(user.assignedRoute.id);

    const unsubscribed = routeRef.onSnapshot((doc) => {
      console.log(doc.data());
      setAssignedRoute(doc.data().routes);
    });

    return unsubscribed;
  };

  useEffect(() => {
    getAssignedRoute();
  }, [isFocused]);

  const saveData = (data) => {
    let floorId = data.split("_")[0];
    let floorNumber = data.split("_")[1];
    let description = data.split("_")[2];

    dispatch(setLoading(true));

    db.collection("users")
      .doc(user.uid)
      .update({
        location: {
          floorId: floorId,
          floorNumber: floorNumber,
          description: description,
          time: new Date(),
        },
      });

    let inTime = "NOT IN ROUTE";
    let expectedTime = "";
    if (assignedRoute) {
      assignedRoute.map((item) =>
        item.area.map((area) => {
          if (area.code === floorId && area.description === description) {
            const time = moment(new Date()).format("h:mm A");
            if (item.time.split(":")[0] === time.split(":")[0]) {
              inTime = true;
              expectedTime = item.time;
            } else {
              inTime = false;
              expectedTime = item.time;
            }
          }
        })
      );
    }

    dispatch(setLoading(false));

    const securityRef = db.collection("security").doc(user.uid);
    securityRef
      .get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          securityRef.onSnapshot((doc) => {
            securityRef.collection("history").add({
              expectedTime: expectedTime,
              inTime: inTime,
              floorId: floorId,
              floorNumber: floorNumber,
              description: description,
              time: new Date(),
            });
          });
        } else {
          securityRef.set({
            firstName: user.firstName,
            lastName: user.lastName,
            uid: user.uid,
            condoId: user.invitedBy.trim(),
            inTime: inTime,
            expectedTime: expectedTime,
          });
          securityRef.collection("history").add({
            floorId: floorId,
            floorNumber: floorNumber,
            description: description,
            time: new Date(),
            inTime: inTime,
            expectedTime: expectedTime,
          });
        }
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleBarCodeScanned = (scanningResult) => {
    if (!scanned) {
      const { type, data, bounds: { origin } = {} } = scanningResult;

      const { x, y } = origin;

      if (
        x >= viewMinX &&
        y >= viewMinY &&
        x <= viewMinX + finderWidth / 2 &&
        y <= viewMinY + finderHeight / 2
      ) {
        setScanned(true);
        saveData(data);
        alert(
          `Successfully scanned qr. You are in floor number ${
            data.split("_")[1]
          } ${data.split("_")[2]}`
        );
        // a.show({
        //   position: "center",
        //   type: "info",
        //   text1: "Successfully scanned qr",
        // });
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        type={type}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        style={[StyleSheet.absoluteFillObject, styles.container]}
      >
        {scanned && (
          <Button
            title="Scan Again"
            onPress={() => setScanned(false)}
            style={{ marginVertical: 50, color: "white" }}
          />
        )}
        <View
          style={{
            flex: 1,
            backgroundColor: "transparent",
            flexDirection: "row",
          }}
        >
          <BarcodeMask edgeColor="#62B1F6" showAnimatedLine />

          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: "flex-end",
            }}
            onPress={() => {
              setType(
                type === BarCodeScanner.Constants.Type.back
                  ? BarCodeScanner.Constants.Type.front
                  : BarCodeScanner.Constants.Type.back
              );
            }}
          >
            <Text style={{ fontSize: 18, margin: 5, color: "white" }}>
              {" "}
              Flip{" "}
            </Text>
          </TouchableOpacity>
        </View>
      </BarCodeScanner>
    </View>
  );
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
