'use client';

import { Pencil, Trash2 } from 'lucide-react';

interface EditButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

interface DeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

export function EditButton({ onClick, disabled, title = 'Edit' }: EditButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-1.5 text-gray-400 hover:text-[#2d6a4f] hover:bg-[#2d6a4f]/8 rounded-lg transition-colors disabled:opacity-40"
    >
      <Pencil className="w-3.5 h-3.5" />
    </button>
  );
}

export function DeleteButton({ onClick, disabled, title = 'Delete' }: DeleteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

export function ActionButtons({
  onEdit,
  onDelete,
  disabled,
}: {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <EditButton onClick={onEdit} disabled={disabled} />
      <DeleteButton onClick={onDelete} disabled={disabled} />
    </div>
  );
}
