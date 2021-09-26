import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";

// * stack instance
const HomeStack = createStackNavigator();

import HomeScreen from "../../../screens/home";

export default () => {
  const navigation = useNavigation();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: false,
        gestureEnabled: false,
        headerStyle: { elevation: 2 },
        cardStyle: { backgroundColor: "#e4fbff" },
      }}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
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
    </HomeStack.Navigator>
  );
};
