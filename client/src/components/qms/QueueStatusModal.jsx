import BlurModal from "../common/BlurModal";

function QueueStatusModal({ open, onClose, queueData }) {
  return (
    <BlurModal open={open} onClose={onClose} maxWidth="max-w-lg">
      <h2 className="text-2xl font-bold text-slate-900">Queue Status</h2>
      <p className="mt-1 text-slate-600">
        Live queue details for the selected token.
      </p>

      <div className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-5">
        <div>
          <p className="text-sm text-slate-500">Current Token</p>
          <p className="text-2xl font-bold text-slate-900">
            {queueData?.token?.token_number || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Waiting Tokens</p>
          <p className="text-xl font-semibold text-slate-900">
            {queueData?.people_ahead ?? 0}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Estimated Time</p>
          <p className="text-xl font-semibold text-slate-900">
            {queueData?.estimated_wait_minutes ?? 0} min
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-6 w-full rounded-2xl bg-[#5777B2] px-5 py-3 font-semibold text-white"
      >
        Close
      </button>
    </BlurModal>
  );
}

export default QueueStatusModal;