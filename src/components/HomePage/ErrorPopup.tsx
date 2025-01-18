import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAccount } from "wagmi";

const ErrorPopup = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const { address } = useAccount();
  const path = usePathname();

  const handleCloseAndRedirect = () => {
    onClose();
    router.push(path + `profile/${address}?active=info`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Not a Delegate
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          You are not a delegate. To schedule availability and host sessions,
          become a delegate.
        </p>
        <button
          onClick={handleCloseAndRedirect}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg 
                   transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorPopup;
