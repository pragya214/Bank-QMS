import BlurModal from "./BlurModal";

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure?",
}) {
  return (
    <BlurModal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-3 text-slate-600">{description}</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="w-1/2 rounded-2xl bg-gray-200 px-5 py-3 font-semibold text-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="w-1/2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </BlurModal>
  );
}

export default ConfirmModal;