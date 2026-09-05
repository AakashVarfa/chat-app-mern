import React from "react";

import Left from "./home/Leftpart/Left";
import Right from "./home/Rightpart/Right";

import Signup from "./components/Signup";
import Login from "./components/Login";

import VerifyEmail from "./pages/VerifyEmail";

import { useAuth } from "./context/AuthProvider";

import { Toaster } from "react-hot-toast";

import Logout from "./home/left1/Logout";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";


function App() {
  const [authUser] = useAuth();

  console.log("Auth User:", authUser);

  return (
    <>
      <Routes>

        {/* ================= HOME ================= */}

        <Route
          path="/"
          element={
            authUser ? (
              <div className="flex h-screen">
                <Logout />
                <Left />
                <Right />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />


        {/* ================= LOGIN ================= */}

        <Route
          path="/login"
          element={
            authUser ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          }
        />


        {/* ================= SIGNUP ================= */}

        <Route
          path="/signup"
          element={
            authUser ? (
              <Navigate to="/" replace />
            ) : (
              <Signup />
            )
          }
        />


        {/* ================= EMAIL VERIFICATION ================= */}

        <Route
          path="/verify-email"
          element={
            authUser ? (
              <Navigate to="/" replace />
            ) : (
              <VerifyEmail />
            )
          }
        />


        {/* ================= UNKNOWN ROUTE ================= */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

      {/* Toast Notifications */}

      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </>
  );
}

export default App;