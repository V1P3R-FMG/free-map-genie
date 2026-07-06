import "@/common/messaging/contexts/popup";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { store } from "./store";
import { Provider } from "react-redux";
import ReduxToastr from "react-redux-toastr";

import "react-redux-toastr/lib/css/react-redux-toastr.min.css";
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

$(function () {
  if (window.self != window.top) {
    $(document.documentElement).attr("data-iframe", "true");
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ReduxToastr
      position="top-right"
      transitionIn="fadeIn"
      transitionOut="fadeOut"
      closeOnToastrClick={false}
      timeOut={4000}
      newestOnTop={false}
    />
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);
