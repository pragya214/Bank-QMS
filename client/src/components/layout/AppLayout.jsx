import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const titleMap = {
  "/": "Dashboard",
  "/join-queue": "Join Queue",
  "/queue-status": "Queue Status",
  "/staff-panel": "Staff Panel",
  "/display-board": "Display Board",
  "/admin-panel/overview": "Admin Overview",
  "/admin-panel/branches": "Branches",
  "/admin-panel/services": "Services",
  "/admin-panel/counters": "Counters",
  "/admin-panel/audit-logs": "Audit Logs",
  "/settings": "Settings",
  "/profile": "Profile",
};

function AppLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("qms_user") || "null");
  const title = titleMap[location.pathname] || "Bank QMS";

  const handleLogout = () => {
    localStorage.removeItem("qms_token");
    localStorage.removeItem("qms_user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F3F4F7]">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="md:ml-72">
        <Topbar
          title={title}
          setIsOpen={setIsOpen}
          user={user}
          onLogout={handleLogout}
        />

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;