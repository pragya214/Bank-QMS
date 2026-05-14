import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Clock,
  Loader2,
  Search,
  Ticket,
  Users,
  Activity,
  BellRing,
} from "lucide-react";
import api from "../api/axios";
import CustomerHeader from "../pages/customer/CustomerHeader";
import { useNotifications } from "../context/NotificationContext";
import { getAppSettings, defaultSettings } from "../pages/utils/settingsHelper";

function QueueStatusPage() {
  const location = useLocation();
  const { pushNotification, requestBrowserPermission } = useNotifications();

  const [phone, setPhone] = useState("");
  const [tokenNumber, setTokenNumber] = useState("");

  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState("");

  const [lastStatus, setLastStatus] = useState("");
  const [turnSoonShown, setTurnSoonShown] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

  const playAlertSound = () => {
    if (!settings.sound_enabled) return;

    try {
      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      );
      audio.play().catch(() => {});
    } catch (error) {
      console.error("Sound failed:", error);
    }
  };

  const vibrate = () => {
    try {
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (error) {
      console.error("Vibration failed:", error);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getAppSettings();
      setSettings(data);
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const phoneFromUrl = params.get("phone");
    const tokenNumberFromUrl = params.get("tokenNumber");

    if (phoneFromUrl) setPhone(phoneFromUrl);
    if (tokenNumberFromUrl) setTokenNumber(tokenNumberFromUrl);
  }, [location.search]);

  const fetchStatus = async () => {
    if (!phone || !tokenNumber) {
      setError("Enter mobile number and token number");
      return;
    }

    if (phone.length !== 10) {
      setError("Enter valid 10 digit mobile number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.get(
        `/queue/customer-status?phone=${phone}&tokenNumber=${tokenNumber}`
      );

      const newStatus = res.data?.token?.status;
      const peopleAhead = Number(res.data?.people_ahead ?? 0);
      const turnSoonThreshold = Number(settings.turn_soon_threshold || 2);

      if (
        newStatus === "waiting" &&
        peopleAhead <= turnSoonThreshold &&
        !turnSoonShown
      ) {
        pushNotification(
          `Your turn is coming. Only ${peopleAhead} people ahead.`,
          "warning",
          {
            browser: settings.browser_notification_enabled,
            vibrate: true,
            title: "Queue Alert",
          }
        );

        playAlertSound();
        vibrate();
        setTurnSoonShown(true);
      }

      if (lastStatus && lastStatus !== newStatus) {
        if (newStatus === "serving") {
          pushNotification(
            "Your token is now being served. Please go to counter.",
            "success",
            {
              browser: settings.browser_notification_enabled,
              vibrate: true,
              title: "Now Serving",
            }
          );

          playAlertSound();
          vibrate();
        }

        if (newStatus === "completed") {
          pushNotification("Your token is completed", "success", {
            browser: settings.browser_notification_enabled,
            title: "Token Completed",
          });
        }

        if (newStatus === "no_show") {
          pushNotification("You missed your turn", "error", {
            browser: settings.browser_notification_enabled,
            title: "No Show",
          });
        }
      }

      setLastStatus(newStatus || "");
      setStatusData(res.data);
    } catch (err) {
      setStatusData(null);
      setError(err.response?.data?.message || "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phone && tokenNumber) {
      fetchStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, tokenNumber, settings]);

  useEffect(() => {
    if (!autoRefresh) return;
    if (!phone || !tokenNumber) return;

    const refreshMs = Number(settings.auto_refresh_seconds || 5) * 1000;

    const interval = setInterval(fetchStatus, refreshMs);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, phone, tokenNumber, lastStatus, settings]);

  const token = statusData?.token;

  const statusColor =
    token?.status === "waiting"
      ? "bg-amber-50 text-amber-700"
      : token?.status === "serving"
      ? "bg-blue-50 text-blue-700"
      : token?.status === "completed"
      ? "bg-green-50 text-green-700"
      : token?.status === "no_show"
      ? "bg-red-50 text-red-700"
      : "bg-slate-100 text-slate-700";

  return (
    <>
      <CustomerHeader />

      <div className="min-h-[calc(100vh-120px)] px-4 py-6 max-w-7xl mx-auto">
        <div className="mb-6 rounded-[30px] bg-gradient-to-br from-[#11274D] to-[#5777B2] p-6 text-white shadow-[0_20px_70px_rgba(17,39,77,0.22)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-white/60 font-semibold">
                {settings.welcome_message || "Welcome to Bank QMS"}
              </p>
              <h1 className="mt-2 text-3xl md:text-5xl font-black">
                Track Your Token
              </h1>
              <p className="mt-3 text-white/70">
                Enter your mobile number and token number to receive live queue
                updates.
              </p>
            </div>

            <button
              onClick={requestBrowserPermission}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-[#11274D] transition hover:-translate-y-0.5"
            >
              <BellRing size={18} />
              Enable Mobile Notifications
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[430px_1fr] gap-6">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_15px_45px_rgba(17,39,77,0.08)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#5777B2]">
                <Search />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Track Token
                </h2>
                <p className="text-sm text-slate-500">
                  Mobile + token number required
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setTurnSoonShown(false);
                  setLastStatus("");
                }}
                placeholder="Mobile Number"
                maxLength={10}
                inputMode="numeric"
                className="w-full rounded-2xl border border-slate-200 p-3.5 outline-none focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10"
              />

              <input
                value={tokenNumber}
                onChange={(e) => {
                  setTokenNumber(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setTurnSoonShown(false);
                  setLastStatus("");
                }}
                placeholder="Token Number"
                inputMode="numeric"
                className="w-full rounded-2xl border border-slate-200 p-3.5 outline-none focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10"
              />

              <button
                onClick={fetchStatus}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5777B2] to-[#6C7790] py-4 font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Checking..." : "Check Status"}
              </button>

              <label className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-bold text-slate-700">
                  Auto refresh every {settings.auto_refresh_seconds || 5} sec
                </span>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="h-5 w-5"
                />
              </label>

              {error && (
                <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#11274D] via-[#1D376A] to-[#5777B2] p-6 text-white shadow-[0_20px_70px_rgba(17,39,77,0.22)]">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-[#E6C790]/20 blur-3xl" />

            {!token ? (
              <div className="relative min-h-[460px] flex items-center justify-center text-center">
                <div>
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/10">
                    <Ticket size={48} />
                  </div>
                  <h2 className="text-4xl font-black">No Token Selected</h2>
                  <p className="mt-3 max-w-md text-white/65">
                    Enter mobile number and token number to view live queue
                    details.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-white/60 font-semibold">
                      Current Token Status
                    </p>
                    <h2 className="mt-2 text-5xl md:text-7xl font-black">
                      Token #{token.token_number}
                    </h2>
                    <p className="mt-3 text-white/75">
                      Service: {token.service_name || "-"}
                    </p>
                    <p className="mt-1 text-white/60">
                      Branch: {token.branch_name || "-"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-5 py-2 text-sm font-black uppercase ${statusColor}`}
                  >
                    {token.status || "unknown"}
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
                    <Users className="text-[#E6C790]" />
                    <p className="mt-4 text-white/60">People Ahead</p>
                    <h3 className="mt-2 text-4xl font-black">
                      {statusData.people_ahead ?? 0}
                    </h3>
                  </div>

                  <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
                    <Activity className="text-[#E6C790]" />
                    <p className="mt-4 text-white/60">Queue Position</p>
                    <h3 className="mt-2 text-4xl font-black">
                      {statusData.queue_position ?? 0}
                    </h3>
                  </div>

                  <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
                    <Clock className="text-[#E6C790]" />
                    <p className="mt-4 text-white/60">Estimated Wait</p>
                    <h3 className="mt-2 text-4xl font-black">
                      {statusData.estimated_wait_minutes ?? 0}
                      <span className="ml-1 text-lg">min</span>
                    </h3>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl bg-white p-6 text-[#11274D]">
                  <h3 className="text-xl font-black">Instruction</h3>
                  <p className="mt-2 text-slate-600">
                    Please stay ready near the service counter. You will receive
                    an alert when your turn is near.
                  </p>
                </div>

                <p className="mt-5 text-sm text-white/45">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default QueueStatusPage;