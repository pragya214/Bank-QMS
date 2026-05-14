import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BellRing, CheckCircle2, Info, XCircle, X } from "lucide-react";

const NotificationContext = createContext(null);

const STORAGE_KEY = "qms_notifications";

function getNotificationTitle(type) {
  if (type === "success") return "Success";
  if (type === "error") return "Error";
  if (type === "warning") return "Warning";
  return "Notification";
}

function getTypeIcon(type) {
  if (type === "success") return CheckCircle2;
  if (type === "error") return XCircle;
  if (type === "warning") return BellRing;
  return Info;
}

function getTypeClasses(type) {
  if (type === "success") {
    return {
      dot: "bg-green-500",
      icon: "bg-green-50 text-green-700",
      border: "border-green-100",
    };
  }

  if (type === "error") {
    return {
      dot: "bg-red-500",
      icon: "bg-red-50 text-red-700",
      border: "border-red-100",
    };
  }

  if (type === "warning") {
    return {
      dot: "bg-amber-500",
      icon: "bg-amber-50 text-amber-700",
      border: "border-amber-100",
    };
  }

  return {
    dot: "bg-blue-500",
    icon: "bg-blue-50 text-blue-700",
    border: "border-blue-100",
  };
}

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);
  const [browserPermission, setBrowserPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Notification restore failed:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const requestBrowserPermission = async () => {
    if (typeof Notification === "undefined") {
      setBrowserPermission("unsupported");
      return "unsupported";
    }

    if (Notification.permission === "granted") {
      setBrowserPermission("granted");
      return "granted";
    }

    const permission = await Notification.requestPermission();
    setBrowserPermission(permission);
    return permission;
  };

  const sendBrowserNotification = ({ title, message }) => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    try {
      new Notification(title, {
        body: message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    } catch (error) {
      console.error("Browser notification failed:", error);
    }
  };

  const vibrateDevice = () => {
    try {
      if ("vibrate" in navigator) {
        navigator.vibrate([180, 80, 180]);
      }
    } catch (error) {
      console.error("Vibration failed:", error);
    }
  };

  const pushNotification = (
    message,
    type = "info",
    options = {
      browser: false,
      vibrate: false,
      title: "",
    }
  ) => {
    const notification = {
      id: crypto.randomUUID(),
      message,
      type,
      title: options?.title || getNotificationTitle(type),
      time: new Date().toLocaleTimeString(),
      createdAt: new Date().toISOString(),
      read: false,
      hideToast: false,
    };

    setItems((prev) => [notification, ...prev].slice(0, 50));

    if (options?.browser) {
      sendBrowserNotification({
        title: notification.title,
        message,
      });
    }

    if (options?.vibrate) {
      vibrateDevice();
    }

    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, hideToast: true } : item
        )
      );
    }, 4500);
  };

  const dismissNotification = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, hideToast: true } : item))
    );
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const clearNotifications = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items]
  );

  const toastItems = useMemo(
    () => items.filter((item) => !item.hideToast).slice(0, 3),
    [items]
  );

  return (
    <NotificationContext.Provider
      value={{
        items,
        unreadCount,
        toastItems,
        browserPermission,
        requestBrowserPermission,
        pushNotification,
        dismissNotification,
        markAllRead,
        clearNotifications,
      }}
    >
      {children}

      <div className="fixed right-4 top-4 z-[9999] w-[calc(100vw-32px)] max-w-[380px] space-y-3 sm:right-5 sm:top-5">
        {toastItems.map((item) => {
          const Icon = getTypeIcon(item.type);
          const styles = getTypeClasses(item.type);

          return (
            <div
              key={item.id}
              className={`overflow-hidden rounded-3xl border ${styles.border} bg-white/95 shadow-[0_20px_70px_rgba(17,39,77,0.20)] backdrop-blur-xl animate-[fadeIn_.25s_ease]`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-[#1D2433]">
                          {item.title || getNotificationTitle(item.type)}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-700">
                          {item.message}
                        </p>
                        <p className="mt-2 text-xs font-medium text-slate-400">
                          {item.time}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => dismissNotification(item.id)}
                        className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-1 w-full bg-slate-100">
                <div
                  className={`h-full ${styles.dot} animate-[notificationBar_4.5s_linear_forwards]`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  return useContext(NotificationContext);
}