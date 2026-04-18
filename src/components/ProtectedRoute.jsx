import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, roleRequired }) {
  const role = localStorage.getItem("role");

  // Not logged in
  if (!role) {
    return <Navigate to="/" />;
  }

  // Role check
  if (roleRequired && role !== roleRequired) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;