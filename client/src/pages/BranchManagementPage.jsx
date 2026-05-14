import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNotifications } from "../context/NotificationContext";
import ConfirmModal from "../components/common/ConfirmModal";
import BlurModal from "../components/common/BlurModal";

function BranchManagementPage() {
  const { pushNotification } = useNotifications();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [showForm, setShowForm] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);

  const [branchForm, setBranchForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get("/branches");
      setBranches(res.data.branches || []);
    } catch (err) {
      console.error(err);
      pushNotification("Failed to load branches", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleBranchChange = (e) => {
    const { name, value } = e.target;
    setBranchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetBranchForm = () => {
    setBranchForm({
      name: "",
      address: "",
      city: "",
      state: "",
    });
    setEditingBranchId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setEditingBranchId(null);
    setBranchForm({
      name: "",
      address: "",
      city: "",
      state: "",
    });
    setShowForm(true);
  };

  const handleCreateOrUpdateBranch = async (e) => {
    e.preventDefault();

    if (!branchForm.name.trim()) {
      pushNotification("Branch name is required", "error");
      return;
    }

    try {
      if (editingBranchId) {
        const res = await api.put(`/branches/${editingBranchId}`, branchForm);
        pushNotification(res.data.message, "success");
      } else {
        const res = await api.post("/branches", branchForm);
        pushNotification(res.data.message, "success");
      }

      resetBranchForm();
      fetchBranches();
    } catch (err) {
      console.error(err);
      pushNotification(
        err.response?.data?.message || "Failed to save branch",
        "error"
      );
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranchId(branch.id);
    setBranchForm({
      name: branch.name || "",
      address: branch.address || "",
      city: branch.city || "",
      state: branch.state || "",
    });
    setShowForm(true);
  };

  const handleDeleteBranch = async (id) => {
    try {
      const res = await api.delete(`/branches/${id}`);
      pushNotification(res.data.message, "success");
      fetchBranches();
    } catch (err) {
      console.error(err);
      pushNotification(
        err.response?.data?.message || "Failed to delete branch",
        "error"
      );
    }
  };

  const askDeleteBranch = (id) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmId) return;
    await handleDeleteBranch(confirmId);
    setConfirmOpen(false);
    setConfirmId(null);
  };

  const inputStyle =
  
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition-all focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10";

  const filteredBranches = branches.filter((branch) => {
  const keyword = searchTerm.toLowerCase();
  return (
    branch.name?.toLowerCase().includes(keyword) ||
    branch.address?.toLowerCase().includes(keyword) ||
    branch.city?.toLowerCase().includes(keyword) ||
    branch.state?.toLowerCase().includes(keyword)
  );
});
const totalPages = Math.ceil(filteredBranches.length / rowsPerPage);

const paginatedBranches = filteredBranches.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">All Branches</h2>
            <p className="text-sm text-slate-500 mt-1">
              View and manage all available branches.
            </p>
          </div>
          <input
  type="text"
  value={searchTerm}
 onChange={(e) => {
  setSearchTerm(e.target.value);
  setCurrentPage(1);
}}
  placeholder="Search branches..."
  className="w-64 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10"
/>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={openAddForm}
              className="rounded-2xl bg-gradient-to-r from-[#5777B2] to-[#6C7790] px-5 py-3 text-white font-semibold shadow-lg shadow-[#5777B2]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Add Branch
            </button>

            <button
              onClick={fetchBranches}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-slate-700 font-semibold transition-all duration-300 hover:bg-slate-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Loading branches...
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No branches available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">Branch</th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">Address</th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">City</th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">State</th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">Created At</th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedBranches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="py-4 px-3 font-semibold text-slate-900">{branch.name}</td>
                    <td className="py-4 px-3 text-slate-700">{branch.address || "No address"}</td>
                    <td className="py-4 px-3 text-slate-700">{branch.city || "-"}</td>
                    <td className="py-4 px-3 text-slate-700">{branch.state || "-"}</td>
                    <td className="py-4 px-3 text-slate-700">
                      {branch.created_at
                        ? new Date(branch.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBranch(branch)}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-white font-medium transition hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => askDeleteBranch(branch.id)}
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
        onClose={resetBranchForm}
        maxWidth="max-w-2xl"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {editingBranchId ? "Edit Branch" : "Create Branch"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage branch details with a clean and structured workflow.
          </p>
        </div>

        <form onSubmit={handleCreateOrUpdateBranch} className="space-y-5">
          <input
            type="text"
            name="name"
            value={branchForm.name}
            onChange={handleBranchChange}
            placeholder="Branch Name"
            className={inputStyle}
            required
          />

          <input
            type="text"
            name="address"
            value={branchForm.address}
            onChange={handleBranchChange}
            placeholder="Address"
            className={inputStyle}
          />

          <input
            type="text"
            name="city"
            value={branchForm.city}
            onChange={handleBranchChange}
            placeholder="City"
            className={inputStyle}
          />

          <input
            type="text"
            name="state"
            value={branchForm.state}
            onChange={handleBranchChange}
            placeholder="State"
            className={inputStyle}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-gradient-to-r from-[#5777B2] to-[#6C7790] px-5 py-3.5 font-semibold text-white shadow-lg shadow-[#5777B2]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#5777B2]/25 active:scale-[0.98]"
            >
              {editingBranchId ? "Update Branch" : "Create Branch"}
            </button>

            <button
              type="button"
              onClick={resetBranchForm}
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
        title="Delete Branch"
        description="Are you sure you want to delete this branch?"
      />
    </div>
  );
}

export default BranchManagementPage;