"use client";

import React, { useState, useEffect, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import { fetchApi } from "@/utils/api";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { getAccessToken } from "@privy-io/react-auth";

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userAddress: string;
}

function UploadVideoModal({
  isOpen,
  onClose,
  onSuccess,
  userAddress,
}: UploadVideoModalProps) {
  const [videoLink, setVideoLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setVideoLink("");
      onClose();
    }
  }, [isLoading, onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isLoading, handleClose]);


  const handleSubmit = async () => {
    const token = await getAccessToken();

    if (!videoLink.trim()) {
      toast.error("Please enter a video link");
      return;
    }

    // Basic YouTube URL validation
    const youtubePattern =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubePattern.test(videoLink)) {
      toast.error("Please enter a valid YouTube link");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetchApi("/upload-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": userAddress,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          video_link: videoLink.trim(),
          user_address: userAddress,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload video");
      }

      toast.success("Video uploaded successfully!");
      setVideoLink("");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error uploading video:", error);
      toast.error(error.message || "Failed to upload video");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center font-robotoMono"
      onClick={handleBackdropClick}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="flex flex-col bg-blue-shade-500 text-white border border-blue-shade-200 rounded-3xl max-h-[90vh] w-full max-w-lg mx-4 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between text-xl font-semibold items-center bg-blue-shade-500 text-white px-6 py-4 border-b border-blue-shade-200">
          <h2>Upload Video</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-white bg-blue-shade-300 w-6 h-6 rounded-full flex items-center justify-center font-semibold hover:bg-blue-shade-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoClose className="font-bold size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 bg-blue-shade-500 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-200">
                Paste YouTube Video Link:
              </label>
              <input
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full border border-blue-shade-200 mt-2 bg-blue-shade-400 rounded-lg px-4 py-3 text-sm text-gray-100 font-normal placeholder-gray-400 focus:border-blue-300 focus:outline-none transition-colors"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading && videoLink.trim()) {
                    handleSubmit();
                  }
                }}
              />
              <p className="text-xs text-gray-400 mt-2">
                Enter a valid YouTube video URL
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center bg-blue-shade-500 border-t border-blue-shade-200 px-6 py-4">
          <button
            className="bg-blue-shade-300 hover:bg-blue-shade-400 rounded-full text-sm font-semibold text-white px-6 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-semibold text-white px-6 py-2 transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isLoading || !videoLink.trim()}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Oval
                  height={16}
                  width={16}
                  color="#fff"
                  visible={true}
                  ariaLabel="loading"
                  secondaryColor="#fff"
                  strokeWidth={4}
                  strokeWidthSecondary={4}
                />
                <span>Uploading...</span>
              </div>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadVideoModal;

