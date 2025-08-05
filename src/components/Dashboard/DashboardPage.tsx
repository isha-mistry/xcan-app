"use client"

import React, { useState, useEffect } from 'react';
import { DashboardUser } from './DashboardTypes';
import { toast } from 'react-hot-toast';

// Social Media Icons Component
const SocialIcon: React.FC<{ platform: string; className?: string }> = ({ platform, className = "w-6 h-6" }) => {
  const icons = {
    github: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    twitter: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    discord: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
    telegram: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    )
  };

  return icons[platform as keyof typeof icons] || null;
};

// Compact Status Badge Component
const StatusBadge: React.FC<{ hasNFT: boolean; totalMinted?: number }> = ({ hasNFT, totalMinted }) => {
  if (!hasNFT) {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-shade-200/20 text-dark-text-secondary border border-blue-shade-200/30">
        <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-blue-shade-200" />
        Pending
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-shade-100/20 text-green-shade-100 border border-green-shade-100/30">
      <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-green-shade-100" />
      {totalMinted} NFT{totalMinted && totalMinted > 1 ? 's' : ''}
    </div>
  );
};

// Compact NFT Levels Display Component
const NFTLevelsDisplay: React.FC<{ nftData: any; totalMinted: number }> = ({ nftData, totalMinted }) => {
  if (!nftData || !nftData.mintedLevels || nftData.mintedLevels.length === 0) {
    return (
      <div className="flex items-center justify-start py-2">
        <span className="text-dark-text-tertiary text-xs italic">No NFTs claimed</span>
      </div>
    );
  }

  // Sort completed levels by level number
  const completedLevels = nftData.mintedLevels.sort((a: any, b: any) => a.level - b.level);

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-dark-text-secondary mr-2">{totalMinted}/7</span>
      <div className="flex gap-0.5">
        {completedLevels.map((levelData: any) => (
          <div
            key={levelData.level}
            className="w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all duration-200 bg-green-shade-100/20 border-green-shade-100 text-green-shade-100 hover:bg-green-shade-100/30"
            title={`Level ${levelData.level}: ${levelData.levelName} - Click to view transaction`}
            onClick={() => {
              window.open(`https://sepolia.arbiscan.io/tx/${levelData.transactionHash}`, '_blank');
            }}
          >
            <span className="text-xs font-medium">{levelData.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Social Links Component
const SocialLinks: React.FC<{ socialHandles: any; connectedSocials: any }> = ({ socialHandles, connectedSocials }) => {
  const socialPlatforms = [
    {
      key: 'github',
      usernameKey: 'githubUsername',
      color: 'text-dark-text-secondary hover:text-white',
      url: (value: string) => `https://github.com/${value}`,
      connected: connectedSocials?.github
    },
    {
      key: 'twitter',
      usernameKey: 'twitterUsername',
      color: 'text-blue-400 hover:text-blue-300',
      url: (value: string) => `https://x.com/${value}`,
      connected: connectedSocials?.twitter
    },
    {
      key: 'discord',
      usernameKey: 'discordUsername',
      color: 'text-indigo-400 hover:text-indigo-300',
      url: (value: string) => `https://discord.com/users/${value}`,
      connected: connectedSocials?.discord
    },
    {
      key: 'telegram',
      usernameKey: 'telegramUsername',
      color: 'text-cyan-400 hover:text-cyan-300',
      url: (value: string) => `https://t.me/${value}`,
      connected: connectedSocials?.telegram
    }
  ];

  const availablePlatforms = socialPlatforms.filter(({ usernameKey, connected }) =>
    socialHandles?.[usernameKey] && connected
  );

  return (
    <div className="flex flex-wrap gap-3">
      {availablePlatforms.length > 0 ? (
        availablePlatforms.map(({ key, usernameKey, color, url }) => {
          const value = socialHandles[usernameKey];
          return (
            <a
              key={key}
              href={url(value)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${color} transform hover:scale-110 transition-all duration-300 p-2 rounded-lg hover:bg-blue-shade-200/20`}
              title={`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`}
            >
              <SocialIcon platform={key} />
            </a>
          );
        })
      ) : (
        <span className="text-dark-text-tertiary text-sm italic">No social links</span>
      )}
    </div>
  );
};

// Enhanced Stats Card Component
const StatsCard: React.FC<{ title: string; value: number; icon: React.ReactNode; gradient?: string }> = ({
  title,
  value,
  icon,
  gradient = "from-blue-shade-100 to-blue-shade-200"
}) => (
  <div className="bg-gradient-to-br from-blue-shade-500/50 to-blue-shade-300/50 backdrop-blur-sm border border-blue-shade-200/30 rounded-2xl p-6 hover:border-blue-shade-100/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-shade-100/10">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-dark-text-secondary text-sm font-medium font-poppins">{title}</p>
        <p className="text-3xl font-bold text-dark-text-primary font-tektur mt-1">{value.toLocaleString()}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient}`}>
        {icon}
      </div>
    </div>
  </div>
);

// Main Dashboard Component
const DashboardPage: React.FC = () => {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const data = await response.json();

      console.log("dashboard data: ", data);

      if (data.success) {
        setUsers(data.data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard!', {
      style: {
        background: '#0D1527',
        color: '#ffffff',
        border: '1px solid #123099',
        borderRadius: '12px',
        fontSize: '14px',
        fontFamily: 'var(--font-poppins)'
      }
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const filteredUsers = users.filter(user =>
    user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.socialHandles?.githubUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nftData?.githubUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Calculate stats
  const totalUsers = users.length;
  const totalNFTsMinted = users.reduce((sum, user) => sum + user.totalNftsMinted, 0);
  const usersWithSocials = users.filter(user =>
    Object.values(user.connectedSocials).some(connected => connected)
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center font-tektur">
        <div className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="animate-spin-subtle rounded-full h-20 w-20 border-4 border-blue-shade-100/30 border-t-blue-shade-100 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-blue-shade-200 animate-spin mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-dark-text-primary text-xl font-semibold">Loading Dashboard</p>
            <p className="text-dark-text-secondary text-sm">Fetching user data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center font-tektur">
        <div className="text-center space-y-6 bg-gradient-to-br from-blue-shade-500/50 to-blue-shade-300/50 backdrop-blur-sm border border-red-500/30 p-10 rounded-2xl shadow-2xl max-w-md">
          <div className="text-red-400">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-3">
            <h3 className="text-dark-text-primary text-xl font-semibold">Oops! Something went wrong</h3>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
          <button
            onClick={fetchUsers}
            className="px-8 py-3 bg-gradient-to-r from-blue-shade-100 to-blue-shade-200 text-white rounded-xl hover:from-blue-shade-200 hover:to-blue-shade-100 transition-all duration-300 font-medium transform hover:scale-105 shadow-lg hover:shadow-blue-shade-100/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary text-dark-text-primary py-8 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 animate-fadeIn">
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-gradient-to-r from-blue-shade-100 via-white to-blue-shade-100 bg-clip-text mb-4 font-tektur">
              User Dashboard
            </h1>
            <p className="text-dark-text-secondary text-lg max-w-2xl mx-auto">
              Comprehensive overview of all registered users, their social connections, and NFT claims
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Users"
              value={totalUsers}
              icon={<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>}
              gradient="from-blue-shade-100 to-blue-shade-200"
            />
            <StatsCard
              title="NFTs Claimed"
              value={totalNFTsMinted}
              icon={<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>}
              gradient="from-green-shade-100 to-green-shade-200"
            />
            <StatsCard
              title="Social Connected"
              value={usersWithSocials}
              icon={<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>}
              gradient="from-purple-500 to-purple-600"
            />
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-10">
          <div className="relative max-w-3xl mx-auto">
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-transform duration-300 ease-in-out">
              <svg
                className="h-6 w-6 text-dark-text-secondary/70 group-hover:text-dark-text-primary transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Search Input */}
            <input
              type="text"
              className="block w-full pl-14 pr-12 py-4 rounded-xl bg-blue-shade-500 border-blue-900 text-dark-text-primary placeholder-dark-text-secondary/50 shadow-lg transition-all duration-300 ease-in-out text-lg hover:shadow-xl hover:border-blue-shade-300/30"
              placeholder="Search by wallet address, GitHub username, or NFT data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search users by wallet address, GitHub username, or NFT data"
            />

            {/* Clear Button */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-dark-text-secondary/70 hover:text-dark-text-primary focus:outline-none transition-all duration-200 transform hover:scale-110 focus:scale-110"
                aria-label="Clear search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Results Info */}
          <div className="text-center mt-5">
            <p className="text-dark-text-secondary text-sm font-medium">
              Showing{' '}
              <span className="text-blue-shade-100 font-semibold">{filteredUsers.length}</span> of{' '}
              <span className="text-blue-shade-100 font-semibold">{users.length}</span> users
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-gradient-to-br from-blue-shade-500/30 to-blue-shade-300/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-shade-200/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-shade-200/20">
              <thead className="bg-gradient-to-r from-blue-shade-500/50 to-blue-shade-300/50">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-bold text-dark-text-primary uppercase tracking-wider font-tektur">
                    Wallet Address
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-dark-text-primary uppercase tracking-wider font-tektur">
                    Social Connections
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-dark-text-primary uppercase tracking-wider font-tektur">
                    NFT Minted
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-dark-text-primary uppercase tracking-wider font-tektur">
                    NFT Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-shade-200/10">
                {currentUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className="hover:bg-blue-shade-200/10 transition-all duration-300 group animate-slide-down"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-shade-100 to-blue-shade-200 flex items-center justify-center text-white font-bold text-sm">
                          {user.address.slice(2, 4).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-dark-text-primary font-mono text-sm font-medium">
                            {truncateAddress(user.address)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(user.address)}
                            className="ml-3 text-dark-text-secondary hover:text-blue-shade-100 transform hover:scale-110 transition-all duration-200 p-1 rounded-lg hover:bg-blue-shade-200/20"
                            title="Copy full address"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <SocialLinks socialHandles={user.socialHandles} connectedSocials={user.connectedSocials} />
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <StatusBadge
                        hasNFT={user.totalNftsMinted > 0}
                        totalMinted={user.totalNftsMinted}
                      />
                    </td>
                    <td className="px-8 py-6">
                      <NFTLevelsDisplay nftData={user.nftData} totalMinted={user.totalNftsMinted} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && searchTerm && (
          <div className="text-center py-16 bg-gradient-to-br from-blue-shade-500/30 to-blue-shade-300/30 backdrop-blur-sm rounded-2xl mt-8 border border-blue-shade-200/30">
            <svg className="w-16 h-16 text-dark-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 01-8 8 8 8 0 01-8-8 8 8 0 018-8c2.027 0 3.915.752 5.34 1.991" />
            </svg>
            <h3 className="text-dark-text-primary text-xl font-semibold mb-2">No users found</h3>
            <p className="text-dark-text-secondary">Try adjusting your search terms or clearing the search.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-shade-100 to-blue-shade-200 text-white rounded-xl hover:from-blue-shade-200 hover:to-blue-shade-100 transition-all duration-300 transform hover:scale-105"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-2xl shadow-2xl bg-gradient-to-r from-blue-shade-500/50 to-blue-shade-300/50 backdrop-blur-sm border border-blue-shade-200/30 p-2" aria-label="Pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-6 py-3 rounded-xl border-0 bg-transparent text-sm font-medium text-dark-text-primary hover:bg-blue-shade-100/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 disabled:hover:bg-transparent"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center space-x-1 mx-4">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 7) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 4) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNumber = totalPages - 6 + i;
                  } else {
                    pageNumber = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${currentPage === pageNumber
                        ? 'bg-gradient-to-r from-blue-shade-100 to-blue-shade-200 text-white shadow-lg transform scale-105'
                        : 'text-dark-text-primary hover:bg-blue-shade-100/20 hover:text-white'
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {totalPages > 7 && currentPage < totalPages - 3 && (
                  <>
                    <span className="text-dark-text-secondary px-2">...</span>
                    <button
                      onClick={() => paginate(totalPages)}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl text-dark-text-primary hover:bg-blue-shade-100/20 hover:text-white transition-all duration-300"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-6 py-3 rounded-xl border-0 bg-transparent text-sm font-medium text-dark-text-primary hover:bg-blue-shade-100/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 disabled:hover:bg-transparent"
              >
                Next
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardPage;