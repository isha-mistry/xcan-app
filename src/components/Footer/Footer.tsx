"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Link from "next/link";
import { BsYoutube } from "react-icons/bs";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "X", icon: FaXTwitter, href: "https://x.com/xcan_arbitrum" },
    { name: "Youtube", icon: BsYoutube, href: "https://youtube.com/@xcan_arbitrum" },
  ];

  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#07090D] backdrop-blur-3xl overflow-hidden pt-12">
      {/* Technical Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-6 pb-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          {/* Brand & Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className="relative group">
              <h3 className="text-2xl font-black text-white font-unbounded tracking-tighter uppercase transition-all duration-300 group-hover:tracking-normal">
                Xcan
              </h3>
              <div className="w-8 h-1 bg-primary mt-1 rounded-full group-hover:w-16 transition-all duration-300" />
            </div>
            <p className="text-white/40 text-xs max-w-xs leading-relaxed font-robotoMono font-medium">
              Your platform for meaningful expert sessions and lectures
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -4, backgroundColor: "rgba(255,255,255,0.08)" }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-primary/50 transition-all duration-300 shadow-xl backdrop-blur-xl group"
                  aria-label={social.name}
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-12 pt-8 font-robotoMono">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
            <p>© {currentYear} Xcan. All rights reserved.</p>
            <p className="flex items-center gap-2 group cursor-default">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 group-hover:scale-125 transition-transform" /> by <Link href="https://lamprosdao.com/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white hover:border-primary/50 transition-all duration-300 text-sm shadow-xl backdrop-blur-xl group">Lampros DAO</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;