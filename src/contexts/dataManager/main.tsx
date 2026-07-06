import "@/common/messaging/contexts/port";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { store } from "./store";
import { Provider } from "react-redux";
import ReduxToastr from "react-redux-toastr";

import "react-redux-toastr/lib/css/react-redux-toastr.min.css";
import "./style.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ReduxToastr
      position="top-right"
      transitionIn="fadeIn"
      transitionOut="fadeOut"
      timeOut={4000}
      newestOnTop={false}
    />
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);
