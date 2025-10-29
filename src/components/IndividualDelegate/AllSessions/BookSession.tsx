"use client";

import React, { useState, useEffect } from "react";
import DayTimeScheduler from "@captainwalterdev/daytimescheduler";
import { useAccount } from "wagmi";
import { isSameDay } from "date-fns";
import { useSession } from "next-auth/react";
import { Oval, ThreeDots } from "react-loader-spinner";
import styled from "styled-components";
import { useDisclosure } from "@nextui-org/react";
import toast from "react-hot-toast";
import BookingSuccessModal from "./BookingSuccessModal";
import { MdCancel } from "react-icons/md";
import { useRouter } from "next-nprogress-bar";
import { usePrivy } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import { useConnection } from "@/app/hooks/useConnection";
interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

const StyledCalendarContainer = styled.div`
  .calendar-container {
    background-color: #0f172a;
    color: #ffffff;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid #1e40af;
  }

  .calendar-container > div > ul {
    height: 450px; !important
    overflow-y: auto;
    background-color: #0f172a;
    color: #ffffff;
  }

  /* Style for the calendar header */
  .calendar-container > div > div:first-child {
    background-color: #0f172a;
    color: #ffffff;
    border-bottom: 1px solid #1e40af;
  }

  /* Style for the time slots */
  .calendar-container > div > ul > li {
    background-color: #1e3a8a;
    color: #ffffff;
    border: 1px solid #2563eb;
    margin: 4px 0;
  }

  /* Style for selected time slot */
  .calendar-container > div > ul > li.selected {
    background-color: #3b82f6;
    color: #ffffff;
  }

  /* Style for disabled time slot */
  .calendar-container > div > ul > li.disabled {
    background-color: #0f172a;
    color: #93c5fd;
  }

  /* Style for the calendar navigation buttons */
  .calendar-container button {
    background-color: #1e3a8a;
    color: #ffffff;
    border: 1px solid #2563eb;
  }

  /* Style for the calendar days */
  .calendar-container .calendar-day {
    background-color: #1e3a8a;
    color: #ffffff;
  }

  /* Style for the current day */
  .calendar-container .calendar-day.today {
    background-color: #3b82f6;
    color: #ffffff;
  }

  /* Styles for the time slot selection view */
  .calendar-container > div > div:nth-child(2) {
    background-color: #0f172a;
    color: #ffffff;
  }

  /* Style for the time slot selection header */
  .calendar-container > div > div:nth-child(2) > div:first-child {
    background-color: #0f172a;
    color: #ffffff;
    border-bottom: 1px solid #1e40af;
  }

  /* Style for the time slot selection list */
  .calendar-container > div > div:nth-child(2) > div:nth-child(2) {
    background-color: #0f172a;
    color: #ffffff;
  }

  /* Style for individual time slots in selection view */
  .calendar-container > div > div:nth-child(2) > div:nth-child(2) > div {
    background-color: #1e3a8a;
    color: #ffffff;
    border: 1px solid #2563eb;
    margin: 4px 0;
  }

  /* Style for selected time slot in selection view */
  .calendar-container > div > div:nth-child(2) > div:nth-child(2) > div.selected {
    background-color: #3b82f6;
    color: #ffffff;
  }

  /* Style for disabled time slot in selection view */
  .calendar-container > div > div:nth-child(2) > div:nth-child(2) > div.disabled {
    background-color: #0f172a;
    color: #93c5fd;
  }

  /* Style for the back button in time slot selection */
  .calendar-container > div > div:nth-child(2) > div:first-child > button {
    background-color: #1e3a8a;
    color: #ffffff;
    border: 1px solid #2563eb;
  }

  /* Style for the confirm button in time slot selection */
  .calendar-container > div > div:nth-child(2) > div:last-child > button {
    background-color: #3b82f6;
    color: #ffffff;
    border: none;
  }

  /* Style for the confirm button when disabled */
  .calendar-container > div > div:nth-child(2) > div:last-child > button:disabled {
    background-color: #0f172a;
    color: #93c5fd;
  }

  @media (max-width: 640px) {
    .calendar-container > div > ul {
      min-height: 250px;
      max-height: 350px;
    }
  }

  @media (max-width: 380px) {
    .calendar-container > div > ul {
      min-height: 200px;
      max-height: 300px;
    }
  }
`;

