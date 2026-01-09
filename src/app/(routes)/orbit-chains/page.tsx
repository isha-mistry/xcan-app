"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Link as LinkIcon,
  ExternalLink,
  Copy,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface OrbitChain {
  _id?: string;
  deploymentId: string;
  chainName: string;
  chainId: number;
  chainAddress: string;
  ownerAddress: string;
  batchPosterAddress: string;
  validatorAddress: string;
  userAddress: string;
  deploymentTxHash: string;
  confirmationTxHash: string;
  rpcUrl: string | null;
  explorerUrl: string | null;
  nodeConfigPath: string | null;
  status: string;
  parentChainId: number;
  parentChainRpc: string;
  nativeToken: string | null;
  metadata: {
    requestId: string;
    deployedAt: string;
  };
}

const OrbitChainsPage = () => {
  const [chains, setChains] = useState<OrbitChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchOrbitChains();
  }, []);

  const fetchOrbitChains = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orbit-chains");
      const data = await response.json();

      if (data.success) {
        setChains(data.data || []);
      } else {
        toast.error("Failed to fetch orbit chains");
      }
    } catch (error) {
      console.error("Error fetching orbit chains:", error);
      toast.error("Error fetching orbit chains");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      orbit_deployed: {
        color: "bg-green-shade-100/20 text-green-shade-100 border-green-shade-100/30",
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
      deploying: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: <Clock className="w-4 h-4" />,
      },
      failed: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: <XCircle className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status] || {
      color: "bg-dark-text-tertiary/20 text-dark-text-tertiary border-dark-text-tertiary/30",
      icon: <Clock className="w-4 h-4" />,
    };

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.icon}
        <span className="capitalize">{status.replace("_", " ")}</span>
      </div>
    );
  };

  const filteredChains = chains.filter((chain) => {
    const matchesSearch =
      chain.chainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.deploymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.chainAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.userAddress.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || chain.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = Array.from(new Set(chains.map((chain) => chain.status)));

  const [sortConfig, setSortConfig] = useState<{
    key: keyof OrbitChain | "metadata.deployedAt";
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (key: keyof OrbitChain | "metadata.deployedAt") => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedChains = useMemo(() => {
    let sorted = [...filteredChains];
    if (sortConfig) {
      sorted.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === "metadata.deployedAt") {
          aValue = new Date(a.metadata.deployedAt).getTime();
          bValue = new Date(b.metadata.deployedAt).getTime();
        } else {
          aValue = a[sortConfig.key as keyof OrbitChain];
          bValue = b[sortConfig.key as keyof OrbitChain];
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sorted;
  }, [filteredChains, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedChains.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedChains = sortedChains.slice(startIndex, endIndex);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const truncateAddress = (address: string, length: number = 8) => {
    if (address.length <= length * 2 + 2) return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  };

  // Calculate additional stats
  const stats = useMemo(() => {
    const deployed = chains.filter((c) => c.status === "orbit_deployed").length;
    const deploying = chains.filter((c) => c.status === "deploying").length;
    const failed = chains.filter((c) => c.status === "failed").length;

    // Unique users
    const uniqueUsers = new Set(chains.map((c) => c.userAddress)).size;

    // Recent deployments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentDeployments = chains.filter((c) => {
      try {
        return new Date(c.metadata.deployedAt) >= sevenDaysAgo;
      } catch {
        return false;
      }
    }).length;

    // This month deployments
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthDeployments = chains.filter((c) => {
      try {
        return new Date(c.metadata.deployedAt) >= thisMonthStart;
      } catch {
        return false;
      }
    }).length;

    return {
      deployed,
      deploying,
      failed,
      uniqueUsers,
      recentDeployments,
      thisMonthDeployments,
    };
  }, [chains]);

  return (
    <div className="min-h-screen  py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="mb-3">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 bg-clip-text text-transparent">
              Orbit Chains Dashboard
            </h1>
            <p className="text-dark-text-secondary text-sm md:text-base">
              View and manage all deployed Orbit chains
            </p>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 flex justify-center"
        >
          <div className="relative w-full max-w-2xl">
            <Search className="absolute z-10 left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-secondary" />
            <input
              type="text"
              placeholder="Search by chain name, deployment ID, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-dark-secondary/90 backdrop-blur-sm border border-white/20 rounded-xl text-dark-text-primary placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-shade-100/50 focus:border-blue-shade-100/30 transition-all shadow-sm hover:border-white/30"
            />
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Total Chains Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-dark-secondary/90 to-dark-tertiary/80 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-5 shadow-lg hover:shadow-xl transition-all overflow-hidden relative group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-shade-100/10 rounded-bl-full opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white opacity-80 border border-white/20">
                    <LinkIcon className="w-5 h-5 text-blue-shade-100" />
                  </div>
                  <div className="text-dark-text-secondary text-xs uppercase tracking-wider font-semibold">
                    Total Chains
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold color-white opacity-80">
                  {chains.length}
                </div>
              </div>
            </motion.div>

            {/* Deployed Chains Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-dark-secondary/90 to-dark-tertiary/80 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-5 shadow-lg hover:shadow-xl transition-all overflow-hidden relative group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-dark-text-secondary text-xs uppercase tracking-wider font-semibold">
                    Deployed
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                  {stats.deployed}
                </div>
              </div>
            </motion.div>

            {/* Unique Users Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-dark-secondary/90 to-dark-tertiary/80 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-5 shadow-lg hover:shadow-xl transition-all overflow-hidden relative group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-dark-text-secondary text-xs uppercase tracking-wider font-semibold">
                    Unique Users
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                  {stats.uniqueUsers}
                </div>
              </div>
            </motion.div>

            {/* This Month Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-dark-secondary/90 to-dark-tertiary/80 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-5 shadow-lg hover:shadow-xl transition-all overflow-hidden relative group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-dark-text-secondary text-xs uppercase tracking-wider font-semibold">
                    This Month
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                  {stats.thisMonthDeployments}
                </div>
              </div>
            </motion.div>

          </div>

        </motion.div>

        {/* Chains Table */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-dark-secondary/90 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden shadow-xl"
          >
            {/* Skeleton Header */}
            <div className="bg-gradient-to-r from-dark-tertiary/60 to-dark-tertiary/40 border-b border-white/20">
              <div className="px-6 py-4">
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-4 bg-white/10 rounded animate-pulse flex-1"
                      style={{ maxWidth: `${100 / 5}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Skeleton Rows */}
            <div className="divide-y divide-white/5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="px-6 py-5 animate-pulse">
                  <div className="flex gap-4 items-center">
                    <div className="h-4 bg-white/10 rounded flex-1" />
                    <div className="h-4 bg-white/10 rounded flex-1" />
                    <div className="h-4 bg-white/10 rounded flex-1" />
                    <div className="h-4 bg-white/10 rounded flex-1" />
                    <div className="h-4 bg-white/10 rounded flex-1" />
                  </div>
                  <div className="flex gap-10 items-center mt-2">
                    <div className="h-3 bg-white/5 rounded flex-1" />
                    <div className="h-3 bg-white/5 rounded flex-1" />
                    <div className="h-3 bg-white/5 rounded flex-1" />
                    <div className="h-3 bg-white/5 rounded flex-1" />
                    <div className="h-3 bg-white/5 rounded flex-1" />
                  </div>
                </div>
              ))}
            </div>

            {/* Loading Indicator */}
            {/* <div className="text-center py-12 border-t border-white/10">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute w-16 h-16 border-4 border-blue-shade-100/20 rounded-full" />
                <div className="absolute w-16 h-16 border-4 border-transparent border-t-blue-shade-100 rounded-full animate-spin" />

                <div className="absolute w-8 h-8 bg-blue-shade-100/30 rounded-full animate-pulse" />
                <div className="relative w-4 h-4 bg-blue-shade-100 rounded-full" />
              </div>
              <p className="mt-6 text-dark-text-secondary font-medium">
                Loading orbit chains...
              </p>
              <p className="mt-2 text-dark-text-tertiary text-sm">
                Please wait while we fetch the data
              </p>
            </div> */}
          </motion.div>
        ) : sortedChains.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-dark-secondary/90 backdrop-blur-sm border border-white/20 rounded-xl"
          >
            <div className="p-4 rounded-full bg-dark-tertiary/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-dark-text-tertiary" />
            </div>
            <p className="text-dark-text-primary text-lg font-medium mb-2">No orbit chains found</p>
            <p className="text-dark-text-secondary text-sm">
              {searchQuery ? "Try adjusting your search criteria" : "No chains have been deployed yet"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-dark-secondary/90 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden shadow-xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-dark-tertiary/60 to-dark-tertiary/40 border-b border-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("chainName")}
                        className="flex items-center gap-2 hover:text-dark-text-primary transition-colors group"
                      >
                        Chain Name
                        {sortConfig?.key === "chainName" ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-4 h-4 text-blue-shade-100" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-blue-shade-100" />
                          )
                        ) : (
                          <div className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity">
                            <ChevronUp className="w-4 h-4 text-dark-text-secondary" />
                          </div>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("chainId")}
                        className="flex items-center gap-2 hover:text-dark-text-primary transition-colors group"
                      >
                        Chain ID
                        {sortConfig?.key === "chainId" ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-4 h-4 text-blue-shade-100" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-blue-shade-100" />
                          )
                        ) : (
                          <div className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity">
                            <ChevronUp className="w-4 h-4 text-dark-text-secondary" />
                          </div>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">
                      Chain Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">
                      Deployment TX
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("metadata.deployedAt")}
                        className="flex items-center gap-2 hover:text-dark-text-primary transition-colors group"
                      >
                        Deployed At
                        {sortConfig?.key === "metadata.deployedAt" ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-4 h-4 text-blue-shade-100" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-blue-shade-100" />
                          )
                        ) : (
                          <div className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity">
                            <ChevronUp className="w-4 h-4 text-dark-text-secondary" />
                          </div>
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedChains.map((chain, index) => (
                    <React.Fragment key={chain.deploymentId}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        className="hover:bg-dark-tertiary/40 transition-all duration-200 group"
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-semibold text-dark-text-primary transition-colors">
                            {chain.chainName}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-dark-text-tertiary mt-1.5 font-mono">
                            <span>{truncateAddress(chain.userAddress)}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(chain.userAddress, "User Address");
                              }}
                              className="p-1 hover:bg-dark-tertiary rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="Copy address"
                            >
                              <Copy className="w-3 h-3 text-dark-text-secondary hover:text-blue-shade-100" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-dark-text-primary font-mono font-medium">
                            {chain.chainId}
                          </div>
                          <div className="text-xs text-dark-text-tertiary mt-1">
                            Parent: <span className="text-dark-text-secondary">{chain.parentChainId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-dark-text-primary font-mono">
                              {truncateAddress(chain.chainAddress)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(chain.chainAddress, "Chain Address");
                              }}
                              className="p-1 hover:bg-dark-tertiary rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="Copy address"
                            >
                              <Copy className="w-3.5 h-3.5 text-dark-text-secondary hover:text-blue-shade-100" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <Link
                            href={`https://sepolia.arbiscan.io/tx/${chain.deploymentTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm font-mono flex items-center gap-1.5 transition-colors group/link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="hover:underline">{truncateAddress(chain.deploymentTxHash)}</span>
                            <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                          </Link>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-dark-text-primary">
                            {formatDate(chain.metadata.deployedAt)}
                          </div>
                        </td>
                      </motion.tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/10 bg-dark-tertiary/30 flex items-center justify-between">
                <div className="text-sm text-dark-text-secondary">
                  Showing <span className="text-dark-text-primary font-semibold">{startIndex + 1}</span> to{" "}
                  <span className="text-dark-text-primary font-semibold">
                    {Math.min(endIndex, sortedChains.length)}
                  </span>{" "}
                  of <span className="text-dark-text-primary font-semibold">{sortedChains.length}</span> chains
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-dark-secondary/50 border border-white/10 text-dark-text-secondary hover:text-dark-text-primary hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                            ? "bg-blue-shade-100/20 text-blue-shade-100 border border-blue-shade-100/30"
                            : "bg-dark-secondary/50 text-dark-text-secondary border border-white/10 hover:border-white/20 hover:text-dark-text-primary"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-dark-secondary/50 border border-white/10 text-dark-text-secondary hover:text-dark-text-primary hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrbitChainsPage;

