import React, { useEffect, useState } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import { fetchApi } from "@/utils/api";
import toast from "react-hot-toast";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

interface DeleteOfficeHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hostAddress: string;
  slotId?: string;
}

const DELETE_REASONS = [
  "Schedule conflict",
  "No longer available",
  "Time slot rescheduled",
  "Other",
] as const;

type DeleteReason = (typeof DELETE_REASONS)[number];

const DeleteOfficeHoursModal: React.FC<DeleteOfficeHoursModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  hostAddress,
  slotId,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [selectedReason, setSelectedReason] = React.useState<DeleteReason | "">(
    ""
  );
  const [otherReason, setOtherReason] = React.useState("");
  const { address } = useAccount();
  const [isAuthorized, setIsAuthorized] = useState(true);
  const { authenticated } = usePrivy();

   useEffect(() => {
      if (address && hostAddress) {
        const authorized = address.toLowerCase() === hostAddress.toLowerCase();
        setIsAuthorized(authorized);
        
        if (!authorized) {
          toast.error("You are not authorized to delete this office hours slot");
        }
        
        if (!authenticated || !address) {
          toast.error("Please connect your wallet to delete this meeting");
        }
      }
    }, [address, hostAddress, authenticated]);

  const handleDelete = async () => {
    const finalReason =
      selectedReason === "Other" ? otherReason : selectedReason;

    setIsDeleting(true);
    try {
      if (!authenticated || !address) {
        toast.error("Please connect your wallet to delete this meeting");
        return null;
      }

      // Check if the current user is the host
      if (address.toLowerCase() !== hostAddress.toLowerCase()) {
        toast.error("You are not authorized to delete this office hours slot");
        return null;
      }
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(address && {
          "x-wallet-address": address,
          Authorization: `Bearer ${token}`,
        }),
      };
      const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify({
          host_address: hostAddress,
          reference_id: slotId,
          delete_reason: finalReason.trim(),
        }),
      };

      const result = await fetchApi(`/delete-office-hours`, requestOptions);

      if (!result.ok) {
        if (result.status === 401) {
          toast.error("Authentication required. Please connect your wallet.");
          return null;
        } else if (result.status === 403) {
          toast.error("You are not authorized to delete this office hours slot");
          return null;
        } else {
          throw new Error("Failed to delete meeting");
        }
      }

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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-2 0.2xs:mx-4 transform transition-all duration-200 scale-100 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
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
              Are you sure you want to delete this booked slot? This action
              cannot be undone.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="deleteReason"
              className="block text-sm font-medium text-gray-700"
            >
              Reason for deletion
            </label>
            <div className="relative">
              <select
                id="deleteReason"
                value={selectedReason}
                onChange={(e) =>
                  setSelectedReason(e.target.value as DeleteReason)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">Select a reason</option>
                {DELETE_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {selectedReason === "Other" && (
            <div className="space-y-2">
              <label
                htmlFor="otherReason"
                className="block text-sm font-medium text-gray-700"
              >
                Please specify
              </label>
              <textarea
                id="otherReason"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Please provide details for deletion"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 placeholder:text-gray-400"
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-center xs:justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting</span>
                </div>
              ) : (
                <span>Delete</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteOfficeHoursModal;
