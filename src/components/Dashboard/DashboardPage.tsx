"use client"

import React, { useState, useEffect } from 'react';
import { DashboardResponse, DashboardUser } from './DashboardTypes';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Award,
  Link as LinkIcon,
  Search,
  X,
  Copy,
  Github,
  Twitter,
  MessageSquare,
  Send,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';

// Social Media Icons Mapping
const SocialIcon = ({ platform, className = "w-4 h-4" }: { platform: string, className?: string }) => {
  switch (platform) {
    case 'github': return <Github className={className} />;
    case 'twitter': return <Twitter className={className} />;
    case 'discord': return <MessageSquare className={className} />;
    case 'telegram': return <Send className={className} />;
    default: return null;
  }
};

// Enhanced Status Badge
const StatusBadge: React.FC<{ hasNFT: boolean; totalMinted?: number }> = ({ hasNFT, totalMinted }) => {
  if (!hasNFT) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/5 text-white/40 border border-white/10 backdrop-blur-md">
        Not Minted
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-green-500/10 text-green-400 border border-green-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.1)]">
      <div className="w-1.5 h-1.5 rounded-full mr-2 bg-green-400 animate-pulse" />
      {totalMinted} {totalMinted === 1 ? 'NFT' : 'NFTs'}
    </div>
  );
};

// Premium Stats Card
const StatsCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  delay: number;
}> = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative group overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}/10 blur-3xl group-hover:bg-${color}/20 transition-all duration-500`} />

    <div className="glass-container p-6 rounded-2xl relative z-10 hover:border-white/20 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-1 font-unbounded">{title}</p>
          <h3 className="text-3xl font-black text-white font-unbounded tracking-tighter">
            {value.toLocaleString()}
          </h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}/20 to-${color}/5 border border-${color}/20 text-white`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const [users, setUsers] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 15;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard`);
      const data = await response.json();
      if (data.success) {
        setUsers(data);
      } else {
        setError('Failed to fetch user directory');
      }
    } catch (err) {
      setError('Failed to fetch members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address encrypted & copied', {
      style: {
        background: '#0D1527',
        color: '#ffffff',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        fontFamily: 'var(--font-unbounded)'
      }
    });
  };

  const filteredUsers = users?.data?.filter(user =>
    user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.socialHandles?.githubUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nftData?.githubUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Stats calculation
  const totalUsers = users?.count || 0;
  const totalNFTs = users?.totalNftsMinted || 0;
  const socialReach = users?.usersWithSocials || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-shade-100/10 blur-[120px] animate-pulse" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mb-6" />
          <h2 className="text-white font-unbounded text-sm font-bold tracking-[0.3em] uppercase">Synchronizing Data</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative selection:bg-blue-500/30">
      {/* Background Ambience & Technical Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Technical Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-shade-100/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl md:text-6xl font-black text-white font-unbounded tracking-tighter mb-4">
            MEMBERS OVERVIEW
          </h1>
          <p className="text-white/40 max-w-xl mx-auto font-medium text-balance">
            Comprehensive overview of all registered users, their social connections, and NFTs claimed
          </p>
        </motion.div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatsCard title="Total Users" value={totalUsers} icon={Users} color="blue-shade-100" delay={0.1} />
          <StatsCard title="NFTs Claimed" value={totalNFTs} icon={Award} color="green-400" delay={0.2} />
          <StatsCard title="Socials Connected" value={socialReach} icon={LinkIcon} color="purple-400" delay={0.3} />
        </div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-white/30 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by wallet address or GitHub username"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-4 flex items-center text-white/20 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Directory Grid/Table */}
        <div className="glass-container rounded-3xl overflow-hidden border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-unbounded">Wallet Address</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-unbounded text-center">Social Connections</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-unbounded text-right">NFTs Minted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <AnimatePresence mode="popLayout">
                  {currentUsers.map((user, idx) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center group-hover:border-blue-500/30 group-hover:bg-blue-500/5 transition-all">
                            <Database className="w-5 h-5 text-white/40 group-hover:text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-robotoMono text-sm font-bold group-hover:text-blue-400 transition-colors">
                                {user.address.slice(0, 8)}...{user.address.slice(-6)}
                              </span>
                              <button
                                onClick={() => copyToClipboard(user.address)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-all"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-2">
                          {Object.entries(user.connectedSocials).map(([key, isConnected]) => {
                            if (!isConnected) return null;
                            const handle = user.socialHandles[key === 'github' ? 'githubUsername' : `${key}Username` as keyof typeof user.socialHandles];
                            return (
                              <a
                                key={key}
                                href={`https://${key === 'twitter' ? 'x.com' : key + '.com'}/${handle}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/[0.08] transition-all"
                                title={`${key}: ${handle}`}
                              >
                                <SocialIcon platform={key} />
                              </a>
                            );
                          })}
                          {!Object.values(user.connectedSocials).some(v => v) && (
                            <span className="text-[10px] text-white/10 italic font-medium">No External Links</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <StatusBadge hasNFT={user.totalNftsMinted > 0} totalMinted={user.totalNftsMinted} />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 border-t border-white/[0.08] bg-black/20">
            <p className="text-xs font-bold text-white/30 tracking-widest uppercase font-unbounded">
              Showing <span className="text-white">{indexOfFirstUser + 1}</span> — <span className="text-white">{Math.min(indexOfLastUser, filteredUsers.length)}</span> out of {filteredUsers.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-white/10 text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-xl p-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage <= 3 ? i + 1 :
                    currentPage >= totalPages - 2 ? totalPages - 4 + i :
                      currentPage - 2 + i;
                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`min-w-[40px] h-10 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                        ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-white/10 text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
              <Database className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-xl font-bold text-white font-unbounded mb-2">Null Result Returned</h3>
            <p className="text-white/30 max-w-xs mx-auto">No users found matching your search criteria.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-8 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-blue-300 transition-colors"
            >
              Clear Query
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
