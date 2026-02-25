import React, { useEffect, useState } from "react";
import Image from "next/image";
import { BsDiscord } from "react-icons/bs";
import { CgAttachment } from "react-icons/cg";
import { FaUserEdit } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { TbBrandGithubFilled } from "react-icons/tb";
import { RiTelegram2Fill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData: {
    displayName: string;
    emailId: string;
    twitter: string;
    telegram: string;
    discord: string;
    github: string;
    displayImage: string;
  };
  handleInputChange: (field: string, value: string) => void;
  uploadImage: (files: FileList | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isLoading: boolean;
  handleSave: () => void;
  handleToggle: () => void;
  isToggled: boolean;
}

function UpdateProfileModal({
  isOpen,
  onClose,
  modalData,
  handleInputChange,
  uploadImage,
  fileInputRef,
  isLoading,
  handleSave,
}: ProfileModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mediaQuery = window.matchMedia("(max-width: 640px)");
      setIsMobile(mediaQuery.matches);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener("resize", checkIsMobile);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center font-robotoMono">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 0 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full h-[90vh] sm:h-auto sm:max-w-xl bg-gray-800 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden max-h-screen sm:max-h-[90vh] z-10"
          >
            {/* Header */}
            <div className="flex justify-between text-xl xs:text-2xl font-semibold items-center bg-blue-600 text-white px-6 sm:px-8 py-5 sm:py-6 shrink-0">
              Update your Profile
              <button
                onClick={onClose}
                className="text-blue-600 bg-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                <IoClose className="font-bold size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 sm:px-10 pb-6 pt-6 overflow-y-auto flex-grow bg-gray-800 scrollbar-hide">
              <div className="mb-6">
                <div className="text-sm font-semibold mb-3 text-gray-200">
                  Upload Profile Image:
                </div>
                <div className="flex flex-col xs:flex-row items-center gap-4">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-700 rounded-2xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden border border-gray-600">
                    {modalData.displayImage ? (
                      <Image
                        src={`https://gateway.lighthouse.storage/ipfs/${modalData.displayImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        width={112}
                        height={112}
                        priority={true}
                      />
                    ) : (
                      <div className="text-gray-500">
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
                  <div className="flex flex-col items-center xs:items-start text-center xs:text-left">
                    <p className="text-xs text-gray-400 mb-3 max-w-[200px]">
                      Please upload square image, size less than 100KB
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="bg-gray-700/50 text-blue-400 font-medium text-sm py-2.5 px-5 rounded-full border cursor-pointer border-blue-400/50 hover:bg-gray-700 hover:border-blue-400 transition-all flex gap-2 items-center">
                        <CgAttachment className="text-lg" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => uploadImage(e.target.files)}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-gray-500 truncate max-w-[150px]">
                        {fileInputRef.current?.files?.[0]?.name || "No File Chosen"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex flex-col w-full">
                  <div className="font-semibold text-sm flex px-1 items-center gap-2 text-gray-300">
                    <FaUserEdit className="text-blue-400" /> Display name:
                  </div>
                  <input
                    type="text"
                    value={modalData.displayName}
                    placeholder="Enter Name"
                    className="mt-2 bg-gray-700/40 border border-gray-600 text-gray-100 rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold flex px-1 items-center gap-2 text-gray-300">
                      <FaXTwitter className="text-gray-400" /> Twitter:
                    </div>
                    <input
                      type="url"
                      value={modalData.twitter}
                      placeholder="Enter Twitter Username"
                      className="mt-2 bg-gray-700/40 border border-gray-600 text-gray-100 rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                      onChange={(e) => handleInputChange("twitter", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold flex px-1 items-center gap-2 text-gray-300">
                      <RiTelegram2Fill className="text-blue-400" /> Telegram:
                    </div>
                    <input
                      type="url"
                      value={modalData.telegram}
                      placeholder="Enter Telegram Username"
                      className="mt-2 bg-gray-700/40 border border-gray-600 text-gray-100 rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                      onChange={(e) => handleInputChange("telegram", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold flex px-1 items-center gap-2 text-gray-300">
                      <BsDiscord className="text-indigo-400" /> Discord:
                    </div>
                    <input
                      type="url"
                      value={modalData.discord}
                      placeholder="Enter Discord Username"
                      className="mt-2 bg-gray-700/40 border border-gray-600 text-gray-100 rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                      onChange={(e) => handleInputChange("discord", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold flex px-1 items-center gap-2 text-gray-300">
                      <TbBrandGithubFilled className="text-gray-100" /> Github:
                    </div>
                    <input
                      type="url"
                      value={modalData.github}
                      placeholder="Enter Github Username"
                      className="mt-2 bg-gray-700/40 border border-gray-600 text-gray-100 rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                      onChange={(e) => handleInputChange("github", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-6 flex justify-center bg-gray-800 shrink-0 border-t border-gray-700/50">
              <button
                className="w-full sm:w-auto min-w-[160px] bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-full py-3.5 px-10 text-base font-semibold text-white transition-all shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none"
                onClick={() => handleSave()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default UpdateProfileModal;
