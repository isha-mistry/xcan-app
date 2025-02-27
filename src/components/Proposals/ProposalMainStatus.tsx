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
    setMenuOpen(!menuOpen);

    // Clear any existing timeout to prevent tooltip from closing
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
    const containerElement = containerRef.current;

    if (!tooltipElement || !pointElement || !containerElement) {
      return;
    }

    const tooltipRect = tooltipElement.getBoundingClientRect();
    const pointRect = pointElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Point center coordinates relative to container
    const pointX = pointRect.left + pointRect.width / 2 - containerRect.left;
    const pointY = pointRect.top + pointRect.height / 2 - containerRect.top;

    // Point center coordinates relative to viewport
    const pointViewportX = pointRect.left + pointRect.width / 2;
    const pointViewportY = pointRect.top + pointRect.height / 2;

    // Tooltip dimensions
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;

    // Default position (below point)
    let posLeft = pointX;
    let posTop = pointY + 70;
    let placement = "bottom";

    // Check if tooltip would extend beyond right edge of viewport
    if (pointViewportX + tooltipWidth / 2 > viewportWidth - 20) {
      // Position tooltip so right edge is 20px from viewport edge
      const rightOverflow =
        pointViewportX + tooltipWidth / 2 - (viewportWidth - 20);
      posLeft = pointX - rightOverflow;
      placement = "bottom-left";
    }

    // Check if tooltip would extend beyond left edge of viewport
    if (pointViewportX - tooltipWidth / 2 < 20) {
      // Position tooltip so left edge is 20px from viewport edge
      const leftOverflow = 20 - (pointViewportX - tooltipWidth / 2);
      posLeft = pointX + leftOverflow;
      placement = "bottom-right";
    }

    // Check if tooltip would extend beyond bottom of viewport
    if (pointViewportY + tooltipHeight + 70 > viewportHeight - 20) {
      // Position tooltip above point
      posTop = pointY - tooltipHeight - 20;

      if (placement === "bottom") {
        placement = "top";
      } else if (placement === "bottom-left") {
        placement = "top-left";
      } else if (placement === "bottom-right") {
        placement = "top-right";
      }
    }

    // Update position
    setTooltipPosition({ left: posLeft, top: posTop });
    setTooltipPlacement(placement);
  }, [tooltipVisible, activeItem]);

  // Fixed width tooltip positioned absolutely within the container
  const getTooltipClasses = () => {
    // Base classes for tooltip
    let classes =
      "fixed w-52 p-4 bg-white rounded-lg shadow-xl border border-gray-100 backdrop-blur-sm bg-opacity-90 z-50 transition-all duration-300";

    // Add arrow position classes based on placement
    switch (tooltipPlacement) {
      case "top":
        classes += " arrow-bottom";
        break;
      case "bottom":
        classes += " arrow-top";
        break;
      case "bottom-left":
        classes += " arrow-top-left";
        break;
      case "bottom-right":
        classes += " arrow-top-right";
        break;
      case "top-left":
        classes += " arrow-bottom-left";
        break;
      case "top-right":
        classes += " arrow-bottom-right";
        break;
    }

    return classes;
  };

  // Get transform style based on placement
  const getTooltipTransform = () => {
    switch (tooltipPlacement) {
      case "top":
      case "bottom":
        return "translate(-50%, 0)";
      case "bottom-left":
      case "top-left":
        return "translate(-10%, 0)";
      case "bottom-right":
      case "top-right":
        return "translate(-90%, 0)";
      default:
        return "translate(-50%, 0)";
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full relative p-8 bg-gradient-to-br from-gray-50 to-slate-50 rounded-[1rem]"
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
          const radius = 120;
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
            top: pointRefs.current[activeItem]
              ? pointRefs.current[activeItem]!.getBoundingClientRect().top +
                (tooltipPlacement.startsWith("top") ? -80 : 70)
              : 0,
            left: pointRefs.current[activeItem]
              ? pointRefs.current[activeItem]!.getBoundingClientRect().left +
                pointRefs.current[activeItem]!.offsetWidth / 2
              : 0,
            transform: getTooltipTransform(),
            opacity: tooltipVisible ? 1 : 0,
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

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-100">
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
                          <span className="text-xs text-gray-500">
                            {blockNumber}
                          </span>
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
    </div>
  );
};

export default ProposalMainStatus;
