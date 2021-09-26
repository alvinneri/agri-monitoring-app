import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import * as React from "react";

import AuthStack from "./stack/auth/login";
import DrawerNav from "./drawers";

const Stack = createStackNavigator();

export default function RootNavigator({ navigation }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, gestureEnabled: false }}
      >
        <Stack.Screen name="Home" component={DrawerNav} />
        <Stack.Screen name="Auth" component={AuthStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
