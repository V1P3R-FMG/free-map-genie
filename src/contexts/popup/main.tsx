import "@/common/messaging/contexts/popup";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { store } from "./store";
import { Provider } from "react-redux";

import "./style.css";

if (import.meta.env.FIREFOX) {
  // fix firefox: https://github.com/clauderic/dnd-kit/issues/1043
  const _addEventListener = window.addEventListener;
  window.addEventListener = (...args: Parameters<typeof _addEventListener>) => {
    const [event, f] = args;
    if (event === "resize") {
      if (typeof f === "function" && f.name === "bound handleCancel") {
        return;
      }
    }
    _addEventListener.apply(window, args);
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
