import React, { useEffect, useRef, useState } from "react";
import { TimeSlot } from "@/types/OfficeHoursTypes";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { fetchApi } from "@/utils/api";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { LuDot } from "react-icons/lu";
import { CgAttachment } from "react-icons/cg";
import { LIGHTHOUSE_BASE_API_KEY } from "@/config/constants";
import lighthouse from "@lighthouse-web3/sdk";
import Image from "next/image";

interface EditOfficeHoursModalProps {
  slot: TimeSlot;
  date: Date;
  onClose: () => void;
  onUpdate: (updatedSlot: TimeSlot) => void;
  hostAddress: string;
  daoName: string;
}

const EditOfficeHoursModal: React.FC<EditOfficeHoursModalProps> = ({
  slot,
  date,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(slot.thumbnail_image !== undefined ? slot.thumbnail_image : null);
  const [isAuthorized, setIsAuthorized] = useState(true);


  useEffect(() => {
    if (walletAddress && hostAddress) {
      const authorized = walletAddress.toLowerCase() === hostAddress.toLowerCase();
      setIsAuthorized(authorized);
      
      if (!authorized) {
        toast.error("You are not authorized to edit this office hours slot");
      }
      
      if (!authenticated || !walletAddress) {
        toast.error("Please connect your wallet to edit this meeting");
      }
    }
  }, [walletAddress, hostAddress, authenticated]);
  
  const updateMeeting = async () => {
    try {

      if (!authenticated || !walletAddress) {
        toast.error("Please connect your wallet to edit this meeting");
        return null;
      }

      // Check if the current user is the host
      if (walletAddress.toLowerCase() !== hostAddress.toLowerCase()) {
        toast.error("You are not authorized to edit this office hours slot");
        return null;
      }
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
          thumbnail_image:thumbnailImage
        }),
      });

      
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          toast.error("Authentication required. Please connect your wallet.");
          return null;
        } else if (response.status === 403) {
          toast.error("You are not authorized to edit this office hours slot");
          return null;
        } else {
          throw new Error(data.error || "Failed to update meeting");
        }
      }
      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      toast.error("You are not authorized to edit this office hours slot");
      return;
    }
    
    if (!authenticated || !walletAddress) {
      toast.error("Please connect your wallet to edit this meeting");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateMeeting();
      
      // If updateMeeting returned null, it means an auth error was displayed
      if (!result) {
        setIsLoading(false);
        return;
      }
      onUpdate({
        ...slot,
        bookedTitle: title,
        bookedDescription: description,
        thumbnail_image: thumbnailImage !== null ? thumbnailImage : ""
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

  const handleChange = async (selectedImage: any) => {
    if (!isAuthorized) {
      toast.error("You are not authorized to edit this office hours slot");
      return;
    }
      const apiKey = LIGHTHOUSE_BASE_API_KEY ? LIGHTHOUSE_BASE_API_KEY : "";
      if (selectedImage) {
        setIsLoading(true);
        try {
        const output = await lighthouse.upload([selectedImage], apiKey);
        const imageCid = output.data.Hash;
        setThumbnailImage(imageCid); 
        }catch(error:any){
          setThumbnailImage(slot.thumbnail_image !== undefined ? slot.thumbnail_image : null)
          console.log(error, "error response")
        }finally{
          setIsLoading(false)
        }
      }else{
        setThumbnailImage(slot.thumbnail_image !== undefined ? slot.thumbnail_image : null)
      }
    };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md transform transition-all duration-200 ease-out scale-100 mx-2 0.2xs:mx-4 ">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Edit Booked Slot
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Update Image
              </label>
              <div className="flex gap-3 items-end">
                <div className="w-40 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  {thumbnailImage ? (
                              <Image
                                src={`https://gateway.lighthouse.storage/ipfs/${thumbnailImage}`}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-md"
                                width={100}
                                height={100}
                              />
                            ) : (
                  <div className="text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  )} 
                </div>
                <div className="flex bg-[#EEF8FF] items-center gap-6 rounded-lg p-3">
                  <label className="bg-[#EEF8FF]  text-blue-shade-100 font-medium text-sm py-3 px-4 rounded-full border cursor-pointer border-blue-shade-100 cursor-point flex gap-2 items-center ">
                    <CgAttachment />
                    <span>Upload Image</span>
                    <input
                       type="file"
                      name="image"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handleChange(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm 0.2xs:text-base px-2 0.2xs:px-4 py-2 0.2xs:py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                required
                disabled={isLoading}
                placeholder="Enter meeting title"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full text-sm 0.2xs:text-base px-2 0.2xs:px-4 py-2 0.2xs:py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out resize-none"
                disabled={isLoading}
                placeholder="Enter meeting description"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-1">
              <p className="text-sm font-semibold text-gray-700">Time Slot</p>
              <p className="flex items-center text-xs 0.2xs:text-sm text-gray-600">
                {slot.startTime} - {slot.endTime}
                <LuDot />{" "}
                <span className="font-semibold">
                  {date.toLocaleDateString("en-GB")}
                </span>
              </p>
            </div>
          </div>

          <div className="flex justify-center xs:justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </span>
              ) : (
                "Update"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOfficeHoursModal;