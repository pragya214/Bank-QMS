import { useEffect, useState } from "react";
import api from "../api/axios";
import socket from "../socket";
import CallNextModal from "../components/qms/CallNextModal";
import { useNotifications } from "../context/NotificationContext";

function StaffPanelPage() {
  const [branches, setBranches] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCounter, setSelectedCounter] = useState("");

  const [currentToken, setCurrentToken] = useState(null);
  const [waitingCount, setWaitingCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [callOpen, setCallOpen] = useState(false);
  const [calledToken, setCalledToken] = useState(null);

  const { pushNotification } = useNotifications();

  // ================= FETCH =================

  const fetchBranches = async () => {
    const res = await api.get("/branches");
    setBranches(res.data.branches || []);
  };

  const fetchCounters = async (branchId) => {
    const res = await api.get(`/counters/${branchId}`);
    setCounters(res.data.counters || []);
  };

  const fetchCurrentToken = async () => {
    if (!selectedBranch) return;

    const res = await api.get(`/queue/current/${selectedBranch}`);
    setCurrentToken(res.data.token || null);
  };

  const fetchWaitingCount = async () => {
    if (!selectedBranch) return;

    const res = await api.get(`/queue/display/${selectedBranch}`);
    setWaitingCount(res.data.nextTokens?.length || 0);
  };

  // ================= EFFECTS =================

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchCounters(selectedBranch);
      fetchCurrentToken();
      fetchWaitingCount();
    }
  }, [selectedBranch]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCurrentToken();
      fetchWaitingCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedBranch]);

  useEffect(() => {
    socket.on("queueUpdated", () => {
      fetchCurrentToken();
      fetchWaitingCount();
    });

    return () => socket.off("queueUpdated");
  }, []);

  // ================= ACTIONS =================

  const handleCallNext = async () => {
    if (!selectedBranch || !selectedCounter) {
      setError("Select branch & counter");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/queue/call-next", {
        branch_id: selectedBranch,
        counter_id: selectedCounter,
      });

      setCurrentToken(res.data.token);
      setCalledToken(res.data.token);
      setCallOpen(true);

      pushNotification(
        `Calling Token ${res.data.token.token_number}`,
        "success"
      );
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);

    const res = await api.post("/queue/complete", {
      token_id: currentToken.id,
    });

    setCurrentToken(null);
    pushNotification("Token completed", "success");
    setActionLoading(false);
  };

  const handleNoShow = async () => {
    setActionLoading(true);

    const res = await api.post("/queue/no-show", {
      token_id: currentToken.id,
    });

    setCurrentToken(null);
    pushNotification("Marked no-show", "info");
    setActionLoading(false);
  };

  // ================= UI =================

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-bold text-[#5777B2] mb-6">
          Staff Panel
        </h1>

        {/* SELECT */}
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="border p-3 rounded-2xl"
          >
            <option>Select Branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCounter}
            onChange={(e) => setSelectedCounter(e.target.value)}
            className="border p-3 rounded-2xl"
          >
            <option>Select Counter</option>
            {counters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* CALL BUTTON */}
        <button
          onClick={handleCallNext}
          className="w-full bg-[#5777B2] text-white py-3 rounded-2xl font-bold"
        >
          {loading ? "Calling..." : "Call Next Token"}
        </button>

        {/* WAITING COUNT */}
        <div className="mt-5 bg-blue-50 p-4 rounded-2xl">
          Waiting Tokens:{" "}
          <span className="font-bold">{waitingCount}</span>
        </div>

        {/* CURRENT TOKEN */}
        {currentToken && (
          <div className="mt-6 bg-slate-100 p-5 rounded-3xl">
            <h2 className="text-xl font-bold mb-2">
              Now Serving
            </h2>

            <p className="text-4xl font-black text-[#5777B2]">
              {currentToken.token_number}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleComplete}
                className="bg-green-600 text-white py-2 rounded-xl"
              >
                Complete
              </button>

              <button
                onClick={handleNoShow}
                className="bg-red-600 text-white py-2 rounded-xl"
              >
                No Show
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 mt-3">{error}</p>}
      </div>

      <CallNextModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        token={calledToken}
      />
    </div>
  );
}

export default StaffPanelPage;