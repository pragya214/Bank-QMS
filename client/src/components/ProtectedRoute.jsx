import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("qms_token");
  const user = JSON.parse(localStorage.getItem("qms_user") || "null");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    if (user?.role === "display") {
      return <Navigate to="/display-board" replace />;
    }

    if (user?.role === "staff") {
      return <Navigate to="/staff-panel" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;