function BookSession({ props }: { props: Type }) {
  const router = useRouter();
  const host_address = props.individualDelegate;
  const { address } = useAccount();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [isScheduling, setIsScheduling] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleErr, setScheduleErr] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [APIData, setAPIData] = useState<any>();
  const [APIBookings, setAPIBookings] = useState<any>();
  const [bookedSlots, setBookedSlots] = useState<any>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [dateInfo, setDateInfo] = useState();
  const [modalData, setModalData] = useState({
    dao_name: "",
    date: "",
    title: "",
    description: "",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirmSave, setConfirmSave] = useState(false);
  const [slotTimes, setSlotTimes] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isemailModal, setMailModal] = useState(false);

  const [mailId, setMailId] = useState<string>();
  const [checkUserMail, setCheckUserMail] = useState(false);
  const [continueAPICalling, setContinueAPICalling] = useState<Boolean>(false);
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);
  const { ready, authenticated, login, logout, getAccessToken, user } =
    usePrivy();
  const { isConnected } = useConnection();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const dataRequest = async (data: any) => {
    setIsScheduling(true);
    setScheduleErr("");

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          status: "ok",
          scheduled: data,
        });
      }, 1000);
    });
  };

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    const loadData = async () => {
      try {
        const [availabilityResponse, slotTimeResponse] = await Promise.all([
          fetch(`/api/get-availability/${host_address}`),
          fetchApi(`/get-meeting/${host_address}`),
        ]);

        const availabilityResult = await availabilityResponse.json();
        const slotTimeResult = await slotTimeResponse.json();

        if (availabilityResult.success && slotTimeResult.success) {
          setAPIData(availabilityResult.data);
          setAPIBookings(slotTimeResult.data);
          const extractedSlotTimes = slotTimeResult.data.map(
            (item: any) => new Date(item.slot_time)
          );
          setSlotTimes(extractedSlotTimes);
          setIsPageLoading(false);
          const newBookedSlots: any = [
            ...bookedSlots,
            ...extractedSlotTimes, // Spread the extractedSlotTimes array
          ];

          setBookedSlots(newBookedSlots);
          setIsLoading(false);
        }
      } catch (error) {
        setIsPageLoading(false);
        setIsLoading(false);
        // Handle error
      }
    };

    loadData();
    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [address, authenticated, session]);

  const handleModalInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setModalData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleScheduled = async (data: any) => {
    if (authenticated) {
      if (host_address === address) {
        toast("Experts can not book their own sessions!");
      } else {
        setIsScheduling(true);
        setScheduleErr("");
        setDateInfo(data);
        onOpen();
      }
    } else {
      if (!authenticated) {
        // openConnectModal();
        login();
      }
    }
  };

  useEffect(() => {
    if (continueAPICalling && !isApiCallInProgress) {
      apiCall();
    }
  }, [continueAPICalling]);

  const checkBeforeApiCall = async () => {
    if (isApiCallInProgress || confirmSave) {
      return; // Prevent multiple simultaneous calls
    }

    if (modalData.title.length > 0 && modalData.description.length > 0) {
      try {
        setConfirmSave(true);

        if (!continueAPICalling || continueAPICalling === false) {
          setContinueAPICalling(true);
        } else if (continueAPICalling) {
          apiCall();
        }
      } catch (error) {
        setConfirmSave(false);
      }
    } else {
      toast.error("Please enter title and description!");
    }
  };

  const createRandomRoom = async () => {
    const res = await fetch(`/api/create-room`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await res.json();
    const roomId = await result.data;
    return roomId;
  };
  const apiCall = async () => {
    // Set flag to prevent multiple simultaneous API calls
    if (isApiCallInProgress) {
      return;
    }

    setIsApiCallInProgress(true);

    try {
      let roomId = await createRandomRoom();

      const requestData = {
        slot_time: dateInfo,
        title: modalData.title,
        description: modalData.description,
        host_address: host_address,
        attendees: [
          {
            attendee_address: address,
            attendee_joined_status: "Pending",
          },
        ],
        meeting_status: "Upcoming",
        booking_status: "Approved",
        session_type: "session",
        meetingId: roomId,
        host_joined_status: "Pending",
        dao_name: "arbitrum",
      };

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
        body: JSON.stringify(requestData),
        redirect: "follow",
      };

      // try {
      //   setConfirmSave(true);
      const response = await fetchApi("/book-slot", requestOptions);
      const result = await response.json();
      if (result.success) {
        setIsScheduled(true);
        // setConfirmSave(false);
        setModalOpen(true);
      }
    } catch (error) {
      // setConfirmSave(false);
      // setIsScheduled(false);
      console.error("Error:", error);
    } finally {
      // Reset all the states
      setConfirmSave(false);
      setIsApiCallInProgress(false);
      setIsScheduling(false);
      setContinueAPICalling(false);

      setModalData({
        dao_name: "",
        date: "",
        title: "",
        description: "",
      });
      onClose();
    }
  };

  const timeSlotSizeMinutes = 30;
  let dateAndRanges: any = [];
  let allowedDates: any = [];

  if (APIData) {
    APIData.forEach((item: any) => {
      dateAndRanges.push(...item.dateAndRanges);
      allowedDates.push(...item.allowedDates);
    });

    dateAndRanges.forEach((range: any) => {
      range.date = new Date(range.date);
      range.formattedUTCTime_startTime = new Date(
        range.formattedUTCTime_startTime
      );
      range.formattedUTCTime_endTime = new Date(range.formattedUTCTime_endTime);

      const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: false };
      const formattedStartTime =
        range.formattedUTCTime_startTime.toLocaleTimeString(
          undefined,
          timeOptions
        );
      const formattedEndTime =
        range.formattedUTCTime_endTime.toLocaleTimeString(
          undefined,
          timeOptions
        );

      range.utcTime_startTime = formattedStartTime;
      range.utcTime_endTime = formattedEndTime;

      const [startHourTime, startMinuteTime] = formattedStartTime.split(":");
      const [endHourTime, endMinuteTime] = formattedEndTime.split(":");

      range.timeRanges = [
        [startHourTime, startMinuteTime, endHourTime, endMinuteTime],
      ];
    });

    allowedDates = [
      ...new Set(
        dateAndRanges.flatMap(
          ({ formattedUTCTime_startTime, formattedUTCTime_endTime }: any) => [
            formattedUTCTime_startTime,
            formattedUTCTime_endTime,
          ]
        )
      ),
    ];
  }

  function subtractOneMinute(date: any) {
    let newDate = new Date(date);
    newDate.setTime(newDate.getTime() - 60000);
    return newDate;
  }

  function timeSlotValidator(
    slotTime: any,
    dateAndRanges: any,
    bookedSlots: any
  ) {
    dateAndRanges = dateAndRanges.map((range: any) => ({
      formattedUTCTime_startTime: range.formattedUTCTime_startTime,
      formattedUTCTime_endTime: subtractOneMinute(
        range.formattedUTCTime_endTime
      ),
    }));
    for (const {
      formattedUTCTime_startTime: startTime,
      formattedUTCTime_endTime: endTime,
    } of dateAndRanges) {
      if (
        slotTime.getTime() >= startTime.getTime() &&
        slotTime.getTime() <= endTime.getTime()
      ) {
        const isBooked = bookedSlots.some((bookedSlot: any) => {
          return (
            isSameDay(startTime, bookedSlot) &&
            slotTime.getHours() === bookedSlot.getHours() &&
            slotTime.getMinutes() === bookedSlot.getMinutes()
          );
        });

        if (!isBooked) {
          return true;
        }
      }
    }

    return false;
  }

  const handleModalClose = () => {
    setModalOpen(false);
    router.push(`/profile/${address}?active=sessions&session=attending`);
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <>
      {isPageLoading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Oval
            visible={true}
            height="40"
            width="40"
            color="#3b82f6"
            secondaryColor="#93c5fd"
            ariaLabel="oval-loading"
          />
        </div>
      ) : (
        <div className="flex justify-center w-full px-4 sm:px-6 md:px-8 min-h-[calc(100vh-200px)]">
          <div className="w-full max-w-md mx-auto mt-8 rounded-2xl shadow-lg">
            <StyledCalendarContainer>
              <div className="calendar-container">
                <DayTimeScheduler
                  allowedDates={allowedDates}
                  timeSlotSizeMinutes={timeSlotSizeMinutes}
                  isLoading={isScheduling}
                  isDone={isScheduled}
                  err={scheduleErr}
                  onConfirm={handleScheduled}
                  timeSlotValidator={(slotTime: any) =>
                    timeSlotValidator(slotTime, dateAndRanges, bookedSlots)
                  }
                />
              </div>
            </StyledCalendarContainer>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="font-robotoMono z-[70] fixed inset-0 flex items-center justify-center backdrop-blur-md"
          style={{ boxShadow: " 0px 0px 45px -17px rgba(0,0,0,0.75)" }}
        >
          <div className="bg-[#0f172a] border border-[#dce4f6] rounded-[41px] overflow-hidden shadow-lg w-full max-w-lg mx-4">
            <div className="relative">
              <div className="flex flex-col gap-1 text-white bg-[#1e3a8a] p-4 py-7">
                <div className="flex items-center justify-between mx-4">
                  <h2 className="text-base sm:text-lg font-semibold pr-8 break-words">
                    Book your slot
                  </h2>
                  <button
                    className="flex-shrink-0"
                    onClick={() => {
                      onClose();
                      setIsScheduling(false);
                    }}
                    disabled={confirmSave || isApiCallInProgress}
                  >
                    <MdCancel className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>
                </div>
              </div>
              <div className="px-4 sm:px-8 py-4 bg-[#0f172a]">
                <div className="mt-4">
                  <label className="block mb-2 font-semibold text-sm sm:text-base text-white">
                    Title:
                  </label>
                  <input
                    disabled={confirmSave || isApiCallInProgress}
                    type="text"
                    name="title"
                    value={modalData.title}
                    onChange={handleModalInputChange}
                    placeholder="Explain Governance"
                    className="w-full px-3 sm:px-4 text-sm sm:text-base py-2 border rounded-xl bg-[#1e3a8a] text-white placeholder-gray-400 border-[#2563eb]"
                    required
                  />
                </div>
                <div className="mt-4">
                  <label className="block mb-2 font-semibold text-sm sm:text-base text-white">
                    Description:
                  </label>
                  <textarea
                    disabled={confirmSave || isApiCallInProgress}
                    name="description"
                    value={modalData.description}
                    onChange={handleModalInputChange}
                    placeholder="Please share anything that will help prepare for our meeting."
                    className="w-full px-3 sm:px-4 py-2 border rounded-xl bg-[#1e3a8a] text-white placeholder-gray-400 min-h-[100px] text-sm sm:text-base border-[#2563eb]"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-center px-4 sm:px-8 py-4 bg-[#0f172a]">
                <button
                  className="bg-[#3b82f6] text-white px-6 sm:px-8 py-2 sm:py-3 font-semibold rounded-full text-sm sm:text-base w-full sm:w-auto disabled:bg-[#1e3a8a] hover:bg-[#2563eb] transition-colors"
                  onClick={checkBeforeApiCall}
                  disabled={
                    confirmSave ||
                    isApiCallInProgress ||
                    !modalData.title ||
                    !modalData.description
                  }
                >
                  {confirmSave || isApiCallInProgress ? (
                    <div className="flex items-center justify-center">
                      <Oval
                        visible={true}
                        height="20"
                        width="20"
                        color="#ffffff"
                        secondaryColor="#93c5fd"
                        ariaLabel="oval-loading"
                      />
                    </div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <BookingSuccessModal isOpen={modalOpen} onClose={handleModalClose} />
      )}
    </>
  );
}

export default BookSession;
