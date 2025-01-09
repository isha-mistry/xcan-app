import React from "react";
import { X, Loader2 } from "lucide-react";
import { fetchApi } from "@/utils/api";
import toast from "react-hot-toast";
import { getAccessToken } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";

interface DeleteOfficeHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hostAddress: string;
  daoName: string;
  slotId?: string;
}

const DeleteOfficeHoursModal: React.FC<DeleteOfficeHoursModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  hostAddress,
  daoName,
  slotId,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { walletAddress } = useWalletAddress();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${token}`,
        }),
      };
      const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        body: JSON.stringify({
          host_address: hostAddress,
          dao_name: daoName,
          reference_id: slotId,
        }),
      };

      const result = await fetchApi(`/edit-office-hours`, requestOptions);

      if (result.ok) {
        toast.success("Time slot deleted successfully");
        onSuccess();
        onClose();
      } else {
        throw new Error("Failed to delete time slot");
      }
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast.error("Failed to delete time slot. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isDeleting ? "Deleting..." : "Confirm Deletion"}
          </h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={`text-gray-500 transition-colors ${
              isDeleting
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-gray-700"
            }`}
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          {isDeleting
            ? "Deleting time slot... Please wait."
            : "Are you sure you want to delete this booked slot? This action cannot be undone."}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium transition-all
              ${
                isDeleting
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
              text-white transition-all flex items-center justify-center min-w-[80px] space-x-2
              ${
                isDeleting
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteOfficeHoursModal;
