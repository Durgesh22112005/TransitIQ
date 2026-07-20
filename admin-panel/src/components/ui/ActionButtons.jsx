import { Edit2, Trash2 } from 'lucide-react';

export default function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="btn-ghost btn-sm p-1.5" title="Edit">
          <Edit2 className="w-4 h-4 text-gray-500" />
        </button>
      )}
      {onDelete && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="btn-ghost btn-sm p-1.5" title="Delete">
          <Trash2 className="w-4 h-4 text-danger-500" />
        </button>
      )}
    </div>
  );
}
