import BlurModal from "../common/BlurModal";

function CallNextModal({ open, onClose, token }) {
  return (
    <BlurModal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Next Token Called
        </h2>
        <p className="mt-2 text-slate-600">
          Please direct the customer to the assigned counter.
        </p>

        <div className="mt-6 rounded-3xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Token Number</p>
          <p className="text-4xl font-bold text-[#5777B2]">
            {token?.token_number || "-"}
          </p>

          <p className="mt-4 text-sm text-slate-500">Counter Number</p>
          <p className="text-xl font-semibold text-slate-900">
            {token?.counter_id || "Assigned"}
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-[#5777B2] px-5 py-3 font-semibold text-white"
        >
          Done
        </button>
      </div>
    </BlurModal>
  );
}

export default CallNextModal;