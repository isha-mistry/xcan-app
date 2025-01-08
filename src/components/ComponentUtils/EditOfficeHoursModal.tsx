import React, { useState } from "react";
import { TimeSlot } from "@/types/OfficeHoursTypes";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { fetchApi } from "@/utils/api";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";

interface EditOfficeHoursModalProps {
  slot: TimeSlot;
  onClose: () => void;
  onUpdate: (updatedSlot: TimeSlot) => void;
  hostAddress: string;
  daoName: string;
}

const EditOfficeHoursModal: React.FC<EditOfficeHoursModalProps> = ({
  slot,
  onClose,
  onUpdate,
  hostAddress,
  daoName,
}) => {
  // Initialize state with the title from slot.title instead of slot.bookedTitle
  const [title, setTitle] = useState(slot.bookedTitle || "");
  const [description, setDescription] = useState(slot.bookedDescription || "");
  const [isLoading, setIsLoading] = useState(false);
  const { user, ready, getAccessToken, authenticated } = usePrivy();
  const { walletAddress } = useWalletAddress();
  // const { toast } = useToast();

  console.log("slot", slot);

  const updateMeeting = async () => {
    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${token}`,
        }),
      };

      const response = await fetchApi("/edit-office-hours", {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify({
          host_address: hostAddress,
          dao_name: daoName,
          reference_id: slot.reference_id,
          title,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update meeting");
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateMeeting();
      onUpdate({
        ...slot,
        bookedTitle: title,
        bookedDescription: description,
      });

      toast("Meeting updated successfully");

      onClose();
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast("Failed to update meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Booked Slot</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Time Slot</p>
            <p className="text-sm text-gray-600">
              {slot.startTime} - {slot.endTime}
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOfficeHoursModal;
