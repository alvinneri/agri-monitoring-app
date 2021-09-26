import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";

// * stack instance
const AssignedRoutesStack = createStackNavigator();

import AssignedRoutes from "../../../screens/assignedRoutes";

export default () => {
  const navigation = useNavigation();
  console.log(navigation);
  return (
    <AssignedRoutesStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: false,
        gestureEnabled: false,
        headerStyle: { elevation: 2 },
      }}
    >
      <AssignedRoutesStack.Screen
        name="AssignedRoutes"
        component={AssignedRoutes}
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
    </AssignedRoutesStack.Navigator>
  );
};
