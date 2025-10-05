import React, { useState, useEffect } from "react";
import { getSocket } from "../services/socket";

const SearchForm = ({ user }) => {
  const [form, setForm] = useState({
    source: "",
    destination: "",
  });
  const [status, setStatus] = useState("");
  const [match, setMatch] = useState(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("searching", () => setStatus("🔎 Searching for a match..."));
    socket.on("no_match", () => setStatus("❌ No match found. Try again."));
    socket.on("match_found", (data) => {
      setStatus("✅ Match found!");
      setMatch(data.with);
    });

    return () => {
      socket.off("searching");
      socket.off("no_match");
      socket.off("match_found");
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("");
    setMatch(null);

    const [sLat, sLng] = form.source.split(",").map((x) => parseFloat(x.trim()));
    const [dLat, dLng] = form.destination.split(",").map((x) => parseFloat(x.trim()));

    const tripData = {
      id: user.id,
      source: { lat: sLat, lng: sLng },
      dest: { lat: dLat, lng: dLng },
    };

    const socket = getSocket();
    socket.emit("start_search", tripData);

    setStatus("⏳ Searching for 60 seconds...");
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Find a Ride Match</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="source"
          placeholder="Source (lat,lng)"
          value={form.source}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="text"
          name="destination"
          placeholder="Destination (lat,lng)"
          value={form.destination}
          onChange={handleChange}
          required
        />
        <br />
        <button type="submit">Find Match</button>
      </form>

      <p>{status}</p>
      {match && <p>🎉 Matched with user: {match}</p>}
    </div>
  );
};

export default SearchForm;
