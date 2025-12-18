import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // 👇 SAFELY read response
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setMsg(data.error || "Login failed");
        return;
      }

      // ✅ SUCCESS
      localStorage.setItem("admin_token", data.token);
      setMsg("✅ Login successful");

      onLogin(); // update admin state

      // ✅ REDIRECT TO NEWS PAGE
      setTimeout(() => {
        navigate("/news");
      }, 500);
    } catch (err) {
      console.error(err);
      setMsg("❌ Server not reachable");
    }
  };

  return (
    <div className="admin-login">
      <h2>Admin Login</h2>

      <form onSubmit={onSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <button type="submit">Login</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
