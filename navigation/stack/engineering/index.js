import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";
import ReportsScreen from "../../../screens/engineering/reports";
import ReportsDetailsScreen from "../../../screens/engineering/reports/TicketDetails";
// * stack instance
const EngineerStack = createStackNavigator();

export default () => {
  const navigation = useNavigation();
  console.log(navigation);
  return (
    <EngineerStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: false,
        gestureEnabled: false,
        headerStyle: { elevation: 2 },
        cardStyle: { backgroundColor: "#e4fbff" },
      }}
    >
      <EngineerStack.Screen
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
      <EngineerStack.Screen
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
    </EngineerStack.Navigator>
  );
};
