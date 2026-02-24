"use client";

import React, { useState } from "react";
import { useDisclosure } from "@nextui-org/react";
import UploadVideoModal from "./UploadVideoModal";
import { Upload } from "lucide-react";

interface UploadVideoButtonProps {
  userAddress: string;
}

function UploadVideoButton({ userAddress }: UploadVideoButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    // Trigger a refresh of the uploaded videos list if needed
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("uploaded-videos-refresh"));
    }
  };

  return (
    <>
      <button
        className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest px-6 py-1 rounded-full flex items-center gap-2"
        onClick={onOpen}
      >
        <Upload size={16} />
        Upload Video
      </button>
      <UploadVideoModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleSuccess}
        userAddress={userAddress}
      />
    </>
  );
}

export default UploadVideoButton;

