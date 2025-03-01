import React, { useState, useRef, useEffect } from "react";
import {
  FaFileAlt,
  FaUpload,
  FaVoteYea,
  FaClock,
  FaCheckCircle,
  FaListAlt,
  FaRocket,
  FaEllipsisV,
  FaExternalLinkAlt,
  FaCopy,
} from "react-icons/fa";

interface TimelineItem {
  title: string;
  date: string;
  description: string;
  icon: React.ReactNode;
}

const ProposalMainStatus = () => {
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipPlacement, setTooltipPlacement] = useState("bottom");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const pointRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const blockNumber = "12345678"; // Example block number
  const blockExplorerUrl = "https://arbiscan.io/block/" + blockNumber;

  const timelineData: TimelineItem[] = [
    {
      title: "Proposed",
      date: "2024-03-03T00:00:00Z",
      description: "Proposal submitted for community review",
      icon: <FaFileAlt size={20} />,
    },
    {
      title: "Published Onchain",
      date: "2024-03-25T00:00:00Z",
      description: "Community members casting votes on proposal",
      icon: <FaUpload size={20} />,
    },
    {
      title: "Voting Period Started",
      date: "2024-03-03T00:00:00Z",
      description: "Proposal approved and awaiting execution",
      icon: <FaVoteYea size={20} />,
    },
    {
      title: "Voting Period Extended",
      date: "2024-03-04T00:00:00Z",
      description: "Proposal changes successfully implemented",
      icon: <FaClock size={20} />,
    },
    {
      title: "Voting Period Ended",
      date: "2024-04-04T00:00:00Z",
      description: "Proposal changes successfully implemented",
      icon: <FaCheckCircle size={20} />,
    },
    {
      title: "Proposal Queued",
      date: "2025-03-04T00:00:00Z",
      description: "Proposal changes successfully implemented",
      icon: <FaListAlt size={20} />,
    },
    {
      title: "Proposal Executed",
      date: "2025-03-04T00:00:00Z",
      description: "Proposal changes successfully implemented",
      icon: <FaRocket size={20} />,
    },
  ];

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${day} ${month}, ${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  const formatDatewithYear = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${day} ${month} ${date.getUTCFullYear()}, ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Function to check if a date is in the past using UTC time
  const isDatePassed = (dateString: string): boolean => {
    const itemDate = new Date(dateString);
    const today = new Date();

    // Get UTC timestamp values for comparison
    const itemUTC = Date.UTC(
      itemDate.getUTCFullYear(),
      itemDate.getUTCMonth(),
      itemDate.getUTCDate(),
      itemDate.getUTCHours(),
      itemDate.getUTCMinutes(),
      itemDate.getUTCSeconds()
    );

    const todayUTC = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      today.getUTCHours(),
      today.getUTCMinutes(),
      today.getUTCSeconds()
    );

    return itemUTC < todayUTC;
  };

  const getLastCompletedIndex = (): number => {
    for (let i = timelineData.length - 1; i >= 0; i--) {
      if (isDatePassed(timelineData[i].date)) {
        return i;
      }
    }
    return -1;
  };
  const lastCompletedIndex = getLastCompletedIndex();

  // Handle mouse enter with delay for tooltip
  const handleMouseEnter = (index: number) => {
    setActiveItem(index);

    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // Set a timeout to show the tooltip after 300ms
    tooltipTimeoutRef.current = setTimeout(() => {
      updateTooltipPosition(index);
      setTooltipVisible(true);
      setMenuOpen(false);
    }, 300);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    // Clear the timeout if mouse leaves before tooltip is shown
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // Keep tooltip visible for 3 seconds before hiding
    tooltipTimeoutRef.current = setTimeout(() => {
      setActiveItem(null);
      setTooltipVisible(false);
    }, 500);
  };

  const handleMenuMouseEnter = () => {
    // Clear any existing menu timeout
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
  };

  const handleMenuMouseLeave = () => {
    // Set timeout to close the menu after 0.5 seconds
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }

    menuTimeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 500);
  };

  const copyBlockNumber = () => {
    navigator.clipboard.writeText(blockNumber);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setMenuOpen(!menuOpen);

    if (!menuOpen && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate menu position relative to tooltip
      // Position to the right of the tooltip
      let top = tooltipRect.top;
      let left = tooltipRect.right + 10; // 10px gap

      // Menu dimensions (approximate)
      const menuWidth = 224; // w-56 = 224px
      const menuHeight = 100; // Approximate menu height

      // Check if menu would extend beyond right edge of viewport
      if (left + menuWidth > viewportWidth - 20) {
        // Position to the left of the tooltip instead
        left = tooltipRect.left - menuWidth - 10;

        // If still out of bounds (not enough space on either side)
        if (left < 20) {
          // Position below the tooltip
          left = tooltipRect.left;
          top = tooltipRect.bottom + 10;

          // If bottom placement would go beyond viewport
          if (top + menuHeight > viewportHeight - 20) {
            // Position above the tooltip
            top = tooltipRect.top - menuHeight - 10;
          }
        }
      }

      // Final check to ensure menu stays within viewport bounds
      if (top < 20) top = 20;
      if (top + menuHeight > viewportHeight - 20)
        top = viewportHeight - menuHeight - 20;
      if (left < 20) left = 20;
      if (left + menuWidth > viewportWidth - 20)
        left = viewportWidth - menuWidth - 20;

      setMenuPosition({ top, left });
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const updateTooltipPosition = (index: number) => {
    if (!containerRef.current || !pointRefs.current[index]) {
      return;
    }

    // Get coordinates and measurements
    const containerRect = containerRef.current.getBoundingClientRect();
    const pointRect = pointRefs.current[index]!.getBoundingClientRect();

    // Initial position calculation (relative to container)
    const pointX = pointRect.left + pointRect.width / 2 - containerRect.left;
    const pointY = pointRect.top + pointRect.height / 2 - containerRect.top;

    // Set initial position (will be refined once tooltip is rendered)
    setTooltipPosition({
      left: pointX,
      top: pointY + 70,
    });
    setTooltipPlacement("bottom");
  };

  // Adjust tooltip position after it's rendered
  useEffect(() => {
    if (!tooltipVisible || activeItem === null || !tooltipRef.current) {
      return;
    }

    const tooltipElement = tooltipRef.current;
    const pointElement = pointRefs.current[activeItem];

    if (!tooltipElement || !pointElement) {
      return;
    }

    const tooltipRect = tooltipElement.getBoundingClientRect();
    const pointRect = pointElement.getBoundingClientRect();

    // Point center coordinates relative to viewport
    const pointViewportX = pointRect.left + pointRect.width / 2;
    const pointViewportY = pointRect.top + pointRect.height / 2;

    // Viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate tooltip position
    // Start with position below the point
    let posLeft = pointViewportX - tooltipRect.width / 2;
    let posTop = pointViewportY + 40; // Gap between point and tooltip

    // Check if tooltip would extend beyond right edge
    if (posLeft + tooltipRect.width > viewportWidth - 20) {
      posLeft = viewportWidth - tooltipRect.width - 20;
    }

    // Check if tooltip would extend beyond left edge
    if (posLeft < 20) {
      posLeft = 20;
    }

    // Check if tooltip would extend beyond bottom edge
    if (posTop + tooltipRect.height > viewportHeight - 20) {
      // Position tooltip above point instead
      posTop = pointViewportY - tooltipRect.height - 20;
    }

    // Check if tooltip would extend beyond top edge
    if (posTop < 20) {
      posTop = 20;
    }

    // Update tooltip position
    tooltipElement.style.left = `${posLeft}px`;
    tooltipElement.style.top = `${posTop}px`;
  }, [tooltipVisible, activeItem]);

  // Fixed width tooltip positioned absolutely within the container
  const getTooltipClasses = () => {
    return "fixed w-52 p-4 bg-white rounded-lg shadow-xl border border-gray-100 backdrop-blur-sm bg-opacity-90 z-50 transition-all duration-300";
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full relative p-8 rounded-[1rem]"
      ref={containerRef}
    >
      <h2 className="text-2xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-slate-600">
        Proposal Timeline
      </h2>

      <div className="relative w-64 h-64 mb-8">
        {/* Background gradient circles */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-slate-100 opacity-50"></div>
        <div className="absolute inset-2 rounded-full"></div>

        {/* Main circle */}
        <div className="absolute inset-0 border-4 border-gray-300 rounded-full shadow-inner"></div>

        {/* Timeline points */}
        {timelineData.map((item, index) => {
          const isPassed = isDatePassed(item.date);
          const isLastCompleted = index === lastCompletedIndex;
          const angle = index * (360 / timelineData.length) * (Math.PI / 180);
          const radius = 124;
          const x = radius * Math.cos(angle - Math.PI / 2) + 128;
          const y = radius * Math.sin(angle - Math.PI / 2) + 128;

          let pointStyle =
            "bg-gradient-to-br from-gray-400 to-slate-500 text-white"; // pending
          if (isPassed) {
            pointStyle = !isLastCompleted
              ? "bg-gradient-to-br from-indigo-500 to-indigo-400 text-white" // last completed (indigo)
              : "bg-white text-black"; // completed (blue)
          }

          return (
            <div
              key={index}
              className="absolute z-20"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Timeline point with icon */}
              <div className="relative">
                <div
                  ref={(el) => {
                    pointRefs.current[index] = el;
                  }}
                  className={`flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-all duration-300 shadow-md 
                  ${activeItem === index ? "scale-125" : "scale-100"} 
                  ${pointStyle}`}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="">{item.icon}</div>

                  {/* Pulse animation for active item */}
                  {activeItem === index && (
                    <div
                      className={`absolute w-full h-full rounded-full animate-ping opacity-30 ${
                        !isLastCompleted
                          ? "bg-indigo-400"
                          : isPassed
                          ? "bg-blue-200"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  )}
                </div>

                {/* Date below the circle */}
                <div className="absolute left-[-15px] mt-2 text-[10px] font-medium text-center px-2 py-1 rounded-md w-max bg-gray-200 text-gray-700">
                  {formatDate(item.date)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS for tooltip arrows */}
      <style jsx>{`
        .arrow-top::before {
          content: "";
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 8px 8px 8px;
          border-style: solid;
          border-color: transparent transparent white transparent;
        }

        .arrow-bottom::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px 8px 0 8px;
          border-style: solid;
          border-color: white transparent transparent transparent;
        }

        .arrow-top-left::before {
          content: "";
          position: absolute;
          top: -8px;
          left: 10%;
          transform: translateX(-50%);
          border-width: 0 8px 8px 8px;
          border-style: solid;
          border-color: transparent transparent white transparent;
        }

        .arrow-top-right::before {
          content: "";
          position: absolute;
          top: -8px;
          right: 10%;
          transform: translateX(50%);
          border-width: 0 8px 8px 8px;
          border-style: solid;
          border-color: transparent transparent white transparent;
        }

        .arrow-bottom-left::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 10%;
          transform: translateX(-50%);
          border-width: 8px 8px 0 8px;
          border-style: solid;
          border-color: white transparent transparent transparent;
        }

        .arrow-bottom-right::after {
          content: "";
          position: absolute;
          bottom: -8px;
          right: 10%;
          transform: translateX(50%);
          border-width: 8px 8px 0 8px;
          border-style: solid;
          border-color: white transparent transparent transparent;
        }
      `}</style>

      {/* Tooltip with fixed positioning to ensure visibility */}
      {activeItem !== null && tooltipVisible && (
        <div
          ref={tooltipRef}
          className={getTooltipClasses()}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            transform: "none",
            opacity: tooltipVisible ? 1 : 0,
            maxWidth: "calc(100vw - 40px)",
            maxHeight: "calc(100vh - 40px)",
            overflow: "auto",
          }}
          onMouseEnter={() => {
            // Keep tooltip open when mouse enters it
            if (tooltipTimeoutRef.current) {
              clearTimeout(tooltipTimeoutRef.current);
            }
          }}
          onMouseLeave={() => {
            // Resume closing after mouse leaves
            handleMouseLeave();
          }}
        >
          <div className="flex justify-between items-start">
            <div
              className={`text-sm font-bold ${
                activeItem === lastCompletedIndex
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600"
                  : isDatePassed(timelineData[activeItem].date)
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-slate-600"
              }`}
            >
              {timelineData[activeItem].title}
            </div>
            <div className="relative" ref={menuRef}>
              <div
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer transition-colors ml-2"
                onClick={toggleMenu}
              >
                <FaEllipsisV className="text-gray-500 text-xs" />
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatDatewithYear(timelineData[activeItem].date)}
          </div>
          <div className="text-xs mt-2 text-gray-700">
            {timelineData[activeItem].description}
          </div>
          <div className="text-xs font-medium mt-2 flex items-center">
            Status:{" "}
            <span
              className={`ml-1 px-2 py-1 rounded-full text-white text-xs ${
                activeItem === lastCompletedIndex
                  ? "bg-gradient-to-r from-indigo-400 to-indigo-600"
                  : isDatePassed(timelineData[activeItem].date)
                  ? "bg-gradient-to-r from-indigo-400 to-indigo-600"
                  : "bg-gradient-to-r from-gray-400 to-slate-500"
              }`}
            >
              {isDatePassed(timelineData[activeItem].date)
                ? activeItem === lastCompletedIndex
                  ? "Current"
                  : "Completed"
                : "Pending"}
            </span>
          </div>
        </div>
      )}
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-100 overflow-hidden"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            maxHeight: "calc(100vh - 40px)",
            overflowY: "auto",
          }}
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        >
          <div className="py-1">
            {/* View on Block Explorer */}
            <a
              href={blockExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <FaExternalLinkAlt className="text-gray-500 mr-2 text-xs" />
              <span className="text-xs text-gray-700">
                View on Block Explorer
              </span>
            </a>

            {/* Block Number */}
            <div
              className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                copyBlockNumber();
              }}
            >
              <div className="flex items-center">
                <FaCopy className="text-gray-500 mr-2 text-xs" />
                <div>
                  <span className="text-xs text-gray-700 block">
                    Arbitrum Block:
                  </span>
                  <span className="text-xs text-gray-500">{blockNumber}</span>
                </div>
              </div>
              <div className="text-xs text-green-500">
                {copySuccess ? "Copied!" : ""}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalMainStatus;
