import React, { useEffect, useState } from "react";
import {
  Button,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Modal,
  Alert,
  SafeAreaView,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import BarcodeMask from "react-native-barcode-mask";
import { useSelector, useDispatch } from "react-redux";
import { setLoading, setScannedAsset } from "../../redux/public/actions";
const finderWidth = 280;
const finderHeight = 230;
const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
const viewMinX = (width - finderWidth) / 2;
const viewMinY = (height - finderHeight) / 2;

export const Scanner = ({ openScanner, setOpenScanner }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(BarCodeScanner.Constants.Type.back);
  const [scanned, setScanned] = useState(false);
  const { user } = useSelector((state) => state.public);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const saveData = (data) => {
    let id = data.split("_")[0];
    let assetName = data.split("_")[1];
    let assetCode = data.split("_")[2];
    let areaCode = data.split("_")[3];
    let areaName = data.split("_")[3];

    dispatch(
      setScannedAsset({
        id,
        assetName,
        assetCode,
        areaCode,
        areaName,
      })
    );
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
        Alert.alert(
          "Scanned Asset",
          `Asset Name ${data.split("_")[1]}. Asset Code ${data.split("_")[2]}`,
          [
            {
              text: "Cancel",
              onPress: () => dispatch(setScannedAsset(null)),
              style: "cancel",
            },
            { text: "OK", onPress: () => setOpenScanner(false) },
          ]
        );
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
    <SafeAreaView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={openScanner}
        onRequestClose={() => {
          setOpenScanner(!openScanner);
        }}
      >
        <View style={{ flex: 1, paddingTop: 20 }}>
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            type={type}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
            style={[StyleSheet.absoluteFillObject, styles.container]}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                flexDirection: "row",
                margin: 30,
              }}
            >
              <BarcodeMask edgeColor="#62B1F6" showAnimatedLine />
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: "center",
                }}
                onPress={() => {
                  setScanned(false);
                }}
              >
                <Text style={{ fontSize: 18, margin: 5, color: "white" }}>
                  SCAN AGAIN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: "flex-start",
                }}
                onPress={() => {
                  setOpenScanner(false);
                }}
              >
                <Text style={{ fontSize: 18, margin: 5, color: "white" }}>
                  BACK
                </Text>
              </TouchableOpacity>
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
      </Modal>
    </SafeAreaView>
  );
};

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
