import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";

// * stack instance
const ScannerStack = createStackNavigator();

import FloorScannerScreen from "../../../screens/scanner";

export default () => {
  const navigation = useNavigation();
  console.log(navigation);
  return (
    <ScannerStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: false,
        gestureEnabled: false,
        headerStyle: { elevation: 2 },
        cardStyle: { backgroundColor: "#e4fbff" },
      }}
    >
      <ScannerStack.Screen
        name="Scanner"
        component={FloorScannerScreen}
        options={{
          title: null,

          headerLeft: () => (
            <Icon
              name="menu"
              size={25}
              style={{ paddingLeft: 20 }}
              onPress={() => navigation.openDrawer()}
            ></Icon>
          ),
        }}
      />
    </ScannerStack.Navigator>
  );
};
