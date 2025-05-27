"use client";

import React, { useState, useEffect } from "react";
import DayTimeScheduler from "@captainwalterdev/daytimescheduler";
import { useAccount, useSwitchChain } from "wagmi";
import { DateTime, Duration } from "luxon";

import { isSameDay } from "date-fns";

import { useSession } from "next-auth/react";
import { Oval, ThreeDots } from "react-loader-spinner";
import styled from "styled-components";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import SchedulingSuccessModal from "@/components/UserProfile/UserAllSessions/SchedulingSuccessModal";
import BookingSuccessModal from "./BookingSuccessModal";
import AddEmailModal from "@/components/ComponentUtils/AddEmailModal";
import { RxCross2 } from "react-icons/rx";
import { MdCancel } from "react-icons/md";
import { useRouter } from "next-nprogress-bar";
import { usePrivy } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import { daoConfigs } from "@/config/daos";
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
  const [hasEmailID, setHasEmailID] = useState<Boolean>();
  const [showGetMailModal, setShowGetMailModal] = useState<Boolean>();
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [continueAPICalling, setContinueAPICalling] = useState<Boolean>(false);
  const [userRejected, setUserRejected] = useState<Boolean>();
  const [addingEmail, setAddingEmail] = useState<boolean>();
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);
  const { ready, authenticated, login, logout, getAccessToken, user } =
    usePrivy();
  const { isConnected } = useConnection()

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
        toast("Delegates can not book their own sessions!");
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
    const hasRejected = JSON.parse(
      sessionStorage.getItem("bookingMailRejected") || "false"
    );
    setUserRejected(hasRejected);
  }, [userRejected, sessionStorage.getItem("bookingMailRejected")]);

  useEffect(() => {
    if (continueAPICalling && !isApiCallInProgress) {
      apiCall();
    }
  }, [continueAPICalling]);

  useEffect(() => {
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
          for (const item of result.data) {
            if (item.address === address) {
              if (item.emailId === null || item.emailId === "") {
                setHasEmailID(false);
                return false;
              } else if (item.emailId) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isValid = emailPattern.test(item.emailId);
                if (isValid) {
                  setMailId(item.emailId);
                  setHasEmailID(true);
                  return true;
                } else {
                  return false;
                }
              }
            }
          }
        }
      } catch (error) {
        // toast.error("An error occurred while checking user information");
        return false;
      }
    };

    const runCheck = async () => {
      let checkMail = await checkUser();
      // console.log('ChekMail',checkMail);
      setCheckUserMail(checkMail ? checkMail : false);
    };

    runCheck(); // Call the async function inside the effect
  }, [address]); // Include walletAddress or other dependencies

  const checkBeforeApiCall = async () => {
    if (isApiCallInProgress || confirmSave) {
      return; // Prevent multiple simultaneous calls
    }

    if (modalData.title.length > 0 && modalData.description.length > 0) {
      try {
        setConfirmSave(true);
        const userRejectedLocal: any = await sessionStorage.getItem(
          "bookingMailRejected"
        );
        if (!checkUserMail && (!userRejected || !userRejectedLocal)) {
          setShowGetMailModal(true);
        } else {
          if (!continueAPICalling || continueAPICalling === false) {
            setContinueAPICalling(true);
          } else if (continueAPICalling) {
            apiCall();
          }
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

  const handleEmailChange = (email: string) => {
    setMailId(email);
    setIsValidEmail(validateEmail(email));
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    if (address && isConnected) {
      if (mailId && (mailId !== "" || mailId !== undefined)) {
        if (isValidEmail) {
          try {
            setAddingEmail(true);
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
              emailId: mailId,
            });

            const requestOptions: any = {
              method: "PUT",
              headers: myHeaders,
              body: raw,
              redirect: "follow",
            };

            const response = await fetchApi("/profile", requestOptions);
            const result = await response.json();
            if (result.success) {
              setContinueAPICalling(true);
              setAddingEmail(false);
            }
            setShowGetMailModal(false);
          } catch (error) {
            setAddingEmail(false);
          }
        } else {
          toast.error("Enter Valid Email");
          setShowGetMailModal(true);
        }
      } else {
        toast.error("Enter Valid Email");
        setShowGetMailModal(true);
      }
    }
  };

  const handleGetMailModalClose = () => {
    if (!userRejected) {
      sessionStorage.setItem("bookingMailRejected", JSON.stringify(true));
      setUserRejected(true);
    }
    setContinueAPICalling(true);
    setShowGetMailModal(false);
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
          className="font-tektur z-[70] fixed inset-0 flex items-center justify-center backdrop-blur-md"
          style={{ boxShadow: " 0px 0px 45px -17px rgba(0,0,0,0.75)" }}
        >
          <div className="bg-[#0f172a] rounded-[41px] overflow-hidden shadow-lg w-full max-w-lg mx-4">
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

      {showGetMailModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-white rounded-[41px] shadow-lg w-full max-w-lg mx-4 p-6 relative animate-fadeIn">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 transition-all"
              onClick={handleGetMailModalClose}
              disabled={addingEmail || isApiCallInProgress}
            >
              <MdCancel className="w-6 h-6" />
            </button>

            {/* Title */}
            <h2 className="text-blue-shade-200 font-semibold text-sm sm:text-base text-center">
              Get Notified About Your Session Request
            </h2>

            {/* Subtitle */}
            <p className="text-gray-500 text-xs sm:text-sm text-center mt-2">
              Add your email address to get notified when the delegate approves
              or rejects your session request.
            </p>

            {/* Email Input & Button */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={mailId || ""}
                placeholder="Enter email address"
                onChange={(e) => handleEmailChange(e.target.value)}
                className="flex-1 px-4 py-2 rounded-3xl bg-[#D9D9D945] text-sm sm:text-base outline-none focus:ring-2 focus:ring-gray-400 transition-all"
              />
              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto bg-black text-white px-6 sm:px-8 py-2 sm:py-3 rounded-3xl hover:bg-gray-900 text-sm sm:text-base flex items-center justify-center"
                disabled={addingEmail || isApiCallInProgress}
              >
                {addingEmail ? (
                  <ThreeDots
                    visible={true}
                    height="20"
                    width="50"
                    color="#ffffff"
                    radius="9"
                    ariaLabel="loading"
                  />
                ) : (
                  <>Notify Me</>
                )}
              </button>
            </div>

            {/* Additional Info */}
            <p className="text-blue-shade-100 text-xs italic text-center mt-3">
              You can also add your email later from your profile. Cancel or
              submit your email to continue booking.
            </p>
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
