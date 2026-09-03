import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { PriceFeedProvider } from "./context/PriceFeedContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import { AlertProvider } from "./context/AlertContext";
import { AutoSellProvider } from "./context/AutoSellContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <PriceFeedProvider>
            <PortfolioProvider>
              <AlertProvider>
                <AutoSellProvider>
                  <App />
                </AutoSellProvider>
              </AlertProvider>
            </PortfolioProvider>
          </PriceFeedProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
