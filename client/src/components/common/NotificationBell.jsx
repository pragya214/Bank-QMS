import { useState } from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
  ShieldCheck,
  Trash2,
  XCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

function getIcon(type) {
  if (type === "success") return ShieldCheck;
  if (type === "error") return XCircle;
  if (type === "warning") return AlertTriangle;
  return Info;
}

function getStyles(type) {
  if (type === "success") {
    return "bg-green-50 text-green-700";
  }

  if (type === "error") {
    return "bg-red-50 text-red-700";
  }

  if (type === "warning") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-blue-50 text-blue-700";
}

function NotificationBell() {
  const [open, setOpen] = useState(false);

  const {
    items,
    unreadCount,
    browserPermission,
    requestBrowserPermission,
    markAllRead,
    clearNotifications,
    pushNotification,
  } = useNotifications();

  const handleOpen = () => {
    setOpen((prev) => !prev);
    markAllRead();
  };

  const handleEnableBrowserNotifications = async () => {
    const permission = await requestBrowserPermission();

    if (permission === "granted") {
      pushNotification("Mobile/browser notifications enabled", "success", {
        browser: true,
        vibrate: true,
        title: "Bank QMS Notifications",
      });
    } else if (permission === "denied") {
      pushNotification(
        "Notification permission denied. Please enable it from browser settings.",
        "warning"
      );
    } else {
      pushNotification("Notifications are not supported on this browser.", "warning");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white transition hover:bg-slate-50"
      >
        {unreadCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-[999] mt-3 w-[calc(100vw-32px)] max-w-[390px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(17,39,77,0.2)]">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500">
                  Recent queue and admin activities
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={markAllRead}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 transition hover:bg-slate-200"
                  title="Mark all read"
                >
                  <CheckCheck size={16} />
                </button>

                <button
                  onClick={clearNotifications}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                  title="Clear"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEnableBrowserNotifications}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                browserPermission === "granted"
                  ? "bg-green-50 text-green-700"
                  : "bg-[#5777B2] text-white hover:opacity-95"
              }`}
            >
              <BellRing size={17} />
              {browserPermission === "granted"
                ? "Mobile Notifications Enabled"
                : "Enable Mobile Notifications"}
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
                  <Bell size={28} />
                </div>
                <p className="font-bold text-slate-700">No notifications yet</p>
                <p className="mt-1 text-sm text-slate-400">
                  Queue activities will appear here.
                </p>
              </div>
            ) : (
              items.map((item) => {
                const Icon = getIcon(item.type);

                return (
                  <div
                    key={item.id}
                    className={`border-b border-slate-100 p-4 transition hover:bg-slate-50 ${
                      !item.read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${getStyles(
                          item.type
                        )}`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {item.title || "Notification"}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                              {item.message}
                            </p>
                            <p className="mt-2 text-xs text-slate-400">
                              {item.time}
                            </p>
                          </div>

                          {!item.read && (
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;