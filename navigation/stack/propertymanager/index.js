import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";
import ReportsScreen from "../../../screens/propertymanager/reports";
import ReportsDetailsScreen from "../../../screens/propertymanager/reports/TicketDetails";
// * stack instance
const PropertyManagerStack = createStackNavigator();

export default () => {
  const navigation = useNavigation();
  console.log(navigation);
  return (
    <PropertyManagerStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: false,
        gestureEnabled: false,
        headerStyle: { elevation: 2 },
        cardStyle: { backgroundColor: "#e4fbff" },
      }}
    >
      <PropertyManagerStack.Screen
        name="Reports"
        component={ReportsScreen}
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
      <PropertyManagerStack.Screen
        name="ReportsDetails"
        component={ReportsDetailsScreen}
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
    </PropertyManagerStack.Navigator>
  );
};
