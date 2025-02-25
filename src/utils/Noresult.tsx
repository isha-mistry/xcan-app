"use client"

import { useState } from "react"
import { Search, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

export default function NoResultsFound() {
  const [isSpinning, setIsSpinning] = useState(false)

  const handleRefresh = () => {
    setIsSpinning(true);
    // Refresh the page after showing the spin animation for a moment
    setTimeout(() => {
      window.location.reload();
    }, 500); // Half second delay to show the spin animation
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center p-4"
    >
      <motion.div
        className="mb-8 relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Search className="w-24 h-24 text-gray-300" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        ></motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold mb-2 text-gray-800"
      >
        It&apos;s Empty Here
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-6 max-w-md"
      >
        No such result available!
      </motion.p>
      <motion.button
        onClick={handleRefresh}
        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <RefreshCw className={`w-5 h-5 mr-2 ${isSpinning ? "animate-spin" : ""}`} />
        Refresh
      </motion.button>
    </motion.div>
  )
}

