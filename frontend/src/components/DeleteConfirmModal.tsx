import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Expense',
  description = 'This expense will be removed from your records.',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      showCloseButton={false}
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className="w-12 h-12 rounded-full bg-red-100 text-danger flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-ink">{title}</h3>
        <p className="text-sm text-muted mt-1.5">{description}</p>

        <div className="grid grid-cols-2 gap-3 w-full mt-6 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
