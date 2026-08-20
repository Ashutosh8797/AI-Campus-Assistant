import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./Dashboard";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AIAssistant from "./pages/AIAssistant";
import KnowledgeHub from "./pages/KnowledgeHub";
import Maintenance from "./pages/Maintenance";
import Safety from "./pages/Safety";
import LostFound from "./pages/LostFound";

import ProtectedRoute from "./components/layout/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* =========================
          PUBLIC AUTH ROUTES
      ========================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/verify-otp"
        element={<VerifyOtp />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* =========================
          AI CAMPUS ASSISTANT
      ========================== */}

      <Route
        path="/ai-assistant"
        element={
          <ProtectedRoute>
            <AIAssistant />
          </ProtectedRoute>
        }
      />

      {/* =========================
          KNOWLEDGE HUB
      ========================== */}

      <Route
        path="/knowledge"
        element={
          <ProtectedRoute>
            <KnowledgeHub />
          </ProtectedRoute>
        }
      />

      {/* =========================
          CAMPUS MAINTENANCE
      ========================== */}

      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <Maintenance />
          </ProtectedRoute>
        }
      />

      {/* =========================
          SAFETY & SECURITY
      ========================== */}

      <Route
        path="/safety"
        element={
          <ProtectedRoute>
            <Safety />
          </ProtectedRoute>
        }
      />

      {/* =========================
          LOST & FOUND
      ========================== */}

      <Route
        path="/lost-found"
        element={
          <ProtectedRoute>
            <LostFound />
          </ProtectedRoute>
        }
      />

      {/* =========================
          PROTECTED DASHBOARD
      ========================== */}

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* =========================
          FALLBACK
      ========================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;