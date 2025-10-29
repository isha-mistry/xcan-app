"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { dao_details } from "@/config/daoDetails";
import IndividualDaoHeader from "../ComponentUtils/IndividualDaoHeader";
import AboutDao from "./AboutDao";
import { ChevronDownIcon } from "lucide-react";

function SpecificDAO({ props }: { props: { daoDelegates: string } }) {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("About");
  const currentDao = dao_details[props.daoDelegates];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.matches(":hover")) {
        setIsDropdownOpen(false);
      }
    }, 100);
  };

  const tabs = [
    { name: "About", value: "about" }
  ];

  const handleTabChange = (tabValue: string) => {
    const selected = tabs.find((tab) => tab.value === tabValue);
    if (selected) {
      setSelectedTab(selected.name);
      setIsDropdownOpen(false);

      const queryParams = new URLSearchParams();
      queryParams.set('active', tabValue);

      if (tabValue === 'delegatesSession') {
        queryParams.set('session', 'recorded');
      } else if (tabValue === 'officeHours') {
        queryParams.set('hours', 'ongoing');
      }

      router.push(`${path}?${queryParams.toString()}`);
    }
  };

  // Map of active tab to component
  const tabComponents: Record<string, React.ReactNode> = {
    about: <AboutDao props={props.daoDelegates} />,
  };

  return (
    <>
      <div className="font-robotoMono py-6" id="secondSection">
        <div className="px-4 md:px-6 lg:px-14 pb-5 ">
          <IndividualDaoHeader />
          <div className="py-5">
            {currentDao.description}
          </div>
        </div>

        <div
          className="lg:hidden mt-4 px-8 xs:px-4 sm:px-8 py-2 sm:py-[10px] bg-[#D9D9D945]"
          ref={dropdownRef}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="w-full flex justify-between items-center text-left font-normal rounded-full capitalize text-lg text-blue-shade-100 bg-white px-4 py-2 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onMouseEnter={handleMouseEnter}
          >
            <span>{selectedTab}</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-700 ${isDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </div>
          <div
            className={`w-[calc(100vw - 3rem)] mt-1 overflow-hidden transition-all duration-700 ease-in-out ${isDropdownOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="p-2 border border-white-shade-100 rounded-xl bg-white shadow-md">
              {tabs.map((tab, index) => (
                <React.Fragment key={tab.value}>
                  <div
                    onClick={() => handleTabChange(tab.value)}
                    className="px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-gray-100 capitalize text-base cursor-pointer"
                  >
                    {tab.name}
                  </div>
                  {index !== tabs.length - 1 && <hr className="my-1" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex gap-12 bg-[#D9D9D945] pl-16">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={`border-b-2 py-4 px-2 ${searchParams.get("active") === tab.value
                ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                : "border-transparent"
                }`}
              onClick={() => handleTabChange(tab.value)}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="py-6 px-4 md:px-6 lg:px-16">
          {tabComponents[searchParams.get("active") || "about"]}
        </div>
      </div>
    </>
  );
}

export default SpecificDAO;