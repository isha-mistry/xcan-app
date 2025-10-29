"use client";

import React, { useState, useEffect, ReactEventHandler } from "react";
import { DateTime } from "luxon";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { FaCircleInfo, FaPlus } from "react-icons/fa6";
import { Tooltip } from "@nextui-org/react";
import SchedulingSuccessModal from "./SchedulingSuccessModal";
import AvailableUserSessions from "./AvailableUserSessions";
import styles from "./ScheduleUserSessions.module.css";
import { fetchEnsNameAndAvatar } from "@/utils/ENSUtils";
import { usePrivy } from "@privy-io/react-auth";
import { useConnection } from "@/app/hooks/useConnection";
import { fetchApi } from "@/utils/api";

interface dataToStore {
  userAddress: `0x${string}` | undefined | null;
  timeSlotSizeMinutes: number;
  allowedDates: any;
  dateAndRanges: any;
}

function ScheduledUserSessions() {
  const { address } = useAccount();
  const { isConnected } = useConnection();
  const [timeSlotSizeMinutes, setTimeSlotSizeMinutes] = useState(30);
  const [selectedDate, setSelectedDate] = useState<any>("");
  const [dateAndRanges, setDateAndRanges] = useState<any>([]);
  const [allowedDates, setAllowedDates] = useState<any>([]);
  const { chain } = useAccount();
  const [utcStartTime, setUtcStartTime] = useState("");
  const [utcEndTime, setUtcEndTime] = useState("");
  const [allData, setAllData] = useState<any>([]);
  const [createSessionLoading, setCreateSessionLoading] = useState<any>();
  const [startTimeOptions, setStartTimeOptions] = useState([]);
  const [endTimeOptions, setEndTimeOptions] = useState([]);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [finalData, setFinalData] = useState<dataToStore>();
  const { ready, authenticated, login, logout, getAccessToken, user } =
    usePrivy();
  const [mailId, setMailId] = useState<string>();
  const [hasEmailID, setHasEmailID] = useState<Boolean>();
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [continueAPICalling, setContinueAPICalling] = useState<Boolean>(false);
  const [userRejected, setUserRejected] = useState<Boolean>();
  const [addingEmail, setAddingEmail] = useState<boolean>();
  const [scheduledSuccess, setScheduledSuccess] = useState<boolean>();
  const [sessionCreated, setSessionCreated] = useState(false);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);
  const [sessions, setSessions] = useState(0);
  const [startTime, setStartTime] = useState({
    hour: "12",
    minute: "00",
    ampm: "AM",
  });
  const [endTime, setEndTime] = useState({
    hour: "12",
    minute: "00",
    ampm: "AM",
  });
  const isTimeslotInPast = (date: any, time: any) => {
    const now = new Date();
    const slotDateTime = new Date(`${date} ${time}`);
    return slotDateTime < now;
  };

  const areAllSlotsPast = () => {
    if (timeSlots.length === 0) return false;
    const currentDate = new Date();
    return timeSlots.every((slot) => slot < currentDate);
  };

  const convertTo12Hour = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  useEffect(() => {
    if (selectedDate && startTime && endTime) {
      generateTimeSlots();
    }
  }, [selectedDate, startTime, endTime]);

  const handleTimeChange = (
    type: "start" | "end",
    field: "hour" | "minute" | "ampm",
    value: string
  ) => {
    if (type === "start") {
      setStartTime({ ...startTime, [field]: value });
    } else {
      setEndTime({ ...endTime, [field]: value });
    }
  };

  const generateTimeSlots = () => {
    const start = new Date(
      `${selectedDate} ${startTime.hour}:${startTime.minute} ${startTime.ampm}`
    );
    const end = new Date(
      `${selectedDate} ${endTime.hour}:${endTime.minute} ${endTime.ampm}`
    );

    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }

    const nextDay = new Date(start);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    if (end > nextDay) {
      toast.error(
        "Oops! Your end time is on the next day.For multi-day scheduling, please add each day separately."
      );
      setTimeSlots([]);
      setSessions(0);
      return;
    }

    const slots = [];
    let current = new Date(start);

    while (current < end) {
      slots.push(new Date(current));
      current.setMinutes(current.getMinutes() + 30);
    }

    setTimeSlots(slots);
    setSessions(slots.length);

    if (areAllSlotsPast()) {
      toast.error(
        "All generated time slots are in the past. Please select a future time range."
      );
    }
  };
  const [displayEnsName, setDisplayEnsName] = useState<any>();

  const checkUser = async () => {
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
        address: address,
      });

      const requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      const response = await fetchApi(
        `/profile/${address}`,
        requestOptions
      );
      const result = await response.json();
      if (Array.isArray(result.data) && result.data.length > 0) {
        // Iterate over each item in the response data array
        for (const item of result.data) {
          // Check if address and daoName match
          if (item.address === address) {
            if (item.emailId === null || item.emailId === "") {
              setHasEmailID(false);
              return false;
            } else if (item.emailId) {
              const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              const isValid = emailPattern.test(item.emailId);
              if (isValid) {
                setMailId(item.emailId);
                setContinueAPICalling(true);
                setHasEmailID(true);
                return true;
              } else {
                setContinueAPICalling(false);
                return false;
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  useEffect(() => {
    // checkUser();
    if (continueAPICalling) {
      handleApplyButtonClick();
    }
  }, [continueAPICalling]);

  useEffect(() => {
    const fetchEnsName = async () => {
      const ensName = await fetchEnsNameAndAvatar(
        address ? address : ""
      );
      if (ensName) {
        setDisplayEnsName(ensName?.ensName);
      } else {
        setDisplayEnsName("");
      }
    };
    if (address && isConnected) {
      fetchEnsName();
    }
  }, [chain, address, address]);

  useEffect(() => {
    const hasRejected = JSON.parse(
      sessionStorage.getItem("schedulingMailRejected") || "false"
    );
    setUserRejected(hasRejected);
  }, [userRejected, sessionStorage.getItem("schedulingMailRejected")]);

  const handleApplyWithCheck = async () => {
    if (allData.length > 0) {
      try {
        setCreateSessionLoading(true);

        if (!continueAPICalling || continueAPICalling === false) {
          setContinueAPICalling(true);
        } else if (continueAPICalling) {
          handleApplyButtonClick();

        }
        // if (continueAPICalling) {
        //   handleApplyButtonClick();
        // }
      } catch (error) {
        setCreateSessionLoading(false);
      }
    } else {
      toast.error(
        "Please select a time. After selecting, click 'Add Session' and then 'Create Session'"
      );
    }
  };

  const handleApplyButtonClick = async () => {
    const dataToStore: dataToStore = {
      userAddress: address as `0x${string}`,
      timeSlotSizeMinutes: timeSlotSizeMinutes,
      allowedDates: allowedDates,
      dateAndRanges: dateAndRanges,
    };
    setFinalData(dataToStore);
    const token = await getAccessToken();
    const myHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...(address && {
        "x-wallet-address": address,
        Authorization: `Bearer ${token}`,
      }),
    };
    const requestOptions: any = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(dataToStore),
      redirect: "follow",
    };

    try {
      setCreateSessionLoading(true);
      const response = await fetchApi("/store-availability", requestOptions);
      const result = await response.json();
      if (result.success) {
        setSuccessModalOpen(true);
        setCreateSessionLoading(false);
        setContinueAPICalling(false);
        setScheduledSuccess(true);
        setSessionCreated(true);
      } else {
        setScheduledSuccess(false);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error in scheduling your sessions.");
      setCreateSessionLoading(false);
      setContinueAPICalling(false);
    }
    setAllData([]);
    setAllowedDates([]);
    setDateAndRanges([]);
  };

  const getUTCTime = async (
    selectedDate: any,
    startHour: any,
    startMinute: any,
    endHour: any,
    endMinute: any
  ) => {
    const combinedDateTimeString_startTime = `${selectedDate} ${startHour}:${startMinute}:00`;
    const localDateTime_startTime = new Date(combinedDateTimeString_startTime);
    const utcDateTime_startTime = localDateTime_startTime.toUTCString();
    const formattedUTCTime_startTime = utcDateTime_startTime.toLocaleString();

    const utcFromFormatTime_startTime = DateTime.fromFormat(
      formattedUTCTime_startTime,
      "EEE, dd MMM yyyy HH:mm:ss 'GMT'"
    );
    const utcTime_startTime = utcFromFormatTime_startTime.toFormat("HH:mm");
    setUtcStartTime(utcTime_startTime);
    const [startHourTime, startMinuteTime] = utcTime_startTime.split(":");
    //----------------------------------------------------------------//
    const combinedDateTimeString_endTime = `${selectedDate} ${endHour}:${endMinute}:00`;
    const localDateTime_endTime = new Date(combinedDateTimeString_endTime);

    const utcDateTime_endTime = localDateTime_endTime.toUTCString();

    const formattedUTCTime_endTime = utcDateTime_endTime.toLocaleString();

    const utcFromFormatTime_endTime = DateTime.fromFormat(
      formattedUTCTime_endTime,
      "EEE, dd MMM yyyy HH:mm:ss 'GMT'"
    );
    const utcTime_endTime = utcFromFormatTime_endTime.toFormat("HH:mm");
    setUtcEndTime(utcTime_endTime);
    const [endHourTime, endMinuteTime] = utcTime_endTime.split(":");

    const result = {
      formattedUTCTime_startTime,
      utcTime_startTime,
      startHourTime,
      startMinuteTime,
      formattedUTCTime_endTime,
      utcTime_endTime,
      endHourTime,
      endMinuteTime,
    };
    return result;
  };

  const handleRemoveDate = (
    dateToRemove: string,
    timeRangesToRemove: any[]
  ) => {
    const indexToRemove = allData.findIndex(
      (item: any) =>
        item.date === dateToRemove &&
        JSON.stringify(item.timeRanges) === JSON.stringify(timeRangesToRemove)
    );

    if (indexToRemove !== -1) {
      const updatedDates = [...allData];
      updatedDates.splice(indexToRemove, 1);
      setAllData(updatedDates);

      const updatedDateAndRanges = [...dateAndRanges];
      updatedDateAndRanges.splice(indexToRemove, 1);
      setDateAndRanges(updatedDateAndRanges);

      const updatedAllowedDates = [...allowedDates];
      updatedAllowedDates.splice(indexToRemove, 1);
      setAllowedDates(updatedAllowedDates);
    }
  };

  const handleAddSelectedDate = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast.error("Please select a date and time ranges before adding.");
      return;
    }

    if (areAllSlotsPast()) {
      toast.error("Cannot add session. All time slots are in the past.");
      return;
    }

    const formatTime = (time: {
      hour: string;
      minute: string;
      ampm: string;
    }) => {
      let hour = parseInt(time.hour);
      if (time.ampm === "PM" && hour !== 12) hour += 12;
      if (time.ampm === "AM" && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, "0")}:${time.minute}`;
    };

    const formattedStartTime = formatTime(startTime);
    let formattedEndTime = formatTime(endTime); // Make this mutable

    // **NEW: Adjust end date to next day if end time is 12:00 AM**
    if (
      endTime.hour === "12" &&
      endTime.minute === "00" &&
      endTime.ampm === "AM"
    ) {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setSelectedDate(nextDay.toISOString().split("T")[0]); //update selectedDate

      // Reformat the end time to 11:59 PM to keep it on the previous day when it's 12:00 AM
      formattedEndTime = "23:59";
    }

    const newAllData = {
      date: selectedDate,
      timeRanges: [[formattedStartTime, formattedEndTime]],
    };

    const [startHour, startMinute] = formattedStartTime.split(":");
    const [endHour, endMinute] = formattedEndTime.split(":");

    setAllData((prevAllData: any) => [...prevAllData, newAllData]);
    const result = await getUTCTime(
      selectedDate,
      startHour,
      startMinute,
      endHour,
      endMinute
    );

    const newDateAndRange = {
      date: selectedDate,
      timeRanges: [
        [
          result.startHourTime,
          result.startMinuteTime,
          result.endHourTime,
          result.endMinuteTime,
        ],
      ],
      formattedUTCTime_startTime: result.formattedUTCTime_startTime,
      utcTime_startTime: result.utcTime_startTime,
      formattedUTCTime_endTime: result.formattedUTCTime_endTime,
      utcTime_endTime: result.utcTime_endTime,
    };

    setDateAndRanges((prevDateAndRanges: any) => [
      ...prevDateAndRanges,
      newDateAndRange,
    ]);
    setAllowedDates([...allowedDates, selectedDate]);
    setSelectedDate("");
    setStartTime({ hour: "12", minute: "00", ampm: "AM" });
    setEndTime({ hour: "12", minute: "00", ampm: "AM" });
    setSessions(0);
    setTimeSlots([]);
  };

  useEffect(() => {
    // Function to generate time options based on time slot size
    const generateTimeOptions = () => {
      const timeOptions: any = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += timeSlotSizeMinutes) {
          const formattedHour = hour.toString().padStart(2, "0");
          const formattedMinute = minute.toString().padStart(2, "0");
          timeOptions.push(`${formattedHour}:${formattedMinute}`);
        }
      }
      return timeOptions;
    };

    // Update time options when time slot size changes
    const timeOptions = generateTimeOptions();
    setStartTimeOptions(timeOptions);
    setEndTimeOptions(timeOptions);
  }, [timeSlotSizeMinutes]);

  const currentDate = new Date();
  let formattedDate = currentDate.toLocaleDateString();
  if (
    formattedDate.length !== 10 ||
    !formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)
  ) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    formattedDate = `${year}-${month}-${day}`;
  }

  const handleModalClose = () => {
    setSuccessModalOpen(false);
  };


  return (
    <>
      <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-10 1.5lg:gap-20 sm:p-4">
        {/* First box- left side */}
        <div
          className={`w-full md:w-auto p-6 xs:p-8 bg-gradient-to-br from-slate-700 to-transparent rounded-2xl ${styles.boxshadow} basis-1/2`}
        >
          <div className="mb-4">
            <label className="text-gray-300 font-semibold flex items-center">
              Select Time Slot Size:
              <Tooltip
                content={
                  <div className="font-robotoMono p-2 max-w-80 text-white rounded-md">
                    The duration for which you would be able to take the
                    session. The preferred duration is 30 minutes. And note that
                    the selected time slot size will apply to all the selected
                    dates of your sessions.
                  </div>
                }
                className="bg-gray-700"
                showArrow
                placement="right"
                delay={1}
              >
                <span className="px-2">
                  <FaCircleInfo className="cursor-pointer text-blue-500" />
                </span>
              </Tooltip>
            </label>
            <select
              value={timeSlotSizeMinutes}
              onChange={(e: any) => setTimeSlotSizeMinutes(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 mt-1 w-full cursor-pointer bg-transparent"
            >
              {/* <option value={15}>15 minutes</option> */}
              <option value={30}>30 minutes</option>
              <option value={45} disabled>
                {/* 45 minutes (Under development - It will be live soon) */}
                45 minutes (Under development)
              </option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-gray-300 font-semibold flex items-center">
              Select Date:
              <Tooltip
                content={
                  <div className="font-robotoMono p-2 text-white rounded-md">
                    It is based on your timezone.
                  </div>
                }
                showArrow
                placement="right"
                delay={1}
                className="bg-gray-700"
              >
                <span className="px-2">
                  <FaCircleInfo className="cursor-pointer text-blue-500" />
                </span>
              </Tooltip>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 mt-1 w-full bg-transparent cursor-pointer hover:border-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-300 outline-none transition-colors duration-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              min={formattedDate}
              onClick={(e) => e.currentTarget.showPicker()}
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="text-gray-300 font-semibold flex items-center">
              Select Available Time:
              <Tooltip
                content={
                  <div className="font-robotoMono p-2 max-w-80 text-white rounded-md">
                    Session start time and end time based on your timezone.
                  </div>
                }
                showArrow
                placement="right"
                delay={1}
                className="bg-gray-700"
              >
                <span className="px-2">
                  <FaCircleInfo className="cursor-pointer text-blue-500" />
                </span>
              </Tooltip>
            </label>

            <div className="grid grid-cols-1 xm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-300 mt-2">Start Time</label>
                <div className="rounded-md flex items-center space-x-2">
                  <select
                    value={startTime.hour}
                    className="p-2 border rounded cursor-pointer bg-slate-700"
                    onChange={(e) =>
                      handleTimeChange("start", "hour", e.target.value)
                    }
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={String(i + 1).padStart(2, "0")}>
                        {String(i + 1).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span>:</span>
                  <select
                    value={startTime.minute}
                    className="p-2 border rounded cursor-pointer bg-slate-700"
                    onChange={(e) =>
                      handleTimeChange("start", "minute", e.target.value)
                    }
                  >
                    <option value="00">00</option>
                    <option value="30">30</option>
                  </select>
                  <select
                    value={startTime.ampm}
                    className="p-2 border rounded cursor-pointer bg-slate-700"
                    onChange={(e) =>
                      handleTimeChange("start", "ampm", e.target.value)
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-gray-300 mt-1">End Time</label>
                <div className="rounded-md flex items-center space-x-2">
                  <select
                    value={endTime.hour}
                    className="p-2 border rounded cursor-pointer bg-slate-700"
                    onChange={(e) =>
                      handleTimeChange("end", "hour", e.target.value)
                    }
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={String(i + 1).padStart(2, "0")}>
                        {String(i + 1).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span>:</span>
                  <select
                    value={endTime.minute}
                    className="p-2 border rounded cursor-pointer bg-slate-700"
                    onChange={(e) =>
                      handleTimeChange("end", "minute", e.target.value)
                    }
                  >
                    <option value="00">00</option>
                    <option value="30">30</option>
                  </select>
                  <select
                    value={endTime.ampm}
                    className="p-2 border rounded cursor-pointer bg-slate-700"
                    onChange={(e) =>
                      handleTimeChange("end", "ampm", e.target.value)
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-gray-300 font-semibold flex items-center">
                Total Session Count:
                <Tooltip
                  content={
                    <div className="font-robotoMono p-2 max-w-80 text-white rounded-md">
                      Displays the number of individual time slots available for
                      booking, calculated based on your selected time range and
                      slot duration.
                    </div>
                  }
                  showArrow
                  placement="right"
                  delay={1}
                  className="bg-gray-700"
                >
                  <span className="px-2">
                    <FaCircleInfo className="cursor-pointer text-blue-500" />
                  </span>
                </Tooltip>
              </label>
              <div className="border border-gray-300 rounded px-3 py-2 mt-1 w-full cursor-pointer ">
                {sessions}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {timeSlots.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Generated Time Slots:
                  </h3>
                  <div className="grid grid-cols-3 xs:grid-cols-4 md:grid-cols-3 lg:grid-cols-4  gap-2 w-full">
                    {timeSlots.map((slot, index) => {
                      const slotTime = slot.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: false,
                      });
                      const isPast =
                        selectedDate ===
                        new Date().toISOString().split("T")[0] &&
                        isTimeslotInPast(selectedDate, slotTime);
                      return (
                        <div
                          key={index}
                          className={`shadow p-1.5 rounded-md flex flex-col items-center text-left basis-1/3 text-sm font-robotoMono ${isPast
                            ? "bg-red-100 text-red-500"
                            : "bg-slate-800 hover:bg-slate-700"
                            }`}
                        >
                          {slot.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                          {isPast && <span className="text-xs">(Past)</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleAddSelectedDate}
            disabled={areAllSlotsPast()}
            className={`bg-blue-shade-100 hover:bg-blue-shade-200 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out ${areAllSlotsPast()
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
              }`}
          >
            <span className="flex items-center gap-3">
              <FaPlus className="" />
              Add Session
            </span>
          </button>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">
              Selected Dates for Session:
            </h3>
            <div className="grid gap-4">
              {allData.map((item: any, index: any) => (
                <div
                  key={index}
                  className="bg-slate-700 p-4 rounded-lg shadow-md flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-300">{item.date}</p>
                    <p className="text-gray-200">
                      {item.timeRanges
                        .map((time: any) => {
                          const [startTime, endTime] = time;
                          const start12 = convertTo12Hour(startTime);
                          const end12 = convertTo12Hour(endTime);
                          return `${start12} to ${end12}`;
                        })
                        .join(", ")}
                    </p>
                  </div>
                  <button
                    disabled={createSessionLoading}
                    onClick={() => handleRemoveDate(item.date, item.timeRanges)}
                    className={`text-red-600 ml-2 px-3 py-1 rounded-full ${createSessionLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-red-100"
                      }`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleApplyWithCheck()}
            className={`${createSessionLoading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
              } text-white font-bold py-3 px-4 rounded-3xl mt-4 w-[160px] flex justify-center items-center`}
            disabled={createSessionLoading}
          >
            {createSessionLoading ? (
              <Oval
                visible={true}
                height="28"
                width="28"
                color="#ffffff"
                secondaryColor="#cdccff"
                ariaLabel="oval-loading"
                wrapperClass="flex justify-center items-center"
              />
            ) : (
              "Create Session"
            )}
          </button>
        </div>

        {/* Second box- right side */}
        <div
          className={`w-full md:w-auto p-6 xs:p-8 bg-gradient-to-br from-slate-700 to-transparent bg-opacity-70 rounded-2xl ${styles.boxshadow} basis-1/2`}
        >
          <AvailableUserSessions
            scheduledSuccess={scheduledSuccess}
            setScheduledSuccess={setScheduledSuccess}
            sessionCreated={sessionCreated}
            setSessionCreated={setSessionCreated}
          />
        </div>
      </div>

      {/* {modalOpen && ( */}
      {successModalOpen && (
        <SchedulingSuccessModal
          isOpen={successModalOpen}
          onClose={handleModalClose}
          data={finalData}
        />
      )}
    </>
  );
}

export default ScheduledUserSessions;
