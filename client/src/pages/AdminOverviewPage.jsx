import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminOverviewPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBranchesOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/admin/branches-overview");
      setBranches(res.data.branches || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load admin overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchesOverview();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-slate-500 mt-2">
          Branch-wise queue performance and token activity overview.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-slate-900">
            Branch Overview Table
          </h2>

          <button
            onClick={fetchBranchesOverview}
            className="rounded-2xl bg-gradient-to-r from-[#5777B2] to-[#6C7790] px-5 py-3 text-white font-semibold shadow-lg shadow-[#5777B2]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Loading branch overview...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center text-red-600">
            {error}
          </div>
        ) : branches.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No branches available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Branch
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    City / State
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Counters
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Waiting
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Serving
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Completed Today
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    No Show Today
                  </th>
                </tr>
              </thead>

              <tbody>
                {branches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="py-4 px-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {branch.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {branch.address || "No address"}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-slate-700">
                      {branch.city || "-"}, {branch.state || "-"}
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#5777B2]">
                        {branch.total_counters}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex rounded-full bg-yellow-50 px-3 py-1 text-sm font-semibold text-yellow-700">
                        {branch.waiting_tokens}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700">
                        {branch.serving_tokens}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                        {branch.completed_today}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
                        {branch.no_show_today}
                      </span>
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

export default AdminOverviewPage;