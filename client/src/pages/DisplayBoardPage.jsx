import { useEffect, useState } from "react";
import api from "../api/axios";
import socket from "../socket";
import {
  getAppSettings,
  defaultSettings,
} from "../pages/utils/settingsHelper";

function DisplayBoardPage() {
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);

  const [current, setCurrent] = useState(null);
  const [nextTokens, setNextTokens] = useState([]);

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

  // 🔊 SOUND
  const playSound = () => {
    if (!audioEnabled) return;
    if (!settings.sound_enabled) return;

    try {
      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      );
      audio.volume = 1;

      audio.play().catch((err) => {
        console.log("Sound blocked:", err);
      });
    } catch (err) {
      console.log("Audio error:", err);
    }
  };

  // ================= LOAD SETTINGS =================
  useEffect(() => {
    const loadSettings = async () => {
      const data = await getAppSettings();
      setSettings(data);
    };

    loadSettings();
  }, []);

  // ================= FETCH =================
  const fetchBranches = async () => {
    try {
      const res = await api.get("/branches");
      setBranches(res.data.branches || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDisplayData = async () => {
    if (!branchId) return;

    try {
      const res = await api.get(`/queue/display/${branchId}`);

      setCurrent(res.data.current || null);

      // 🔥 APPLY SETTINGS: next tokens count
      const count = Number(settings.display_next_count || 5);

      setNextTokens((res.data.nextTokens || []).slice(0, count));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= EFFECT =================

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (branchId) fetchDisplayData();
  }, [branchId, settings]);

  // 🔄 AUTO REFRESH (settings based)
  useEffect(() => {
    if (!branchId) return;

    const intervalTime =
      Number(settings.auto_refresh_seconds || 5) * 1000;

    const interval = setInterval(fetchDisplayData, intervalTime);

    return () => clearInterval(interval);
  }, [branchId, settings]);

  // ⚡ SOCKET REALTIME
  useEffect(() => {
    const handler = (data) => {
      if (data.branch_id === branchId) {
        fetchDisplayData();
        playSound();
      }
    };

    socket.on("queueUpdated", handler);

    return () => socket.off("queueUpdated", handler);
  }, [branchId, audioEnabled, settings]);

  // ================= UI =================

  return (
    <div
      className="min-h-screen bg-[#0B1736] text-white p-6"
      onClick={() => {
        if (!audioEnabled) {
          setAudioEnabled(true);
          playSound();
        }
      }}
    >
      {/* HEADER */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h1 className="text-4xl font-black">
          {settings.display_title || "Queue Display Board"}
        </h1>

        <div className="flex gap-3 items-center">
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="bg-white text-black px-4 py-2 rounded-xl"
          >
            <option value="">Select Branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setAudioEnabled(true);
              playSound();
            }}
            className="bg-green-500 px-4 py-2 rounded-xl text-white font-bold"
          >
            Enable Sound 🔊
          </button>
        </div>
      </div>

      {/* CURRENT TOKEN */}
      <div className="bg-gradient-to-r from-[#5777B2] to-[#11274D] p-10 rounded-3xl text-center shadow-xl">
        <p className="text-xl text-white/70">Now Serving</p>

        <h2 className="text-8xl font-black mt-3">
          {current?.token_number || "--"}
        </h2>

        <p className="mt-3 text-xl">
          {current?.service_name || ""}
        </p>

        <p className="text-lg text-white/70">
          Counter: {current?.counter_name || "-"}
        </p>
      </div>

      {/* NEXT TOKENS */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {nextTokens.length === 0 ? (
          <div className="col-span-2 text-center text-white/60">
            No upcoming tokens
          </div>
        ) : (
          nextTokens.map((t, index) => (
            <div
              key={t.id}
              className="bg-white text-black p-6 rounded-3xl text-center shadow-xl"
            >
              <p className="text-sm text-gray-500">
                Next #{index + 1}
              </p>

              <h3 className="text-5xl font-black mt-2">
                {t.token_number}
              </h3>

              <p className="text-gray-600 mt-1">
                {t.service_name}
              </p>
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      <p className="text-center text-white/40 mt-8 text-sm">
        Auto refresh every {settings.auto_refresh_seconds || 5} seconds
      </p>
    </div>
  );
}

export default DisplayBoardPage;