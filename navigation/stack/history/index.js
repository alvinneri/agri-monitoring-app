import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";

// * stack instance
const HistoryStack = createStackNavigator();

import HistoryScreen from "../../../screens/history";

export default () => {
  const navigation = useNavigation();
  console.log(navigation);
  return (
    <HistoryStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: false,
        gestureEnabled: false,
        headerStyle: { elevation: 2 },
      }}
    >
      <HistoryStack.Screen
        name="History"
        component={HistoryScreen}
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
    </HistoryStack.Navigator>
  );
};
