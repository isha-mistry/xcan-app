"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Mail, Globe, Heart, X, XIcon } from "lucide-react";
import Link from "next/link";
import { BsYoutube } from "react-icons/bs";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    // product: [
    //   { name: "Features", href: "#features" },
    //   { name: "Statistics", href: "#statistics" },
    //   { name: "Dashboard", href: "/dashboard" },
    // ],
    resources: [
      { name: "Documentation", href: "/doc" },
      { name: "Community", href: "#" },
      { name: "Support", href: "#" },
    ],
    // company: [
    //   { name: "About", href: "#" },
    //   { name: "Privacy", href: "#" },
    //   { name: "Terms", href: "#" },
    // ],
  };

  const socialLinks = [
    { name: "X", icon: FaXTwitter, href: "https://x.com/xcan_arbitrum", color: "hover:text-blue-400" },
    {name: "Youtube", icon: BsYoutube, href: "https://youtube.com/@xcan_arbitrum", color: "hover:text-blue-400" },
    { name: "Website", icon: Globe, href: "https://xcan.dev", color: "hover:text-blue-400" },
  ];

  return (
    <footer className="relative z-10 border-t border-white/10 bg-dark-primary">
      <div className="container mx-auto px-16 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-dark-text-primary mb-4">
              Xcan
            </h3>
            <p className="text-dark-text-secondary text-sm leading-relaxed max-w-xs">
              Your platform for meaningful expert sessions and lectures. Connect, learn, and grow with our community.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
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
                    className={`text-dark-text-secondary ${social.color} transition-colors duration-300`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-lg font-semibold text-dark-text-primary mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-dark-text-secondary hover:text-blue-shade-100 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-dark-text-secondary text-sm flex items-center gap-2">
              © {currentYear} Xcan. All rights reserved.
            </p>
            <p className="text-dark-text-secondary text-sm flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-500" /> for the community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
