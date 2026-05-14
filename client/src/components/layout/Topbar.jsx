import { Menu, Search, UserCircle2, LogOut } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import NotificationBell from "../common/NotificationBell";

function Topbar({ title, setIsOpen, user, onLogout }) {
 

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button className="md:hidden" onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </button>

        <div>
          <h2 className="text-3xl font-bold text-[#1D2433]">{title}</h2>
          <p className="text-sm text-[#677184]">
            Live queue monitoring, branch operations, and customer flow
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="hidden lg:flex items-center gap-3 bg-[#F3F4F7] rounded-2xl px-4 py-3 w-[340px]">
        <Search size={18} className="text-[#677184]" />
        <input
          type="text"
          placeholder="Search token, branch, counter..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* 🔔 Notifications */}
       <NotificationBell />

        {/* 👤 User Card */}
        <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-3 py-2 bg-white">
          
          {/* Avatar */}
         <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#5777B2] to-[#6C7790] text-white flex items-center justify-center overflow-hidden">
  {user?.profile_photo_url ? (
    <img
      src={user.profile_photo_url}
      alt="Profile"
      className="w-full h-full object-cover"
    />
  ) : (
    <UserCircle2 size={22} />
  )}
</div>

          {/* User Info */}
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[#1D2433]">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-[#677184]">
              {user?.phone_no || "No phone"}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="ml-2 p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>

      </div>
    </header>
  );
}

export default Topbar;