"use client";

import React, { useState, useEffect, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import { Upload } from "lucide-react";
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
      className="fixed inset-0 z-[100] flex items-center justify-center font-robotoMono p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with enhanced blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal Container */}
      <div
        className="relative flex flex-col w-full max-w-lg overflow-hidden glass-container rounded-[2rem] border border-white/10 shadow-2xl animate-slide-down"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, rgba(13, 26, 52, 0.9) 0%, rgba(2, 5, 46, 0.95) 100%)",
        }}
      >
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 relative z-10">
          <h2 className="text-2xl font-unbounded font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Upload Video
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 disabled:opacity-50"
          >
            <IoClose className="text-xl text-white/70 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-8 relative z-10">
          <div className="space-y-6">
            <div className="group">
              <label className="text-xs font-unbounded font-medium mb-3 block text-blue-400/80 uppercase tracking-widest transition-colors group-focus-within:text-blue-400">
                YouTube Video Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none transition-all duration-300"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isLoading && videoLink.trim()) {
                      handleSubmit();
                    }
                  }}
                />
                <div className="absolute inset-0 rounded-2xl border border-blue-500/0 group-focus-within:border-blue-500/20 pointer-events-none transition-all duration-300" />
              </div>
              <p className="text-[10px] text-white/30 mt-3 flex items-center gap-1.5 ml-1">
                <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                Provide a valid link to import your content
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center px-8 py-6 border-t border-white/5 gap-4 relative z-10 bg-black/20">
          <button
            className="px-6 py-2.5 rounded-xl text-sm font-unbounded font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            className="relative group px-8 py-2.5 rounded-xl text-sm font-unbounded font-bold text-white overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            onClick={handleSubmit}
            disabled={isLoading || !videoLink.trim()}
          >
            {/* Button Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-500 group-hover:to-indigo-500 transition-all duration-300" />

            <div className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Oval
                    height={16}
                    width={16}
                    color="#fff"
                    visible={true}
                    ariaLabel="loading"
                    secondaryColor="rgba(255,255,255,0.3)"
                    strokeWidth={5}
                  />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Upload Now</span>
                  <Upload size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadVideoModal;

