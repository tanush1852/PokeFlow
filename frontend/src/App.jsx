import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/custom/Header";
import { Toaster } from "sonner";
import DragDropInterface from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import SavedTemplates from "./pages/SavedTemplates";
function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DragDropInterface />} />
        <Route path="/savedTemplates" element={<SavedTemplates />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
