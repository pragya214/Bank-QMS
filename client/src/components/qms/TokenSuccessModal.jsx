import { useNavigate } from "react-router-dom";
import { CheckCircle2, Sparkles, X } from "lucide-react";

function TokenSuccessModal({ open, onClose, tokenData }) {
  const navigate = useNavigate();

  if (!open || !tokenData) return null;

  const token = tokenData?.token || tokenData;
  const tokenNumber = token?.token_number || tokenData?.token_number;
  const phone = token?.phone || tokenData?.phone;
  const branchName = tokenData?.branch_name || token?.branch_name || "Branch";
  const serviceName =
    tokenData?.service_name || token?.service_name || "Selected Service";

  const handleTrack = () => {
    navigate(
      `/customer/token-status?phone=${phone || ""}&tokenNumber=${
        tokenNumber || ""
      }`
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-[34px] bg-white p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,0.35)] animate-[tokenPop_.35s_ease-out]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
        >
          <X size={18} />
        </button>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-8 top-8 text-yellow-400 animate-[sparkleFloat_1.5s_ease-in-out_infinite]">
            ✨
          </div>
          <div className="absolute right-10 top-16 text-pink-400 animate-[sparkleFloat_1.8s_ease-in-out_infinite]">
            🎉
          </div>
          <div className="absolute bottom-20 left-12 text-blue-400 animate-[sparkleFloat_2s_ease-in-out_infinite]">
            ✨
          </div>
          <div className="absolute bottom-12 right-14 text-green-400 animate-[sparkleFloat_1.6s_ease-in-out_infinite]">
            🎊
          </div>
        </div>

        <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[28px] bg-green-50 text-green-600 shadow-lg shadow-green-500/20 animate-[successBump_.55s_ease-out]">
          <CheckCircle2 size={56} />
        </div>

        <div className="relative">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-2 text-sm font-bold text-yellow-700">
            <Sparkles size={16} />
            Token Generated Successfully
          </div>

          <h2 className="text-3xl font-black text-slate-900">
            Your Token Number
          </h2>

          <div className="mx-auto mt-5 flex h-32 w-32 items-center justify-center rounded-[34px] bg-gradient-to-br from-[#5777B2] to-[#11274D] text-white shadow-[0_20px_60px_rgba(87,119,178,0.4)] animate-[tokenPulse_1.5s_ease-in-out_infinite]">
            <span className="text-6xl font-black">{tokenNumber || "--"}</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-400">
                Branch
              </p>
              <p className="mt-1 font-bold text-slate-900">{branchName}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-400">
                Service
              </p>
              <p className="mt-1 font-bold text-slate-900">{serviceName}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-400">
                Mobile
              </p>
              <p className="mt-1 font-bold text-slate-900">{phone || "-"}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-400">
                Time
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {tokenData?.time || new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          <button
            onClick={handleTrack}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-4 font-black text-white shadow-lg shadow-green-500/25 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Track My Token
          </button>

          <button
            onClick={onClose}
            className="mt-3 w-full rounded-2xl bg-slate-100 px-5 py-3.5 font-bold text-slate-700 transition hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TokenSuccessModal;