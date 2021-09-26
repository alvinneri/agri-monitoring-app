import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";

// * stack instance
const MaintenanceStack = createStackNavigator();

import MaintenanceTab from "../../tabs/maintenance";

export default () => {
  const navigation = useNavigation();
  console.log(navigation);
  return (
    <MaintenanceStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: false,
        gestureEnabled: false,
        headerStyle: { elevation: 2 },
        cardStyle: { backgroundColor: "#e4fbff" },
      }}
    >
      <MaintenanceStack.Screen
        name="Maintenance"
        component={MaintenanceTab}
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
    </MaintenanceStack.Navigator>
  );
};
