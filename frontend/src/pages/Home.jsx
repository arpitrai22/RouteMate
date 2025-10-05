import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket, initSocket, disconnectSocket } from "../services/socket";
import SearchForm from "../components/SearchForm";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const token = sessionStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/auth");
      return;
    }

    setUser(storedUser);
    initSocket(token, storedUser.id);

    return () => {
      disconnectSocket();
    };
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    disconnectSocket();
    navigate("/auth");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome, {user?.name} 👋</h1>
      <p><strong>Email:</strong> {user?.email}</p>
      <button onClick={handleLogout}>Logout</button>

      {user && <SearchForm user={user} />}
    </div>
  );
};

export default Home;
