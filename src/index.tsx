/* @refresh reload */
import { render } from "solid-js/web";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App.tsx";

const root = document.getElementById("root");

render(() => <App />, root!);

registerSW({
  immediate: import.meta.env.PROD,
  onRegistered(r) {
    if (import.meta.env.DEV) {
      console.info("Service worker registered in development", r);
    }
  },
  onRegisterError(error) {
    console.error("Service worker registration failed", error);
  },
});
