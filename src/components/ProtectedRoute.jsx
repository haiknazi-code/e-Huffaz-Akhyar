import { Navigate } from "react-router-dom";
import { getRole } from "../lib/api";

export const ProtectedRoute = ({ children, teacherOnly = false }) => {
  const token = localStorage.getItem("ehuffaz_token");
  if (!token) return <Navigate to="/login" replace />;
  if (teacherOnly && getRole() === "guest") {
    return <Navigate to="/" replace />;
  }
  return children;
};
