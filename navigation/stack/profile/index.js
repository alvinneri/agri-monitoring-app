import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";

// * stack instance
const ProfileStack = createStackNavigator();
import ProfileScreen from "../../../screens/profile";

export default () => {
  const navigation = useNavigation();
  console.log(navigation);
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: false,
        gestureEnabled: false,
        headerStyle: { elevation: 2 },
      }}
    >
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
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
    </ProfileStack.Navigator>
  );
};
