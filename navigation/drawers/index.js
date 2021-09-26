import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Entypo";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcon_ from "react-native-vector-icons/MaterialIcons";
import IconA from "react-native-vector-icons/AntDesign";
import Toast from "react-native-toast-message";
import FAIcon from "react-native-vector-icons/FontAwesome5";

import HomeStack from "../stack/home";
import ScannerStack from "../stack/scanner";
import HistoryStack from "../stack/history";
import MaintenanceStack from "../stack/maintenance";
import PropertyManagerStack from "../stack/propertymanager";
import EngineeringStack from "../stack/engineering";
import ProfileStack from "../stack/profile";

import { setLoading, setUser } from "../../redux/public/actions";
import { useSelector, useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AssignedRoutesStack from "../stack/assignedRoutes";

const DrawerNav = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const logout = async () => {
    dispatch(setLoading(true));
    try {
      await AsyncStorage.removeItem("@user");
      dispatch(setUser(null));
      dispatch(setLoading(false));
      Toast.show({
        position: "bottom",
        text1: "Successfully logout.",
      });
      navigation.navigate("Auth");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Log Out"
        onPress={logout}
        icon={({ focused, color, size = 25 }) => (
          <MaterialIcon name="logout" size={25} style={{ paddingLeft: 20 }} />
        )}
      />
    </DrawerContentScrollView>
  );
};

export default ({ navigation }) => {
  const { user } = useSelector((state) => state.public);
  console.log(user);

  return (
    <DrawerNav.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <DrawerNav.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: "Home",
          drawerIcon: ({ focused, size }) => (
            <Icon name="home" size={25} style={{ paddingLeft: 20 }}></Icon>
          ),
        }}
      />
      {user?.accessModules.includes("SECURITY") && (
        <DrawerNav.Screen
          name="Scanner"
          component={ScannerStack}
          options={{
            title: "Scanner",
            drawerIcon: ({ focused, size }) => (
              <MaterialIcon
                name="magnify-scan"
                size={25}
                style={{ paddingLeft: 20 }}
              ></MaterialIcon>
            ),
          }}
        />
      )}
      {user?.accessModules.includes("SECURITY") && (
        <DrawerNav.Screen
          name="Routes"
          component={AssignedRoutesStack}
          options={{
            title: "Routes",
            drawerIcon: ({ focused, size }) => (
              <FAIcon
                name="route"
                size={25}
                style={{ paddingLeft: 20 }}
              ></FAIcon>
            ),
          }}
        />
      )}

      {user?.accessModules.includes("SECURITY") && (
        <DrawerNav.Screen
          name="History"
          component={HistoryStack}
          options={{
            title: "History",
            drawerIcon: ({ focused, size }) => (
              <MaterialIcon
                name="history"
                size={25}
                style={{ paddingLeft: 20 }}
              ></MaterialIcon>
            ),
          }}
        />
      )}
      {user?.accessModules.includes("MAINTENANCE") && (
        <DrawerNav.Screen
          name="Maintenance"
          component={MaintenanceStack}
          options={{
            title: "Maintenance",
            drawerIcon: ({ focused, size }) => (
              <MaterialIcon
                name="tools"
                size={25}
                style={{ paddingLeft: 20 }}
              ></MaterialIcon>
            ),
          }}
        />
      )}
      {user?.accessModules.includes("PROPERTY_MANAGER") && (
        <DrawerNav.Screen
          name="Reports"
          component={PropertyManagerStack}
          options={{
            title: "Reports",
            drawerIcon: ({ focused, size }) => (
              <IconA
                name="database"
                size={25}
                style={{ paddingLeft: 20 }}
              ></IconA>
            ),
          }}
        />
      )}
      {user?.accessModules.includes("ENGINEERING") && (
        <DrawerNav.Screen
          name="Reports"
          component={EngineeringStack}
          options={{
            title: "Reports",
            drawerIcon: ({ focused, size }) => (
              <IconA
                name="database"
                size={25}
                style={{ paddingLeft: 20 }}
              ></IconA>
            ),
          }}
        />
      )}
      {user?.accessModules.includes("ENGINEERING") ||
        (user?.accessModules.includes("ENGINEERING_HEAD") && (
          <DrawerNav.Screen
            name="Reports"
            component={EngineeringStack}
            options={{
              title: "Reports",
              drawerIcon: ({ focused, size }) => (
                <MaterialIcon
                  name="tools"
                  size={25}
                  style={{ paddingLeft: 20 }}
                ></MaterialIcon>
              ),
            }}
          />
        ))}
      <DrawerNav.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: "Profile",
          drawerIcon: ({ focused, size }) => (
            <MaterialIcon_
              name="person"
              size={25}
              style={{ paddingLeft: 20 }}
            ></MaterialIcon_>
          ),
        }}
      />
    </DrawerNav.Navigator>
  );
};
