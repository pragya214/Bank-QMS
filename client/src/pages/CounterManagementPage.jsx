import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNotifications } from "../context/NotificationContext";
import ConfirmModal from "../components/common/ConfirmModal";
import BlurModal from "../components/common/BlurModal";

function CounterManagementPage() {
  const { pushNotification } = useNotifications();

  const [branches, setBranches] = useState([]);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [showForm, setShowForm] = useState(false);

  const [editingCounterId, setEditingCounterId] = useState(null);

  const [counterForm, setCounterForm] = useState({
    branch_id: "",
    name: "",
    status: "active",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const fetchBranches = async () => {
    try {
      const res = await api.get("/branches");
      setBranches(res.data.branches || []);
    } catch (err) {
      console.error(err);
      pushNotification("Failed to load branches", "error");
    }
  };

  const fetchAllCounters = async () => {
    try {
      setLoading(true);

      const branchesRes = await api.get("/branches");
      const branchList = branchesRes.data.branches || [];
      setBranches(branchList);

      const counterResults = await Promise.all(
        branchList.map(async (branch) => {
          const res = await api.get(`/counters/${branch.id}`);
          return (res.data.counters || []).map((counter) => ({
            ...counter,
            branch_name: branch.name,
          }));
        })
      );

      setCounters(counterResults.flat());
    } catch (err) {
      console.error(err);
      pushNotification("Failed to load counters", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchAllCounters();
  }, []);

  const handleCounterChange = (e) => {
    const { name, value } = e.target;
    setCounterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetCounterForm = () => {
    setCounterForm({
      branch_id: "",
      name: "",
      status: "active",
    });
    setEditingCounterId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setEditingCounterId(null);
    setCounterForm({
      branch_id: "",
      name: "",
      status: "active",
    });
    setShowForm(true);
  };

  const handleCreateOrUpdateCounter = async (e) => {
    e.preventDefault();

    if (!counterForm.branch_id || !counterForm.name.trim()) {
      pushNotification("Branch and counter name are required", "error");
      return;
    }

    try {
      if (editingCounterId) {
        const res = await api.put(`/counters/${editingCounterId}`, counterForm);
        pushNotification(res.data.message, "success");
      } else {
        const res = await api.post("/counters", counterForm);
        pushNotification(res.data.message, "success");
      }

      resetCounterForm();
      fetchAllCounters();
    } catch (err) {
      console.error(err);
      pushNotification(
        err.response?.data?.message || "Failed to save counter",
        "error"
      );
    }
  };

  const handleEditCounter = (counter) => {
    setEditingCounterId(counter.id);
    setCounterForm({
      branch_id: counter.branch_id || "",
      name: counter.name || "",
      status: counter.status || "active",
    });
    setShowForm(true);
  };

  const handleDeleteCounter = async (id) => {
    try {
      const res = await api.delete(`/counters/${id}`);
      pushNotification(res.data.message, "success");
      fetchAllCounters();
    } catch (err) {
      console.error(err);
      pushNotification(
        err.response?.data?.message || "Failed to delete counter",
        "error"
      );
    }
  };

  const handleToggleStatus = async (id) => {
  try {
    const res = await api.patch(`/counters/${id}/toggle-status`);
    pushNotification(res.data.message, "success");
    fetchAllCounters();
  } catch (err) {
    console.error(err);
    pushNotification(
      err.response?.data?.message || "Failed to update counter status",
      "error"
    );
  }
};

  const askDeleteCounter = (id) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmId) return;
    await handleDeleteCounter(confirmId);
    setConfirmOpen(false);
    setConfirmId(null);
  };

  const inputStyle =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition-all focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10";
const filteredCounters = counters.filter((counter) => {
  const keyword = searchTerm.toLowerCase();

  return (
    counter.name?.toLowerCase().includes(keyword) ||
    counter.branch_name?.toLowerCase().includes(keyword) ||
    counter.status?.toLowerCase().includes(keyword)
  );
});
const totalPages = Math.ceil(filteredCounters.length / rowsPerPage);

const paginatedCounters = filteredCounters.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">All Counters</h2>
            <p className="text-sm text-slate-500 mt-1">
              View and manage all counters across branches.
            </p>
          </div>

          <input
  type="text"
  value={searchTerm}
  onChange={(e) => {
  setSearchTerm(e.target.value);
  setCurrentPage(1);
}}
  placeholder="Search counters..."
  className="w-64 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
         />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={openAddForm}
              className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-white font-semibold shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Add Counter
            </button>

            <button
              onClick={fetchAllCounters}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-slate-700 font-semibold transition-all duration-300 hover:bg-slate-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Loading counters...
          </div>
       ) : filteredCounters.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No counters available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Counter
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Branch
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Created At
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedCounters.map((counter) => (
                  <tr
                    key={counter.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="py-4 px-3 font-semibold text-slate-900">
                      {counter.name}
                    </td>
                    <td className="py-4 px-3 text-slate-700">
                      {counter.branch_name || "-"}
                    </td>
                    <td className="py-4 px-3">
                      <button
  onClick={() => handleToggleStatus(counter.id)}
  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold transition hover:scale-105 ${
    counter.status === "active"
      ? "bg-green-50 text-green-700 hover:bg-green-100"
      : "bg-red-50 text-red-700 hover:bg-red-100"
  }`}
  title="Click to toggle status"
>
  {counter.status}
</button>
                    </td>
                    <td className="py-4 px-3 text-slate-700">
                      {counter.created_at
                        ? new Date(counter.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCounter(counter)}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-white font-medium transition hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => askDeleteCounter(counter.id)}
                          className="rounded-xl bg-red-600 px-4 py-2 text-white font-medium transition hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
  <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
    <p className="text-sm text-slate-500">
      Page {currentPage} of {totalPages}
    </p>

    <div className="flex gap-2">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
      >
        Previous
      </button>

      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1;

        return (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              currentPage === page
                ? "bg-[#5777B2] text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() =>
          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
        }
        disabled={currentPage === totalPages}
        className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
)}
          </div>
        )}
      </div>

      <BlurModal
        open={showForm}
        onClose={resetCounterForm}
        maxWidth="max-w-2xl"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {editingCounterId ? "Edit Counter" : "Create Counter"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage counters with proper status control.
          </p>
        </div>

        <form onSubmit={handleCreateOrUpdateCounter} className="space-y-5">
          <select
            name="branch_id"
            value={counterForm.branch_id}
            onChange={handleCounterChange}
            className={inputStyle}
            required
            disabled={branches.length === 0}
          >
            <option value="">
              {branches.length === 0 ? "No Branches Available" : "Select Branch"}
            </option>

            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>

          {branches.length === 0 && (
            <p className="text-sm text-red-500 mt-2">No branches available</p>
          )}

          <input
            type="text"
            name="name"
            value={counterForm.name}
            onChange={handleCounterChange}
            placeholder="Counter Name"
            className={inputStyle}
            required
          />

          <select
            name="status"
            value={counterForm.status}
            onChange={handleCounterChange}
            className={inputStyle}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/25 active:scale-[0.98]"
            >
              {editingCounterId ? "Update Counter" : "Create Counter"}
            </button>

            <button
              type="button"
              onClick={resetCounterForm}
              className="rounded-2xl bg-slate-100 px-5 py-3.5 font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </BlurModal>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Counter"
        description="Are you sure you want to delete this counter?"
      />
    </div>
  );
}

export default CounterManagementPage;