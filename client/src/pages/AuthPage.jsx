import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function AuthPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState("mobile");
  const [phoneNo, setPhoneNo] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("admin");
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (phoneNo.length !== 10) {
      setError("Mobile number must be 10 digits");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/send-otp", {
        phone_no: phoneNo,
      });

      const backendOtp = res.data.otp || "";

setDevOtp(backendOtp);
setOtp(backendOtp); // ✅ backend OTP auto-fill for testing
setMessage(res.data.message || "OTP sent successfully");
setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp || otp.length !== 6) {
      setError("Please enter valid 6 digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/verify-otp", {
        phone_no: phoneNo,
        otp,
        name: name || null,
        role,
      });

      localStorage.setItem("qms_token", res.data.token);
      localStorage.setItem("qms_user", JSON.stringify(res.data.user));

      setMessage(res.data.message || "Login successful");

      const userRole = res.data.user?.role;

      if (userRole === "display") {
        navigate("/display-board", { replace: true });
      } else if (userRole === "staff") {
        navigate("/staff-panel", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[32px] bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_25px_80px_rgba(17,39,77,0.18)] p-7">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-r from-[#5777B2] to-[#6C7790] flex items-center justify-center text-white text-2xl font-bold">
            Q
          </div>

          <h1 className="text-3xl font-bold text-slate-900">Bank QMS Login</h1>
          <p className="text-slate-500 mt-2">
            Login or register using mobile OTP
          </p>
        </div>

        {step === "mobile" && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Mobile Number
              </label>
              <input
                type="text"
                value={phoneNo}
                onChange={(e) =>
                  setPhoneNo(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="Enter 10 digit mobile number"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition-all focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10"
                maxLength={10}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-[#5777B2] to-[#6C7790] px-5 py-3.5 font-semibold text-white shadow-lg shadow-[#5777B2]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-sm text-slate-600">
                OTP sent to{" "}
                <span className="font-bold text-slate-900">{phoneNo}</span>
              </p>

              {devOtp && (
                <p className="text-sm text-blue-700 mt-2">
                  Testing OTP: <span className="font-bold">{devOtp}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name optional"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition-all focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Login Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition-all focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10"
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="display">Display</option>
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Testing ke liye role select kar sakte ho. Existing user ka role
                DB me jo saved hai wahi rahega.
              </p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6 digit OTP"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-center text-2xl tracking-[10px] outline-none transition-all focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP & Login"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("mobile");
                setOtp("");
                setDevOtp("");
              }}
              className="w-full rounded-2xl bg-slate-100 px-5 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Change Mobile Number
            </button>
          </form>
        )}

        {message && (
          <div className="mt-5 rounded-2xl bg-green-50 border border-green-100 p-3 text-green-700 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 border border-red-100 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPage;  