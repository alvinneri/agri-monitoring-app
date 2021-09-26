import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import MaintenanceScreen from "../../../screens/maintenance/maintenance";
import ReportMaintenanceScreen from "../../../screens/maintenance/reportmaintenance";
import { useTheme } from "react-native-paper";
const MaintenanceTab = createBottomTabNavigator();

export default ({ navigation }) => {
  const { colors } = useTheme();
  return (
    <MaintenanceTab.Navigator
      detachInactiveScreens={true}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Tickets":
              iconName = "unread";
              break;
            case "Add Report":
              iconName = "text-document-inverted";
              break;
          }

          return (
            <Text style={{ color: focused ? "#ffffff" : "black" }}>
              {route.name}
            </Text>
          );
        },
      })}
      tabBarOptions={{
        showLabel: false,
        inactiveBackgroundColor: "#ffffff",
        activeBackgroundColor: colors.primary,
        activeTintColor: "#ffffff",
        inactiveTintColor: colors.primary,
      }}
    >
      <MaintenanceTab.Screen name="Tickets" component={MaintenanceScreen} />
      <MaintenanceTab.Screen
        name="Add Report"
        component={ReportMaintenanceScreen}
      />
    </MaintenanceTab.Navigator>
  );
};
