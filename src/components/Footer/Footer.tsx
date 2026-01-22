"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { BsYoutube } from "react-icons/bs";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "X", icon: FaXTwitter, href: "https://x.com/xcan_arbitrum" },
    { name: "Youtube", icon: BsYoutube, href: "https://youtube.com/@xcan_arbitrum" },
  ];

  return (
    <footer className="relative z-10 border-t border-white/5 bg-gradient-to-b from-slate-950 to-black">
      <div className="container mx-auto px-6 py-8">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand & Description */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                Xcan
              </h3>
              <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
                Your platform for meaningful expert sessions and lectures
              </p>
            </div>
            
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300"
                  aria-label={social.name}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
            <p>© {currentYear} Xcan. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for the community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;