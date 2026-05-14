import { Link, useLocation } from "react-router-dom";
import { Ticket, Search } from "lucide-react";

function CustomerHeader() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "bg-[#5777B2] text-white shadow-md"
      : "text-slate-600 bg-slate-50 hover:bg-slate-100";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-[#5777B2] to-[#6C7790] flex items-center justify-center text-white font-bold">
              Q
            </div>

            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate">Bank Queue</p>
              <p className="text-xs text-slate-500 truncate">
                Customer Portal
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:justify-end sm:-mt-10">
          <Link
            to="/customer/join-queue"
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive(
              "/customer/join-queue"
            )}`}
          >
            <Ticket size={16} />
            Join Queue
          </Link>

          <Link
            to="/customer/token-status"
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive(
              "/customer/token-status"
            )}`}
          >
            <Search size={16} />
            Track Token
          </Link>
        </div>
      </div>
    </header>
  );
}

export default CustomerHeader;