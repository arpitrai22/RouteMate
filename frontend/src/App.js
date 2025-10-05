import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home"; // you will create this later

function App() {
  // check if user is logged in (by token in localStorage)
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Auth Page */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected Home Page */}
        <Route
          path="/home"
          element={token ? <Home /> : <Navigate to="/auth" />}
        />

        {/* Default route → redirect to auth */}
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;
