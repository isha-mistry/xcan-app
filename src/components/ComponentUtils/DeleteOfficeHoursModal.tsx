import React from "react";
import { X } from "lucide-react";

interface DeleteOfficeHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteOfficeHoursModal: React.FC<DeleteOfficeHoursModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-2 0.2xs:mx-4 transform transition-all duration-200 scale-100 animate-in zoom-in-95">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Confirm Deletion
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="bg-red-50 rounded-xl text-sm 0.2xs:text-base p-3 0.2xs:p-4 border border-red-100">
          <p className="text-gray-600 leading-relaxed">
            Are you sure you want to delete this booked slot? This action cannot
            be undone.
          </p>
        </div>

        <div className="flex justify-center xs:justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 active:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default DeleteOfficeHoursModal;
