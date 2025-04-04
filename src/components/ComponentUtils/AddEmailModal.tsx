import React, { useState, useEffect } from "react";
import { MdCancel } from "react-icons/md";
import NotifyMe from "@/assets/images/NotifyMe.png";
import Image from "next/image";
import { ThreeDots } from "react-loader-spinner";
import toast from "react-hot-toast";

function AddEmailModal({
  addingEmail,
  isOpen,
  onClose,
  mailId,
  isValidEmail,
  onEmailChange,
  onSubmit,
}: {
  addingEmail?: undefined | boolean;
  isOpen?: Boolean | undefined;
  onClose: () => void;
  mailId: string | undefined;
  isValidEmail: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
}) {
  const [emailError, setEmailError] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (email: string) => {
    onEmailChange(email);
    if (email) {
      const isValid = validateEmail(email);
      setEmailError(!isValid);
    } else {
      setEmailError(false);
    }
  };

  const handleSubmit = () => {
    if (mailId && !validateEmail(mailId)) {
      toast.error("Please enter a valid email address");
      return;
    }
    onSubmit();
  };

  useEffect(() => {
    // Lock scrolling when the modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center ">
          <div
            className="absolute inset-0 backdrop-blur-md"
            // onClick={onClose}
          ></div>
          <div className="relative">
            <div
              className="z-[70] absolute bg-white rounded-full p-3 -top-14 left-1/2 transform -translate-x-1/2"
              style={{
                boxShadow: "0px 0px 45px -17px rgba(0,0,0,0.75)",
              }}
            >
              <Image
                src={NotifyMe}
                alt="Image"
                className="w-24 h-24 object-cover rounded-full z-[70]"
              />
            </div>
            <div
              className="z-50 bg-white rounded-[2rem] min-w-5xl overflow-hidden"
              style={{ boxShadow: " 0px 0px 45px -17px rgba(0,0,0,0.75)" }}
            >
              <div className="items-center justify-center px-8 py-20 ">
                <div className="w-3/4 mx-auto text-center">
                  <h2 className="text-blue-shade-200 font-semibold text-3xl my-4">
                    Get Notified When Your Session is Booked
                  </h2>
                  <p className="text-gray-600 text-lg mb-4">
                    Add your email address to get notified when someone books
                    your session.
                  </p>
                </div>
                <div className="flex flex-col items-center w-full">
                  <div className="flex flex-row gap-5 w-full justify-center">
                    <div className="w-1/2">
                      <input
                        type="text"
                        value={mailId || ""}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        placeholder="xyz@gmail.com"
                        className={`border ${
                          emailError ? "border-red-500" : "border-gray-300"
                        } rounded-xl ps-3 py-2 text-md w-full focus:outline-none focus:ring-2 ${
                          emailError ? "focus:ring-red-500" : "focus:ring-blue-500"
                        }`}
                      />
                      {emailError && (
                        <p className="text-red-500 text-sm mt-1">
                          Please enter a valid email address
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSubmit}
                      className="bg-black text-white px-16 py-4 font-semibold rounded-full hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={addingEmail || emailError}
                    >
                      {addingEmail ? (
                        <ThreeDots
                          visible={true}
                          height="24"
                          color="#ffffff"
                          radius="9"
                          ariaLabel="three-dots-loading"
                          wrapperStyle={{}}
                          wrapperClass=""
                        />
                      ) : (
                        <>Notify Me</>
                      )}
                    </button>
                  </div>
                  <div className="text-blue-shade-100 text-xs italic mt-4">
                    You can also add your email address later from your profile.
                    Cancel or submit email to continue your scheduling.
                  </div>
                </div>
              </div>
              <button className="absolute top-5 right-6" onClick={onClose}>
                <MdCancel size={25} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddEmailModal;
