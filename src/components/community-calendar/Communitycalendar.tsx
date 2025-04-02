"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useMobile } from "@/app/hooks/use-mobile";
import { daoConfigs } from "@/config/daos";

function Communitycalendar({ props }: { props: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isMobile = useMobile();

  const src = daoConfigs[props.toLowerCase()]?.communityCalendarUrl;

  const calendarSrc = `${src}=${
    isMobile ? "AGENDA" : "MONTH"
  }&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=1`;

  useEffect(() => {
    // Reset loading state when calendar source changes
    setIsLoading(true);
    setHasError(false);
  }, [calendarSrc]);

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">         
        {`${props.charAt(0).toUpperCase()}${props.slice(1).toLowerCase()} Governance & Community Schedule`}
        </h3>
      </div>
      <div className="p-6">
        <div className="relative w-full" style={{ height: `600px` }}>
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white animate-pulse dark:bg-gray-800">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading calendar...
              </p>
              <div className="absolute inset-0 -z-10 w-full h-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white dark:bg-gray-800">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Unable to load calendar
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please check your connection and try again
              </p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  setHasError(false);
                }}
                className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          )}

          <iframe
            src={calendarSrc}
            className="w-full h-full rounded-md border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            title="Google Calendar"
          />
        </div>
      </div>
    </div>
  );
}

export default Communitycalendar;