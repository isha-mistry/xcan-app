import React, { useCallback, useState } from "react";
import Image from "next/image";
import connectImg from "@/assets/images/instant-meet/connect.png";
import connectImghover from "@/assets/images/instant-meet/connectHover.svg";
import accessImg from "@/assets/images/instant-meet/quick-access.png";
import accessImghover from "@/assets/images/instant-meet/accessImghover.svg";
import videoImg from "@/assets/images/instant-meet/video-call.png";
import videoImghover from "@/assets/images/instant-meet/videoImghover.svg";
import audioImg from "@/assets/images/instant-meet/audio-call.png";
import audioImghover from "@/assets/images/instant-meet/audioImghover.svg";
import screenImg from "@/assets/images/instant-meet/screen-share.png";
import screenImghover from "@/assets/images/instant-meet/screenImghover.svg";
import chatImg from "@/assets/images/instant-meet/chat.png";
import chatImghover from "@/assets/images/instant-meet/chatImghover.svg";
import heroImg from "@/assets/images/instant-meet/instant-meet-hero.svg";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { Oval } from "react-loader-spinner";
import { Tooltip } from "@nextui-org/react";
import { usePrivy } from "@privy-io/react-auth";
import { MEETING_BASE_URL } from "@/config/constants";
import { fetchApi } from "@/utils/api";
import InstantMeetForm from "./InstantMeetForm";
import { useAccount } from "wagmi";

interface instantMeetProps {
  isDelegate: boolean;
  selfDelegate: boolean;
  daoName: string;
}

