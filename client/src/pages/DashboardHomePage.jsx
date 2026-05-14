import { useEffect, useState } from "react";
import {
  Ticket,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Monitor,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import api from "../api/axios";
import socket from "../socket";
import TokensLineChart from "../components/charts/TokensLineChart";
import QueuePieChart from "../components/charts/QueuePieChart";
import HourlyBarChart from "../components/charts/HourlyBarChart";

function DashboardHomePage() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  const dashboardSummary = summary?.summary || {};
  const lineData = (summary?.lineData || []).map((item) => ({
  time: `${item.hour}:00`,
  tokens: Number(item.tokens || 0),
}));

const pieData = (summary?.pieData || []).map((item) => ({
  name: item.name,
  value: Number(item.value || 0),
}));

const barData = (summary?.barData || []).map((item) => ({
  hour: `${item.hour}:00`,
  count: Number(item.tokens || item.count || 0),
}));

  const fetchBranches = async () => {
    try {
      const res = await api.get("/branches");
      setBranches(res.data.branches || []);
      if (res.data.branches?.length > 0) {
        setSelectedBranch(res.data.branches[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load branches");
    }
  };

  const fetchSummary = async (branchId) => {
    if (!branchId) return;

    try {
      const res = await api.get(`/dashboard/summary/${branchId}`);
      setSummary(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard summary");
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (!selectedBranch) return;

    fetchSummary(selectedBranch);

    const handleQueueUpdate = (data) => {
      if (data.branch_id === selectedBranch) {
        fetchSummary(selectedBranch);
      }
    };

    socket.on("queueUpdated", handleQueueUpdate);
    return () => socket.off("queueUpdated", handleQueueUpdate);
  }, [selectedBranch]);

  const cards = [
    {
      title: "Total Branches",
      value: dashboardSummary?.total_branches ?? 0,
      icon: Building2,
      tone: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      title: "Total Counters",
      value: dashboardSummary?.total_counters ?? 0,
      icon: Monitor,
      tone: "from-purple-500 to-fuchsia-500",
      bg: "bg-purple-50",
      text: "text-purple-700",
    },
    {
      title: "Waiting Tokens",
      value: dashboardSummary?.waiting_tokens ?? 0,
      icon: Ticket,
      tone: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      title: "Serving Tokens",
      value: dashboardSummary?.serving_tokens ?? 0,
      icon: Activity,
      tone: "from-cyan-500 to-blue-500",
      bg: "bg-cyan-50",
      text: "text-cyan-700",
    },
    {
      title: "Completed Today",
      value: dashboardSummary?.completed_today ?? 0,
      icon: CheckCircle2,
      tone: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
      text: "text-green-700",
    },
    {
      title: "No Show Today",
      value: dashboardSummary?.no_show_today ?? 0,
      icon: AlertTriangle,
      tone: "from-red-500 to-rose-500",
      bg: "bg-red-50",
      text: "text-red-700",
    },
  ];

  const selectedBranchName =
    branches.find((branch) => branch.id === selectedBranch)?.name ||
    "Select Branch";

  return (
    <div className="space-y-7">
      <div className="relative overflow-hidden rounded-[34px] border border-white/50 bg-gradient-to-br from-[#11274D] via-[#1D376A] to-[#5777B2] p-6 md:p-8 shadow-[0_25px_80px_rgba(17,39,77,0.24)]">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-24 h-52 w-52 rounded-full bg-[#E6C790]/20 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-xl">
              <Sparkles size={16} />
              Live Admin Intelligence
            </div>

            <h2 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white">
              Real-Time Operations Dashboard
            </h2>

            <p className="mt-3 max-w-2xl text-sm md:text-base text-white/70">
              Live branch performance, queue activity, counter usage, and token
              insights for {selectedBranchName}.
            </p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60">
              Active Branch
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="min-w-[240px] rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-[#11274D] outline-none"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => fetchSummary(selectedBranch)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#11274D] transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_15px_45px_rgba(17,39,77,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(17,39,77,0.15)]"
            >
              <div
                className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${card.tone} opacity-10 blur-xl transition group-hover:opacity-20`}
              />

              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
                    {card.title}
                  </p>

                  <h3 className="mt-4 text-5xl font-black tracking-tight text-slate-900">
                    {card.value}
                  </h3>

                  <p className={`mt-3 text-sm font-semibold ${card.text}`}>
                    Live synced
                  </p>
                </div>

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.bg} ${card.text}`}
                >
                  <Icon size={26} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_15px_45px_rgba(17,39,77,0.08)]">
          <TokensLineChart data={lineData} />
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_15px_45px_rgba(17,39,77,0.08)]">
          <QueuePieChart data={pieData} />
        </div>
      </div>

      <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_15px_45px_rgba(17,39,77,0.08)]">
        <HourlyBarChart data={barData} />
      </div>
    </div>
  );
}

export default DashboardHomePage;