import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNotifications } from "../context/NotificationContext";
import ConfirmModal from "../components/common/ConfirmModal";
import BlurModal from "../components/common/BlurModal";

function ServiceManagementPage() {
  const { pushNotification } = useNotifications();

  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [showForm, setShowForm] = useState(false);

  const [editingServiceId, setEditingServiceId] = useState(null);

  const [serviceForm, setServiceForm] = useState({
    branch_id: "",
    name: "",
    avg_service_time: "",
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

  const fetchAllServices = async () => {
    try {
      setLoading(true);

      const branchesRes = await api.get("/branches");
      const branchList = branchesRes.data.branches || [];
      setBranches(branchList);

      const serviceResults = await Promise.all(
        branchList.map(async (branch) => {
          const res = await api.get(`/services/${branch.id}`);
          return (res.data.services || []).map((service) => ({
            ...service,
            branch_name: branch.name,
          }));
        })
      );

      setServices(serviceResults.flat());
    } catch (err) {
      console.error(err);
      pushNotification("Failed to load services", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchAllServices();
  }, []);

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setServiceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetServiceForm = () => {
    setServiceForm({
      branch_id: "",
      name: "",
      avg_service_time: "",
    });
    setEditingServiceId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setEditingServiceId(null);
    setServiceForm({
      branch_id: "",
      name: "",
      avg_service_time: "",
    });
    setShowForm(true);
  };

  const handleCreateOrUpdateService = async (e) => {
    e.preventDefault();

    if (!serviceForm.branch_id || !serviceForm.name.trim()) {
      pushNotification("Branch and service name are required", "error");
      return;
    }

    try {
      const payload = {
        ...serviceForm,
        avg_service_time: Number(serviceForm.avg_service_time || 5),
      };

      if (editingServiceId) {
        const res = await api.put(`/services/${editingServiceId}`, payload);
        pushNotification(res.data.message, "success");
      } else {
        const res = await api.post("/services", payload);
        pushNotification(res.data.message, "success");
      }

      resetServiceForm();
      fetchAllServices();
    } catch (err) {
      console.error(err);
      pushNotification(
        err.response?.data?.message || "Failed to save service",
        "error"
      );
    }
  };

  const handleEditService = (service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      branch_id: service.branch_id || "",
      name: service.name || "",
      avg_service_time: service.avg_service_time || "",
    });
    setShowForm(true);
  };

  const handleDeleteService = async (id) => {
    try {
      const res = await api.delete(`/services/${id}`);
      pushNotification(res.data.message, "success");
      fetchAllServices();
    } catch (err) {
      console.error(err);
      pushNotification(
        err.response?.data?.message || "Failed to delete service",
        "error"
      );
    }
  };

  const askDeleteService = (id) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmId) return;
    await handleDeleteService(confirmId);
    setConfirmOpen(false);
    setConfirmId(null);
  };

  const inputStyle =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition-all focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10";
const filteredServices = services.filter((service) => {
  const keyword = searchTerm.toLowerCase();

  

  return (
    service.name?.toLowerCase().includes(keyword) ||
    service.branch_name?.toLowerCase().includes(keyword) ||
    String(service.avg_service_time || "").includes(keyword)
  );
});
const totalPages = Math.ceil(filteredServices.length / rowsPerPage);

const paginatedServices = filteredServices.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">All Services</h2>
            <p className="text-sm text-slate-500 mt-1">
              View and manage all available services.
            </p>
          </div>
          <input
  type="text"
  value={searchTerm}
  onChange={(e) => {
  setSearchTerm(e.target.value);
  setCurrentPage(1);
}}
  placeholder="Search services..."
  className="w-64 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
/>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={openAddForm}
              className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-3 text-white font-semibold shadow-lg shadow-green-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Add Service
            </button>

            <button
              onClick={fetchAllServices}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-slate-700 font-semibold transition-all duration-300 hover:bg-slate-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Loading services...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No services available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Service
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Branch
                  </th>
                  <th className="py-4 px-3 text-sm font-semibold text-slate-600">
                    Avg Time
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
               {paginatedServices.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="py-4 px-3 font-semibold text-slate-900">
                      {service.name}
                    </td>
                    <td className="py-4 px-3 text-slate-700">
                      {service.branch_name || "-"}
                    </td>
                    <td className="py-4 px-3 text-slate-700">
                      {service.avg_service_time} min
                    </td>
                    <td className="py-4 px-3 text-slate-700">
                      {service.created_at
                        ? new Date(service.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-white font-medium transition hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => askDeleteService(service.id)}
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
        onClose={resetServiceForm}
        maxWidth="max-w-2xl"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {editingServiceId ? "Edit Service" : "Create Service"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage service setup for selected branches.
          </p>
        </div>

        <form onSubmit={handleCreateOrUpdateService} className="space-y-5">
          <select
            name="branch_id"
            value={serviceForm.branch_id}
            onChange={handleServiceChange}
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
            value={serviceForm.name}
            onChange={handleServiceChange}
            placeholder="Service Name"
            className={inputStyle}
            required
          />

          <input
            type="number"
            name="avg_service_time"
            value={serviceForm.avg_service_time}
            onChange={handleServiceChange}
            placeholder="Avg Service Time (minutes)"
            className={inputStyle}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-500/25 active:scale-[0.98]"
            >
              {editingServiceId ? "Update Service" : "Create Service"}
            </button>

            <button
              type="button"
              onClick={resetServiceForm}
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
        title="Delete Service"
        description="Are you sure you want to delete this service?"
      />
    </div>
  );
}

export default ServiceManagementPage;