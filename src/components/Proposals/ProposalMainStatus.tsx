import { daoConfigs } from "@/config/daos";
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
  FaCalendarAlt,
} from "react-icons/fa";
import { FaCross } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";

interface TimelineItem {
  title: string;
  date: string;
  description: string;
  blockTitle: string;
  blockNumber: string | number | null;
  blockExplorerUrl: string;
  icon: React.ReactNode;
}

const ProposalMainStatus = ({ proposalTimeline, dao , defeated, cancelled, cancelledTime}: any) => {
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

  const isBeforeCancellation = (itemDate: string | null): boolean => {
    if (!itemDate || !cancelled || !cancelledTime) {
      return true; // If no cancellation or no date, item is valid
    }
    
    const itemTimestamp = new Date(itemDate).getTime() / 1000;
    return itemTimestamp < Number(cancelledTime);
  };


  // const blockNumber = "12345678"; // Example block number
  console.log("proposalTimeline", proposalTimeline);
  const timelineData: TimelineItem[] = (
    [
      (!cancelled || isBeforeCancellation(new Date(proposalTimeline[0].publishOnchain.time * 1000).toString())) ? {
        title: "Published Onchain",
        date: proposalTimeline[0]?.publishOnchain.time
          ? new Date(proposalTimeline[0].publishOnchain.time * 1000).toString()
          : null,
        description: "Community members casting votes on proposal",
        blockTitle: `${dao} Block :`,
        blockNumber: proposalTimeline[0]?.publishOnchain.block,
        blockExplorerUrl: `${daoConfigs[dao].explorerUrl}/block/${proposalTimeline[0]?.publishOnchain.block}`,
        icon: <FaUpload size={20} />,
      }: null ,
      (!cancelled || isBeforeCancellation(new Date(proposalTimeline[0].votingStart.time * 1000).toString())) ? {
        title: "Voting Period Started",
        date: proposalTimeline[0]?.votingStart.time
          ? new Date(proposalTimeline[0].votingStart.time * 1000).toString()
          : null,
        description: "Proposal approved and awaiting execution",
        blockTitle: dao === "arbitrum" ? `Ethereum Block :` : `${dao} Block :`,
        blockNumber: proposalTimeline[0]?.votingStart.block,
        blockExplorerUrl:
          dao !== "arbitrum"
            ? `${daoConfigs[dao].explorerUrl}/block/${proposalTimeline[0]?.votingStart.block}`
            : null,
        icon: <FaVoteYea size={20} />,
      }: null,
      proposalTimeline[0]?.votingExtended.time &&  (!cancelled || isBeforeCancellation(new Date(proposalTimeline[0].votingExtended.time * 1000).toString()))
        ? {
            title: "Voting Period Extended",
            date: new Date(
              proposalTimeline[0].votingExtended.time * 1000
            ).toString(),
            description: "Proposal changes successfully implemented",
            blockTitle:
              dao === "arbitrum" ? `Ethereum Block :` : `${dao} Block :`,
            blockNumber: proposalTimeline[0]?.votingExtended.block,
            blockExplorerUrl:
              dao !== "arbitrum"
                ? `${daoConfigs[dao].explorerUrl}/block/${proposalTimeline[0]?.votingExtended.block}`
                : null,
            icon: <FaClock size={20} />,
          }
        : null,
        (!cancelled || isBeforeCancellation(new Date(proposalTimeline[0].votingEnd.time * 1000).toString())) ? {
        title: "Voting Period Ended",
        date: proposalTimeline[0]?.votingEnd.time
          ? new Date(proposalTimeline[0].votingEnd.time * 1000).toString()
          : null,
        description: "Proposal changes successfully implemented",
        blockTitle: dao === "arbitrum" ? `Ethereum Block :` : `${dao} Block :`,
        blockNumber: proposalTimeline[0]?.votingEnd.block,
        blockExplorerUrl:
          dao !== "arbitrum"
            ? `${daoConfigs[dao].explorerUrl}/block/${proposalTimeline[0]?.votingEnd.block}`
            : null,
        icon: <FaCheckCircle size={20} />,
      }: null,
      defeated ?{
        title:"Defeated",
        icon:<RxCross2  size={20}/>,
        date:null
      }: null,
      daoConfigs[dao].name === "arbitrum" && !defeated &&  (!cancelled || isBeforeCancellation(new Date(proposalTimeline[0].proposalQueue.time * 1000).toString()))
        ? {
            title: "Proposal Queued",
            date: proposalTimeline[0].proposalQueue.time
              ? new Date(
                  proposalTimeline[0].proposalQueue.time * 1000
                ).toString()
              : null,
            description: "Proposal changes successfully implemented",
            blockTitle: `${dao} Block :`,
            blockNumber: proposalTimeline[0].proposalQueue.block,
            blockExplorerUrl: `${daoConfigs[dao].explorerUrl}/block/${proposalTimeline[0]?.proposalQueue.block}`,
            icon: <FaListAlt size={20} />,
          }
        : null,
        !defeated &&  (!cancelled || isBeforeCancellation(new Date(proposalTimeline[0].proposalExecution.time * 1000).toString())) ? {
        title: "Proposal Executed",
        date: proposalTimeline[0]?.proposalExecution.time
          ? new Date(
              proposalTimeline[0].proposalExecution.time * 1000
            ).toString()
          : null,
        description: "Proposal changes successfully implemented",
        blockTitle: `${dao} Block :`,
        blockNumber:
          dao !== "arbitrum"
            ? proposalTimeline[0]?.proposalExecution.block
            : null,
        blockExplorerUrl:
          dao !== "arbitrum"
            ? `${daoConfigs[dao].explorerUrl}/block/${proposalTimeline[0]?.proposalExecution.block}`
            : null,
        icon: <FaRocket size={20} />,
      } : null,
      cancelled ? {
        title:"Cancelled",
        icon:<RxCross2  size={20}/>,
        date:null
      }: null
    ] as TimelineItem[]
  ).filter(Boolean); // ✅ Removes null values

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
    if (!dateString) {
      return false;
    }
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

  const copyBlockNumber = (blockNumber: any) => {
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
    if (!containerRef.current || !pointRefs.current[index]) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const pointElement = pointRefs.current[index];
    if (!pointElement) return;

    // Get the bounding rectangle of the point element
    const pointRect = pointElement.getBoundingClientRect();

    // Calculate position relative to the container
    const tooltipLeft =
      pointRect.left - containerRect.left + pointRect.width / 2;
    const tooltipTop = pointRect.bottom - containerRect.top + 10; // 10px gap below the point

    // Set tooltip position
    setTooltipPosition({
      left: tooltipLeft,
      top: tooltipTop,
    });
  };

  // Adjust tooltip position after it's rendered
  useEffect(() => {
    if (
      !tooltipVisible ||
      activeItem === null ||
      !tooltipRef.current ||
      !containerRef.current
    ) {
      return;
    }

    const tooltipElement = tooltipRef.current;
    const containerElement = containerRef.current;
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();

    // Container dimensions
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Adjust horizontal position if tooltip goes beyond right edge
    let posLeft = tooltipPosition.left - tooltipRect.width / 2;
    if (posLeft + tooltipRect.width > containerWidth - 20) {
      posLeft = containerWidth - tooltipRect.width - 20;
    }

    // Adjust horizontal position if tooltip goes beyond left edge
    if (posLeft < 20) {
      posLeft = 20;
    }

    // Adjust vertical position if tooltip goes beyond bottom edge
    let posTop = tooltipPosition.top;
    if (posTop + tooltipRect.height > containerHeight - 20) {
      // Move tooltip above the point if it would go beyond bottom
      posTop = tooltipPosition.top - tooltipRect.height - 40; // 40px total gap
    }

    // Adjust vertical position if tooltip goes beyond top edge
    if (posTop < 20) {
      posTop = 20;
    }

    // Update tooltip position relative to container
    tooltipElement.style.position = "absolute";
    tooltipElement.style.left = `${posLeft}px`;
    tooltipElement.style.top = `${posTop}px`;
  }, [tooltipVisible, activeItem, tooltipPosition]);

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
          const isLastItem = index === timelineData.length - 1;
          const angle = index * (360 / timelineData.length) * (Math.PI / 180);
          const radius = 124;
          const x = radius * Math.cos(angle - Math.PI / 2) + 128;
          const y = radius * Math.sin(angle - Math.PI / 2) + 128;
          const hasValidDate = item.date !== null;

          let pointStyle =
            "bg-gradient-to-br from-gray-400 to-slate-500 text-white"; // pending
            if (defeated || cancelled) {
              pointStyle = "bg-gradient-to-br from-indigo-500 to-indigo-400 text-white";
            } else if (isPassed) {
            pointStyle =
              isLastItem && isLastCompleted // Apply the special style if it's the last item AND last completed
                ? "bg-gradient-to-br from-indigo-500 to-indigo-400 text-white"
                : !isLastCompleted
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
                {hasValidDate && (
                  <div className="absolute left-[-15px] mt-2 text-[10px] font-medium text-center px-2 py-1 rounded-md w-max bg-gray-200 text-gray-700">
                    {formatDate(item.date)}
                  </div>
                )}
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
            if (tooltipTimeoutRef.current) {
              clearTimeout(tooltipTimeoutRef.current);
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex justify-between items-start">
            <div
              className={`text-sm font-bold ${
                timelineData[activeItem].date < new Date().toString()
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600"
                  : timelineData[activeItem]?.date &&
                    isDatePassed(timelineData[activeItem].date)
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-slate-600"
              }`}
            >
              {timelineData[activeItem]?.title}
            </div>

            {/* Only show menu icon if the date is available and in the past */}
            {timelineData[activeItem]?.date &&
              isDatePassed(timelineData[activeItem].date) && (
                <div className="relative" ref={menuRef}>
                  <div
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer transition-colors ml-2"
                    onClick={toggleMenu}
                  >
                    <FaEllipsisV className="text-gray-500 text-xs" />
                  </div>
                </div>
              )}
          </div>

          {/* Only show date-related info if date is not null */}
          {timelineData[activeItem]?.date && (
            <>
              <div className="text-xs text-gray-500 mt-1">
                {isDatePassed(timelineData[activeItem].date)
                  ? formatDatewithYear(timelineData[activeItem].date)
                  : "Scheduled for the future"}
              </div>

              <div className="text-xs mt-2 flex items-center">
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
                  {defeated || cancelled
    ? "Completed"
    : isDatePassed(timelineData[activeItem].date)
      ? activeItem === lastCompletedIndex &&
        activeItem === timelineData.length - 1
        ? "Completed" // Show "Completed" if last and lastCompleted
        : activeItem === lastCompletedIndex
          ? "Active"
          : "Completed"
      : "Pending"}
                </span>
              </div>
            </>
          )}
          <div className="text-xs mt-2 text-gray-700">
            {timelineData[activeItem].description}
          </div>
        </div>
      )}

      {menuOpen &&
        activeItem !== null &&
        timelineData[activeItem].blockNumber !== null &&
        timelineData[activeItem]?.date &&
        isDatePassed(timelineData[activeItem].date) && (
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
              {timelineData[activeItem].blockExplorerUrl !== null && (
                <a
                  href={timelineData[activeItem].blockExplorerUrl}
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
              )}

              {timelineData[activeItem].blockNumber !== null && (
                <div
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyBlockNumber(timelineData[activeItem].blockNumber);
                  }}
                >
                  <div className="flex items-center">
                    <FaCopy className="text-gray-500 mr-2 text-xs" />
                    <div>
                      <span className="text-xs text-gray-700 block">
                        {timelineData[activeItem].blockTitle}
                      </span>
                      {/* {console.log("blockNumber",timelineData.blockNumber)} */}
                      <span className="text-xs text-gray-500">
                        {timelineData[activeItem].blockNumber}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-green-500">
                    {copySuccess ? "Copied!" : ""}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default ProposalMainStatus;