function InstantMeet({ isDelegate, selfDelegate, daoName }: instantMeetProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address } = useAccount()
  const { getAccessToken } = usePrivy();
  const [confirmSave, setConfirmSave] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    description: "",
  });

  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [createdMeetingTitle, setCreatedMeetingTitle] = useState<string>("");

  const openMeetingInNewTab = (roomId: string | null) => {
    if (!roomId) {
      console.error("Cannot open meeting: Room ID is not available.");
      return;
    }
    window.open(
      `${MEETING_BASE_URL}/meeting/session/${roomId}/lobby`,
      "_blank"
    );
  };

  const startInstantMeet = async () => {
    if (!modalData.title) {
      alert("Please provide a title for the meeting.");
      return;
    }
    setConfirmSave(true);

    let getHeaders = new Headers();
    getHeaders.append("Content-Type", "application/json");
    if (address) {
      getHeaders.append("x-wallet-address", address);
    }

    let roomId = null;
    try {
      // --- Step 1: Create Room ID ---
      const res = await fetch(`/api/create-room`, {
        method: "GET",
        headers: getHeaders,
      });
      if (!res.ok) {
        throw new Error(`Failed to create room: ${res.statusText}`);
      }
      const result = await res.json();
      roomId = result.data; // Get the room ID

      if (!roomId) {
        throw new Error("Failed to retrieve Room ID from API.");
      }

      // --- Step 2: Book Slot (Save Meeting Details) ---
      let localDateTime = new Date();
      let dateInfo = localDateTime.toISOString();

      const requestData = {
        dao_name: daoName,
        slot_time: dateInfo,
        title: modalData.title,
        description: modalData.description,
        host_address: address,
        session_type: "instant-meet",
        meetingId: roomId,
        meeting_status: "Ongoing",
        attendees: [],
      };
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(address && {
          "x-wallet-address": address,
          Authorization: `Bearer ${token}`,
        }),
      };

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(requestData),
        redirect: "follow",
      };

      const response = await fetchApi("/book-slot", requestOptions);
      const bookingResult = await response.json();

      if (bookingResult.success) {
        setCreatedRoomId(roomId);
        setCreatedMeetingTitle(modalData.title);
        setModalStep(2);
      } else {
        console.error("Booking failed:", bookingResult.error);
        alert(
          `Failed to save meeting details: ${bookingResult.error || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error during instant meet creation:", error);
      alert(
        `An error occurred: ${error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setConfirmSave(false);
    }
  };

  const block = [
    {
      image: connectImg,
      hoverImage: connectImghover,
      title: "Connect with Others Instantly",
      description:
        "Engage with yourself in an instant meeting and share the link with the people you want to connect with. Experience the following features for a comprehensive virtual meeting experience.",
    },
    {
      image: accessImg,
      hoverImage: accessImghover,
      title: "Quick Access to DAO Links",
      description:
        "Access the quick links of DAO directly within the meeting itself,making it easier to reference and share relevant information during your session.",
    },
    {
      image: videoImg,
      hoverImage: videoImghover,
      title: "Video Call",
      description:
        " Connect seamlessly and engage face-to-face with crisp and clear video quality, bringing your virtual meetings to life.",
    },
    {
      image: audioImg,
      hoverImage: audioImghover,
      title: "Audio Call",
      description:
        "Experience crystal-clear audio that ensures smooth and effective communication with all participants, enhancing the meeting experience.",
    },
    {
      image: screenImg,
      hoverImage: screenImghover,
      title: "Screen Sharing",
      description:
        "Effortlessly share your screen to showcase documents, presentations,or any other content, making collaboration more interactive and dynamic.",
    },
    {
      image: chatImg,
      hoverImage: chatImghover,
      title: "Chat",
      description:
        "Foster real-time communication by sending text messages to participants within the meeting, allowing for quick exchanges and enhanced collaboration.",
    },
  ];

  const ModalConfirmationContent = () => (
    <div className="flex flex-col items-center justify-center text-center pt-4 pb-4">
      {" "}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 text-green-500 mb-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h2 className="text-xl font-semibold mb-2 text-[#3E3D3D]">
        Instant Meet Ready!
      </h2>
      <p className="text-base text-gray-600 mb-4 max-w-md px-4">
        Your instant meeting <strong>{createdMeetingTitle || "..."}</strong> for{" "}
        <strong>{daoName.charAt(0).toUpperCase() + daoName.slice(1)}</strong>{" "}
        DAO has been created.
      </p>
      <p className="text-xs text-gray-500 mt-2">
        Click <strong>Start Meet</strong> below to join.
      </p>
    </div>
  );

  const handleCloseModal = () => {
    setModalStep(1);
    setModalData({ title: "", description: "" });
    setCreatedRoomId(null);
    setCreatedMeetingTitle("");
    setConfirmSave(false);
    onClose();
  };

  const handleFormChange = useCallback(
    (newData: { title: string; description: string }) => {
      setModalData(newData);
    },
    []
  );

  return (
    <div>
      <div className="pb-28">
        <div className="">
          <div className="grid gris-cols-4 2md:grid-cols-7 rounded-3xl border-solid border-2 border-[#F9F9F9]-900">
            <div className="col-span-4 border-solid border-b-2 2md:border-b-0 2md:border-r-2 border-[#F9F9F9]-900">
              <div className="p-6 xs:p-10 xm:p-14">
                <div className="text-white text-2xl xs:text-3xl font-semibold font-poppins text-center">
                  Start an Instant Meeting
                </div>
                <div className="grid grid-cols-2 xm:grid-cols-3 xm:grid-rows-2 text-xs xs:text-sm gap-6 xs:gap-11 font-semibold pt-8 text-[#3E3D3D] text-center">
                  {block.map((data, index) => (
                    <Tooltip
                      key={index}
                      content={
                        <div className="px-1 py-3 w-80 ">
                          <div className="font-poppins text-white text-center">
                            {data.description}
                          </div>
                        </div>
                      }
                      placement="top"
                      className="group w-fit bg-gray-700"
                      motionProps={{
                        variants: {
                          exit: {
                            opacity: 0,
                            transition: { duration: 0.1, ease: "easeIn" },
                          },
                          enter: {
                            opacity: 1,
                            transition: { duration: 0.15, ease: "easeOut" },
                          },
                        },
                      }}
                    >
                      <div>
                        <div className="group border rounded-3xl bg-[#E5E5EA] flex items-center justify-center p-8 hover:bg-blue-shade-100 hover:shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
                          <Image
                            alt={data.title}
                            height={60}
                            width={60}
                            src={data.image}
                            className="transition duration-300 ease-in-out transform group-hover:hidden"
                            quality={100}
                            priority={true}
                          />
                          <Image
                            alt={`${data.title} hover`}
                            height={60}
                            width={60}
                            src={data.hoverImage}
                            className="hidden transition duration-300 ease-in-out transform group-hover:block group-hover:scale-105"
                            quality={100}
                            priority={true}
                          />
                        </div>
                        <div className="p-2">
                          <span className="text-slate-300">{data.title}</span>
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-span-3 flex flex-col p-10 md:p-16 2md:p-3 items-center justify-center -mt-[25%]">
              <div className="h-auto w-auto bg-cover mb-[-20%]">
                <Image
                  alt="Instant Meet Hero"
                  src={heroImg}
                  quality={100}
                  priority={true}
                  layout="responsive"
                  width={350}
                  height={300}
                />
              </div>
              <div className="text-center transition-transform transform hover:scale-105 duration-300">
                <button
                  className="bg-blue-shade-200 py-3 px-6 rounded-full text-white font-semibold"
                  onClick={() => {
                    setModalStep(1);
                    setModalData({ title: "", description: "" });
                    onOpen();
                  }}
                >
                  Start an instant meet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="font-poppins"
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {modalStep === 1
              ? "Provide details for instant meet"
              : "Instant Meet Created"}
          </ModalHeader>

          <ModalBody className="relative overflow-hidden min-h-[280px]">
            {/* Step 1: Form View */}
            <div
              className={`absolute top-0 left-0 w-full transition-all duration-300 ease-in-out transform px-6 ${modalStep === 1
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0 pointer-events-none"
                }`}
            >
              <InstantMeetForm
                key="instant-meet-form"
                initialData={modalData}
                daoName={daoName}
                onChange={handleFormChange}
              />
            </div>

            {/* Step 2: Confirmation View */}
            <div
              className={`absolute top-0 left-0 w-full transition-all duration-300 ease-in-out transform ${modalStep === 2
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0 pointer-events-none"
                }`}
            >
              <ModalConfirmationContent />
            </div>
          </ModalBody>

          <ModalFooter>
            {modalStep === 1 && (
              <>
                <Button
                  color="default"
                  variant="light"
                  onPress={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={startInstantMeet}
                  isDisabled={confirmSave || !modalData.title.trim()}
                >
                  {confirmSave ? (
                    <Oval
                      visible={true}
                      height="20"
                      width="20"
                      color="#FFFFFF"
                      secondaryColor="#cdccff"
                      ariaLabel="oval-loading"
                      strokeWidth={3}
                    />
                  ) : (
                    "Create Meet"
                  )}
                </Button>
              </>
            )}
            {modalStep === 2 && (
              <>
                <Button
                  color="primary"
                  className="bg-blue-shade-200 hover:bg-blue-700 text-white"
                  onPress={() => {
                    openMeetingInNewTab(createdRoomId);
                    handleCloseModal();
                  }}
                  isDisabled={!createdRoomId}
                >
                  Start Meet
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default InstantMeet;
