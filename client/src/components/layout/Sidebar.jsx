import {
  LayoutDashboard,
  Ticket,
  ClipboardList,
  Users,
  Monitor,
  ShieldCheck,
  X,
  Building2,
  Layers3,
  Grid3X3,
  UserCircle2,
  ScrollText,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    name: "Display Board",
    path: "/display-board",
    icon: Monitor,
    roles: ["admin", "staff", "display"],
  },
  {
    name: "Join Queue",
    path: "/join-queue",
    icon: Ticket,
    roles: ["admin"],
  },
  {
    name: "Queue Status",
    path: "/queue-status",
    icon: ClipboardList,
    roles: ["admin", "staff"],
  },
  {
    name: "Staff Panel",
    path: "/staff-panel",
    icon: Users,
    roles: ["admin", "staff"],
  },
  {
    name: "Branches",
    path: "/admin-panel/branches",
    icon: Building2,
    roles: ["admin"],
  },
  {
    name: "Services",
    path: "/admin-panel/services",
    icon: Layers3,
    roles: ["admin"],
  },
  {
    name: "Counters",
    path: "/admin-panel/counters",
    icon: Grid3X3,
    roles: ["admin"],
  },
  {
    name: "Admin Overview",
    path: "/admin-panel/overview",
    icon: ShieldCheck,
    roles: ["admin"],
  },
  {
    name: "Audit Logs",
    path: "/admin-panel/audit-logs",
    icon: ScrollText,
    roles: ["admin"],
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
    roles: ["admin"],
  },
  {
    name: "Profile",
    path: "/profile",
    icon: UserCircle2,
    roles: ["admin", "staff", "display"],
  },
];

function Sidebar({ isOpen, setIsOpen }) {
  const user = JSON.parse(localStorage.getItem("qms_user") || "null");

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-[#11274D] text-white z-40 transform transition-transform duration-300 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold">Bank QMS</h1>
            <p className="text-white/60 text-sm mt-1">
              {user?.role ? `${user.role} Console` : "Operations Console"}
            </p>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                    isActive
                      ? "bg-[#5777B2] text-white"
                      : "hover:bg-white/10 text-white/90"
                  }`
                }
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;