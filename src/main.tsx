import React from "react";
import ReactDOM from "react-dom/client";

import Kbd from "./Kbd";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Kbd>
      <App />
    </Kbd>
  </React.StrictMode>
);
