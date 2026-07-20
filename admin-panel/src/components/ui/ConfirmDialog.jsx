import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Delete', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-14 h-14 rounded-full bg-danger-50 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-danger-500" />
        </div>
        <p className="text-gray-600 text-sm">{message}</p>
        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} className="btn-danger" disabled={loading}>
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
