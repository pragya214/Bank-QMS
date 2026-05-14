import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Loader2,
  Phone,
  Sparkles,
  User,
  WalletCards,
} from "lucide-react";
import api from "../api/axios";
import TokenSuccessModal from "../components/qms/TokenSuccessModal";
import { useNotifications } from "../context/NotificationContext";
import CustomerHeader from "../pages/customer/CustomerHeader";

function JoinQueuePage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    branch_id: "",
    service_id: "",
  });

  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const [successOpen, setSuccessOpen] = useState(false);
  const [tokenModalData, setTokenModalData] = useState(null);

  const { pushNotification } = useNotifications();

  const fetchBranches = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/branches");
      setBranches(res.data.branches || []);
    } catch (err) {
      console.error("Error fetching branches:", err);
      setError("Failed to load branches");
    } finally {
      setPageLoading(false);
    }
  };

  const fetchServices = async (branchId) => {
    try {
      setError("");
      const res = await api.get(`/services/${branchId}`);
      setServices(res.data.services || []);
    } catch (err) {
      console.error("Error fetching services:", err);
      setServices([]);
      setError("Failed to load services");
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (formData.branch_id) {
      fetchServices(formData.branch_id);
    } else {
      setServices([]);
    }
  }, [formData.branch_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
      ...(name === "branch_id" ? { service_id: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.phone.length !== 10) {
      setLoading(false);
      setError("Phone number must be exactly 10 digits");
      return;
    }

    try {
      const res = await api.post("/queue/join", formData);

      const selectedService = services.find(
        (service) => service.id === formData.service_id
      );

      const selectedBranch = branches.find(
        (branch) => branch.id === formData.branch_id
      );

      setTokenModalData({
        ...res.data,
        service_name: selectedService?.name || "General Queue",
        branch_name: selectedBranch?.name || "Selected Branch",
        time: new Date().toLocaleTimeString(),
      });

      setSuccessOpen(true);
      pushNotification("Token generated successfully", "success");

      setFormData({
        name: "",
        phone: "",
        branch_id: "",
        service_id: "",
      });

      setServices([]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition-all focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10 disabled:bg-slate-100 disabled:text-slate-400";

  return (
    <>
    <CustomerHeader />
    <div className="min-h-[calc(100vh-120px)] px-3 py-4 sm:px-4 md:px-6">
      <div className="grid lg:grid-cols-[1fr_460px] gap-5 lg:gap-7 items-start max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#11274D] via-[#1D376A] to-[#5777B2] p-7 md:p-10 text-white shadow-[0_25px_80px_rgba(17,39,77,0.25)]">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-[#E6C790]/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-xl">
              <Sparkles size={16} />
              Fast Digital Queue
            </div>

            <h1 className="mt-6 text-3xl sm:text-4xl md:text-6xl font-black leading-tight">
              Join Queue <br />
              Without Waiting in Line
            </h1>

            <p className="mt-5 max-w-2xl text-white/70 text-base md:text-lg">
              Enter your mobile number, select branch and service, then generate
              your token instantly.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                <Phone className="text-[#E6C790]" />
                <p className="mt-4 font-bold">Mobile Based</p>
                <p className="text-sm text-white/60 mt-1">
                  Only phone number required
                </p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                <WalletCards className="text-[#E6C790]" />
                <p className="mt-4 font-bold">Smart Token</p>
                <p className="text-sm text-white/60 mt-1">
                  Auto token generation
                </p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                <CheckCircle2 className="text-[#E6C790]" />
                <p className="mt-4 font-bold">Live Tracking</p>
                <p className="text-sm text-white/60 mt-1">
                  Track queue status easily
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] md:rounded-[34px] border border-slate-200 bg-white p-5 md:p-7 shadow-[0_20px_70px_rgba(17,39,77,0.12)]">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-slate-900">
              Generate Token
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Fill the details below to join the queue.
            </p>
          </div>

          {pageLoading ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
              Loading branches...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <User size={16} />
                  Customer Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name optional"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Phone size={16} />
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10 digit mobile number"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Building2 size={16} />
                  Branch
                </label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  disabled={branches.length === 0}
                >
                  <option value="">
                    {branches.length === 0
                      ? "No Branches Available"
                      : "Select Branch"}
                  </option>

                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>

                {branches.length === 0 && (
                  <p className="mt-2 text-sm text-red-500">
                    No branches available
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <WalletCards size={16} />
                  Service
                </label>
                <select
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  disabled={!formData.branch_id || services.length === 0}
                >
                  <option value="">
                    {!formData.branch_id
                      ? "Select Branch First"
                      : services.length === 0
                      ? "No Services Available"
                      : "Select Service"}
                  </option>

                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>

                {formData.branch_id && services.length === 0 && (
                  <p className="mt-2 text-sm text-red-500">
                    No services available
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5777B2] to-[#6C7790] px-5 py-4 font-bold text-white shadow-lg shadow-[#5777B2]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Generating Token..." : "Generate Token"}
              </button>
            </form>
          )}
        </div>
      </div>

      <TokenSuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        tokenData={tokenModalData}
      />
    </div>
    </>
  );
}

export default JoinQueuePage;