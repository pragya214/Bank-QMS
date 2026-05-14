import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/audit-logs");
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    return logs.filter((log) => {
      const matchesSearch =
        log.description?.toLowerCase().includes(keyword) ||
        log.action?.toLowerCase().includes(keyword) ||
        log.entity_type?.toLowerCase().includes(keyword) ||
        log.user_name?.toLowerCase().includes(keyword) ||
        log.user_phone?.toLowerCase().includes(keyword) ||
        log.user_role?.toLowerCase().includes(keyword);

      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, searchTerm, actionFilter]);

  const actions = ["all", ...new Set(logs.map((log) => log.action))];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-500 mt-2">
          Track admin actions like create, update, delete, and status changes.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Activity History
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Showing latest {filteredLogs.length} activities
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="w-full sm:w-72 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10"
            />

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10"
            >
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action === "all" ? "All Actions" : action}
                </option>
              ))}
            </select>

            <button
              onClick={fetchLogs}
              className="rounded-2xl bg-gradient-to-r from-[#5777B2] to-[#6C7790] px-5 py-3 text-white font-semibold shadow-lg shadow-[#5777B2]/20 transition hover:-translate-y-0.5"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Loading audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No audit logs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Action
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Entity
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Description
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    User
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Role
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="py-4 px-3">
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#5777B2]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {log.entity_type}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-slate-800 font-medium">
                      {log.description || "-"}
                    </td>

                    <td className="py-4 px-3">
                      <p className="font-semibold text-slate-900">
                        {log.user_name || "System/User"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {log.user_phone || "-"}
                      </p>
                    </td>

                    <td className="py-4 px-3 text-slate-700">
                      {log.user_role || "-"}
                    </td>

                    <td className="py-4 px-3 text-slate-600">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogsPage;