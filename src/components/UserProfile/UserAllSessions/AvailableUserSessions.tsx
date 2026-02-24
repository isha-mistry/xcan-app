"use client";
import React, { useEffect, useState } from "react";
import { ImBin } from "react-icons/im";
import { FaPencilAlt } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useAccount } from "wagmi";
import { Grid } from "react-loader-spinner";
import { motion, AnimatePresence } from "framer-motion";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import { useConnection } from "@/app/hooks/useConnection";

interface AvailableUserSessionsProps {
  scheduledSuccess: boolean | undefined;
  setScheduledSuccess: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
  sessionCreated: boolean;
  setSessionCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

function AvailableUserSessions({
  scheduledSuccess,
  setScheduledSuccess,
  sessionCreated,
  setSessionCreated,
}: AvailableUserSessionsProps) {
  const { address } = useAccount();
  const { isConnected } = useConnection()
  const [data, setData] = useState([]);
  const [dataLoading, setDataLoading] = useState<Boolean>(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const token = await getAccessToken();
        const myHeaders: HeadersInit = {
          "Content-Type": "application/json",
          ...(address && {
            "x-wallet-address": address,
            Authorization: `Bearer ${token}`,
          }),
        };

        const raw = JSON.stringify({
          userAddress: address,
        });

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
        };

        const response = await fetch("/api/get-availability", requestOptions);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          setDataLoading(false);
          // setScheduledSuccess(false);
          setSessionCreated(false);
        }
      } catch (error) {
        console.error(error);
        setDataLoading(false);
        toast.error("Failed to fetch data.");
      }
    };
    if (address) {
      fetchData();
    }
  }, [
    address,
    scheduledSuccess === true,
    sessionCreated,
    updateTrigger,
  ]);

  return (
    <div className="">
      <h1 className="text-white/80 font-bold text-lg mb-6 flex justify-center uppercase tracking-widest font-unbounded">
        Your Scheduled Availability
      </h1>
      {dataLoading ? (
        <div className="flex justify-center items-center py-10">
          <Grid
            visible={true}
            height="40"
            width="40"
            color="#3b82f6"
            ariaLabel="grid-loading"
            radius="12.5"
          />
        </div>
      ) : data.length > 0 ? (
        <div className="space-y-8">
          {data.some((item: any) => item.timeSlotSizeMinutes === 15) && (
            <TimeSlotTable
              title="15 Minutes"
              slotSize={15}
              data={data.filter((item: any) => item.timeSlotSizeMinutes === 15)}
              setData={setData}
              triggerUpdate={() => setUpdateTrigger((prev) => prev + 1)}
            />
          )}
          {data.some((item: any) => item.timeSlotSizeMinutes === 30) && (
            <TimeSlotTable
              title="30 Minutes"
              slotSize={30}
              data={data.filter((item: any) => item.timeSlotSizeMinutes === 30)}
              setData={setData}
              triggerUpdate={() => setUpdateTrigger((prev) => prev + 1)}
            />
          )}
          {data.some((item: any) => item.timeSlotSizeMinutes === 45) && (
            <TimeSlotTable
              title="45 Minutes"
              slotSize={45}
              data={data.filter((item: any) => item.timeSlotSizeMinutes === 45)}
              setData={setData}
              triggerUpdate={() => setUpdateTrigger((prev) => prev + 1)}
            />
          )}
        </div>
      ) : (
        <div className="text-center text-white/40 py-10 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-xl">
          No Scheduled Available Time
        </div>
      )}
    </div>
  );
}

export default AvailableUserSessions;

function TimeSlotTable({
  title,
  data,
  slotSize,
  setData,
  triggerUpdate,
}: any) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const { address } = useAccount()

  const handleButtonClick = () => {
    toast("Coming soon 🚀");
  };

  const handleDeleteButtonClick = async ({ date, startTime, endTime }: any) => {
    setDeleting(date);

    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(address && {
          "x-wallet-address": address,
          Authorization: `Bearer ${token}`,
        }),
      };

      const raw = JSON.stringify({
        userAddress: address,
        timeSlotSizeMinutes: slotSize,
        date: date,
        startTime: startTime,
        endTime: endTime,
      });

      const requestOptions: any = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetchApi("/get-availability", requestOptions);
      const result = await response.json();

      if (result.success) {
        toast.success("Deleted successfully!");
        setData((prevData: any) =>
          prevData
            .map((item: any) => ({
              ...item,
              dateAndRanges: item.dateAndRanges.map((range: any) => ({
                ...range,
                timeRanges: range.timeRanges.filter(
                  (timeRange: any) =>
                    !(
                      timeRange.startTime === startTime &&
                      timeRange.endTime === endTime &&
                      range.date === date
                    )
                ),
              })),
            }))
            .filter((item: any) =>
              item.dateAndRanges.some(
                (range: any) => range.timeRanges.length > 0
              )
            )
        );
      }
      triggerUpdate();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete.");
    } finally {
      setDeleting(null);
    }
  };

  const convertUTCToLocalDate = (dateString: any) => {
    const date: any = new Date(dateString);
    let newDate = date.toLocaleDateString();
    if (newDate.length !== 10 || !newDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      newDate = `${year}-${month}-${day}`;
    }
    return newDate;
  };

  const convertUTCToLocalTime = (dateString: any, timeArray: any) => {
    const [hourStart, minuteStart, hourEnd, minuteEnd] = timeArray;

    const startDate = new Date(
      `${dateString}T${hourStart.padStart(2, "0")}:${minuteStart.padStart(
        2,
        "0"
      )}:00Z`
    );
    const endDate = new Date(
      `${dateString}T${hourEnd.padStart(2, "0")}:${minuteEnd.padStart(
        2,
        "0"
      )}:00Z`
    );

    const options: any = { hour: "2-digit", minute: "2-digit" };
    const localStartTime = new Intl.DateTimeFormat([], options).format(
      startDate
    );
    const localEndTime = new Intl.DateTimeFormat([], options).format(endDate);

    return `${localStartTime} to ${localEndTime}`;
  };

  return (
    <>
      <p className="text-white/60 font-bold mb-4 flex items-center tracking-tight uppercase text-xs">
        <span className="bg-primary/20 text-primary px-3 py-1 rounded-md mr-3 border border-primary/20">
          {title}
        </span>
      </p>
      <div className="grid grid-cols-1 xm:grid-cols-2 gap-4">
        <AnimatePresence>
          {data.map((item: any, index: number) =>
            item.dateAndRanges.map((dateRange: any, subIndex: number) =>
              dateRange.timeRanges.map((timeRange: any, timeIndex: number) => (
                <motion.div
                  key={`${index}-${subIndex}-${timeIndex}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex justify-between items-center group hover:bg-white/[0.06] transition-all duration-300 shadow-xl"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-white font-robotoMono">
                      {convertUTCToLocalDate(dateRange.date)}
                    </p>
                    <p className="text-sm text-white/50">{convertUTCToLocalTime(dateRange.date, timeRange)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-3 bg-white/5 text-primary hover:bg-primary hover:text-white rounded-xl transition-all duration-300 border border-white/5 hover:border-primary/50"
                      onClick={handleButtonClick}
                    >
                      <FaPencilAlt className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-3 bg-white/5 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 border border-white/5 hover:border-red-500/50 ${deleting === dateRange.date
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                        }`}
                      onClick={() => {
                        handleDeleteButtonClick({
                          date: dateRange.date,
                          startTime: dateRange.utcTime_startTime,
                          endTime: dateRange.utcTime_endTime,
                        });
                      }}
                      disabled={deleting === dateRange.date}
                    >
                      <ImBin className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>

              ))
            )
          )}
        </AnimatePresence>
      </div >
    </>
  );
}