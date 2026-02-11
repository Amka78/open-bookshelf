// This is the entry point if you run `bun run expo:start`
// If you run `bun run ios` or `bun run android`, it'll use ./index.js instead.
import App from "./app/app.tsx";
import React from "react";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

function IgniteApp() {
  return <App hideSplashScreen={SplashScreen.hideAsync} />;
}

export default IgniteApp;
