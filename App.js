import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as StateProvider, useSelector } from "react-redux";
import store from "./redux/store";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import Navigation from "./navigation";
import { registerRootComponent } from "expo";
import Toast from "react-native-toast-message";
import Loader from "./components/loader";
import { theme } from "./theme";

export default function App() {
  return (
    <StateProvider store={store}>
      <View style={{ flex: 1 }}>
        <SafeAreaProvider>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior="padding"
            enabled={Platform.OS === "ios" ? true : false}
          >
            <PaperProvider theme={theme}>
              <Loader />
              <Navigation />
              <Toast ref={(ref) => Toast.setRef(ref)} />
              <StatusBar />
            </PaperProvider>
          </KeyboardAvoidingView>
        </SafeAreaProvider>
      </View>
    </StateProvider>
  );
}

registerRootComponent(App);
