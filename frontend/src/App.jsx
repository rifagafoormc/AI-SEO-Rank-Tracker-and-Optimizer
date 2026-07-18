import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import Rankings from "./pages/Rankings";
import History from "./pages/History";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/rankings" element={<Rankings />} />
      <Route path="/history" element={<History />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;