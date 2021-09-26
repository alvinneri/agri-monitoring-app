import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../../../../screens/auth/login";
import ForgotPassword from "../../../../screens/auth/forgotpassword";
// * stack instance
const AuthStack = createStackNavigator();

export default ({ navigation }) => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        headerTransparent: true,
        gestureEnabled: false,
        headerStyle: { elevation: 2 },
        cardStyle: { backgroundColor: "#e4fbff" },
      }}
    >
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
    </AuthStack.Navigator>
  );
};
