import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  format,
  isToday,
  isBefore,
  startOfDay,
  addWeeks,
  addHours,
  parse,
} from "date-fns";
import { getAccessToken } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import TimeSlotSection from "@/components/ComponentUtils/TimeSlotSection";
import Calendar from "@/components/ComponentUtils/Calendar";
import {
  DateSchedule,
  TimeSlot,
  ExistingSchedule,
} from "@/types/OfficeHoursTypes";
import { toast } from "react-hot-toast";
import { fetchApi } from "@/utils/api";

const UserScheduledHours: React.FC<{ daoName: string }> = ({ daoName }) => {
  const [selectedDates, setSelectedDates] = useState<DateSchedule[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [existingSchedules, setExistingSchedules] = useState<
    ExistingSchedule[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { walletAddress } = useWalletAddress();

  const isTimeSlotConflicting = useCallback(
    (
      date: Date,
      startTime: string,
      endTime: string,
      currentSlotId?: string
    ) => {
      const dateString = format(date, "yyyy-MM-dd");
      const newStartTime = new Date(`${dateString}T${startTime}:00`);
      const newEndTime = new Date(`${dateString}T${endTime}:00`);

      return (
        existingSchedules.some((schedule) => {
          const scheduleStartTime = new Date(schedule.startTime);
          const scheduleEndTime = new Date(schedule.endTime);
          return (
            newStartTime < scheduleEndTime && newEndTime > scheduleStartTime
          );
        }) ||
        selectedDates.some(
          (schedule) =>
            schedule.date.toDateString() === date.toDateString() &&
            schedule.timeSlots.some((slot) => {
              if (currentSlotId && slot.id === currentSlotId) return false;
              const slotStartTime = new Date(`${dateString}T${slot.startTime}`);
              const slotEndTime = new Date(`${dateString}T${slot.endTime}`);
              return newStartTime < slotEndTime && newEndTime > slotStartTime;
            })
        )
      );
    },
    [existingSchedules, selectedDates]
  );

  const generateTimeOptions = useCallback(
    (selectedDate: Date, isStartTime: boolean, startTime?: string) => {
      const options: string[] = [];
      const now = new Date();
      const isCurrentDate = isToday(selectedDate);
      let startHour = isCurrentDate ? now.getHours() : 0;

      if (startTime && !isStartTime) {
        const [hours, minutes] = startTime.split(":").map(Number);
        startHour = hours;
        if (minutes === 0) startHour += 1; // Skip the start time if it's on the hour
      }

      for (let hour = startHour; hour <= 23; hour++) {
        if (isCurrentDate) {
          const optionTime = new Date(selectedDate);
          optionTime.setHours(hour, 0, 0, 0);
          if (isBefore(optionTime, now)) continue;
        }
        options.push(`${hour.toString().padStart(2, "0")}:00`);
      }

      if (!isStartTime) {
        // For end time, include all options after the start time and add 23:59
        options.push("23:59");
      }

      return options;
    },
    []
  );

  const generateRecurringDates = useCallback((baseDate: Date): Date[] => {
    return Array.from({ length: 4 }, (_, i) => addWeeks(baseDate, i + 1));
  }, []);

  const isDateSelected = useCallback(
    (date: Date) =>
      selectedDates.some(
        (schedule) => schedule.date.toDateString() === date.toDateString()
      ),
    [selectedDates]
  );

  const isDateDisabled = useCallback(
    (date: Date) => isBefore(date, startOfDay(new Date())) && !isToday(date),
    []
  );

  const createTimeSlot = useCallback(
    (date: Date, startTime: string): TimeSlot => {
      const [hours, minutes] = startTime.split(":").map(Number);
      let endHours = hours + 1;
      let endMinutes = minutes;

      if (endHours > 23) {
        endHours = 23;
        endMinutes = 59;
      }

      return {
        startTime: `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`,
        endTime: `${endHours.toString().padStart(2, "0")}:${endMinutes
          .toString()
          .padStart(2, "0")}`,
        id: Math.random().toString(36).substr(2, 9),
      };
    },
    []
  );

  const toggleDateSelection = useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return;

      setSelectedDates((prevDates) => {
        // If date is already selected, remove it
        if (isDateSelected(date)) {
          return prevDates.filter(
            (schedule) => schedule.date.toDateString() !== date.toDateString()
          );
        }

        // Get existing schedules for the selected date
        const dateString = format(date, "yyyy-MM-dd");
        const existingTimeSlotsForDate = existingSchedules
          .filter((schedule) => {
            const scheduleDate = format(
              new Date(schedule.startTime),
              "yyyy-MM-dd"
            );
            return scheduleDate === dateString;
          })
          .map((schedule) => ({
            startTime: format(new Date(schedule.startTime), "HH:mm"),
            endTime: format(new Date(schedule.endTime), "HH:mm"),
            id: Math.random().toString(36).substr(2, 9),
            bookedTitle: schedule.title,
            bookedDescription: schedule.description,
            reference_id: schedule.reference_id,
          }))
          .sort((a, b) => a.startTime.localeCompare(b.startTime)); // Sort by start time

        // Determine initial time slots
        let initialTimeSlots: TimeSlot[];

        if (existingTimeSlotsForDate.length > 0) {
          // If there are booked slots, only use those
          initialTimeSlots = existingTimeSlotsForDate;
        } else {
          // If no booked slots, create a default time slot
          const defaultStartTime = isToday(date)
            ? generateTimeOptions(date, true)[0]
            : "09:00";
          initialTimeSlots = [createTimeSlot(date, defaultStartTime)];
        }

        // Create new schedule
        const newSchedule: DateSchedule = {
          date: date,
          timeSlots: initialTimeSlots,
          isRecurring: false,
          title: title,
          description: description,
        };

        return [...prevDates, newSchedule];
      });
    },
    [
      isDateDisabled,
      isDateSelected,
      generateTimeOptions,
      createTimeSlot,
      existingSchedules,
      title,
      description,
    ]
  );

  const toggleRecurring = useCallback(
    (dateIndex: number) => {
      setSelectedDates((prevDates) => {
        const newSchedules = [...prevDates];
        const schedule = newSchedules[dateIndex];

        if (!schedule.isRecurring) {
          const recurringDates = generateRecurringDates(schedule.date);
          const newRecurringSchedules = recurringDates.map((date) => ({
            date,
            timeSlots: schedule.timeSlots.map((slot) => ({
              ...slot,
              id: Math.random().toString(36).substr(2, 9),
            })),
            isRecurring: true,
            title: schedule.title,
            description: schedule.description,
          }));

          schedule.isRecurring = true;
          return [...newSchedules, ...newRecurringSchedules];
        } else {
          const dayOfWeek = schedule.date.getDay();
          return newSchedules.filter(
            (s) => !(s.isRecurring && s.date.getDay() === dayOfWeek)
          );
        }
      });
    },
    [generateRecurringDates]
  );

  const addTimeSlot = useCallback(
    (dateIndex: number) => {
      setSelectedDates((prevDates) => {
        const newSchedules = [...prevDates];
        const schedule = newSchedules[dateIndex];
        const lastSlot = schedule.timeSlots[schedule.timeSlots.length - 1];

        const newTimeSlot = createTimeSlot(schedule.date, lastSlot.endTime);

        const conflictingSlot = existingSchedules.find((existingSlot) => {
          const dateString = format(schedule.date, "yyyy-MM-dd");
          const newSlotStart = new Date(
            `${dateString}T${newTimeSlot.startTime}:00`
          );
          const newSlotEnd = new Date(
            `${dateString}T${newTimeSlot.endTime}:00`
          );
          const existingStart = new Date(existingSlot.startTime);
          const existingEnd = new Date(existingSlot.endTime);

          return newSlotStart < existingEnd && newSlotEnd > existingStart;
        });

        if (conflictingSlot) {
          return newSchedules;
        }

        schedule.timeSlots.push(newTimeSlot);
        return newSchedules;
      });
    },
    [createTimeSlot, existingSchedules]
  );

  const removeTimeSlot = useCallback((dateIndex: number, slotIndex: number) => {
    setSelectedDates((prevDates) => {
      const newSchedules = [...prevDates];
      newSchedules[dateIndex].timeSlots.splice(slotIndex, 1);
      if (newSchedules[dateIndex].timeSlots.length === 0) {
        newSchedules.splice(dateIndex, 1);
      }
      return newSchedules;
    });
  }, []);

  const updateTime = useCallback(
    (
      dateIndex: number,
      slotIndex: number,
      field: "startTime" | "endTime",
      newTime: string
    ) => {
      setSelectedDates((prevDates) => {
        const newSchedules = [...prevDates];
        const slot = newSchedules[dateIndex].timeSlots[slotIndex];
        const schedule = newSchedules[dateIndex];

        if (isToday(schedule.date)) {
          const now = new Date();
          const newDateTime = new Date(schedule.date);
          const [hours, minutes] = newTime.split(":").map(Number);
          newDateTime.setHours(hours, minutes, 0, 0);

          if (isBefore(newDateTime, now)) return prevDates;
        }

        let updatedStartTime = slot.startTime;
        let updatedEndTime = slot.endTime;

        if (field === "startTime") {
          updatedStartTime = newTime;
          const [startHours, startMinutes] = newTime.split(":").map(Number);
          let endHours = startHours + 1;
          let endMinutes = startMinutes;

          if (endHours > 23) {
            endHours = 23;
            endMinutes = 59;
          }

          updatedEndTime = `${endHours.toString().padStart(2, "0")}:${endMinutes
            .toString()
            .padStart(2, "0")}`;
        } else {
          updatedEndTime = newTime;
        }

        const bookedSlot = existingSchedules.find((existingSlot) => {
          const slotStart = new Date(schedule.date);
          const slotEnd = new Date(schedule.date);
          const [startHours, startMinutes] = updatedStartTime
            .split(":")
            .map(Number);
          const [endHours, endMinutes] = updatedEndTime.split(":").map(Number);
          slotStart.setHours(startHours, startMinutes, 0, 0);
          slotEnd.setHours(endHours, endMinutes, 0, 0);

          const existingStart = new Date(existingSlot.startTime);
          const existingEnd = new Date(existingSlot.endTime);

          return slotStart < existingEnd && slotEnd > existingStart;
        });

        slot.startTime = updatedStartTime;
        slot.endTime = updatedEndTime;
        slot.bookedTitle = bookedSlot ? bookedSlot.title : undefined;

        return newSchedules;
      });
    },
    [existingSchedules]
  );

  const updateBookedSlot = useCallback(
    (dateIndex: number, slotIndex: number, updatedSlot: TimeSlot) => {
      setSelectedDates((prevDates) => {
        // console.log("prevDates", prevDates);
        const newSchedules = [...prevDates];
        // console.log("newSchedules", newSchedules);
        newSchedules[dateIndex].timeSlots[slotIndex] = updatedSlot;
        return newSchedules;
      });
    },
    []
  );

  const deleteBookedSlot = useCallback(
    (dateIndex: number, slotIndex: number) => {
      setSelectedDates((prevDates) => {
        const newSchedules = [...prevDates];

        if (
          !newSchedules[dateIndex] ||
          !newSchedules[dateIndex].timeSlots[slotIndex]
        ) {
          console.warn("Invalid date or slot index");
          return prevDates;
        }

        const slot = newSchedules[dateIndex].timeSlots[slotIndex];

        if (slot.bookedTitle) {
          newSchedules[dateIndex].timeSlots[slotIndex] = {
            ...slot,
            bookedTitle: undefined,
            bookedDescription: undefined,
            reference_id: undefined,
          };
        } else {
          newSchedules[dateIndex].timeSlots.splice(slotIndex, 1);

          if (newSchedules[dateIndex].timeSlots.length === 0) {
            newSchedules.splice(dateIndex, 1);
          }
        }

        return newSchedules;
      });
    },
    []
  );

  const removeExistingSchedule = useCallback((referenceId: string) => {
    setExistingSchedules((prevSchedules) =>
      prevSchedules.filter((schedule) => schedule.reference_id !== referenceId)
    );
  }, []);

  const convertToUTC = useCallback(() => {
    return selectedDates.flatMap((schedule) => {
      const scheduleDate = schedule.date;

      return schedule.timeSlots
        .filter((slot) => !slot.bookedTitle)
        .map((slot) => {
          const [startHours, startMinutes] = slot.startTime
            .split(":")
            .map(Number);
          const startDate = new Date(scheduleDate);
          startDate.setHours(startHours, startMinutes, 0, 0);

          const [endHours, endMinutes] = slot.endTime.split(":").map(Number);
          const endDate = new Date(scheduleDate);
          endDate.setHours(endHours, endMinutes, 0, 0);

          return {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            title: schedule.title,
            description: schedule.description,
          };
        });
    });
  }, [selectedDates]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const utcSchedule = convertToUTC();
    console.log("UTC Schedule:", utcSchedule);

    const token = await getAccessToken();
    const myHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...(walletAddress && {
        "x-wallet-address": walletAddress,
        Authorization: `Bearer ${token}`,
      }),
    };

    const raw = JSON.stringify({
      host_address: walletAddress,
      dao_name: daoName,
      meetings: utcSchedule,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    try {
      const response = await fetchApi("/office-hours", requestOptions);
      const result = await response.json();
      console.log("API Response:", result);

      // Update the state to mark saved slots as booked
      setSelectedDates((prevDates) => {
        return prevDates.map((date) => ({
          ...date,
          timeSlots: date.timeSlots.map((slot) => ({
            ...slot,
            bookedTitle: slot.bookedTitle || date.title, // Use existing bookedTitle if present, otherwise use date.title
            bookedDescription: slot.bookedDescription || date.description,
            reference_id: slot.reference_id || result.data.reference_id, // Assuming the API returns a reference_id for each saved slot
          })),
        }));
      });

      toast.success("Schedule saved successfully!");
    } catch (error) {
      console.error("Error saving office hours:", error);
      toast.error("Failed to save schedule. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [convertToUTC, walletAddress, daoName, getAccessToken]);

  const getOfficeHours = useCallback(async () => {
    const token = await getAccessToken();
    const myHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...(walletAddress && {
        "x-wallet-address": walletAddress,
        Authorization: `Bearer ${token}`,
      }),
    };

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    try {
      const response = await fetchApi(
        `/get-upcoming-officehours?host_address=${walletAddress}&dao_name=${daoName}`,
        requestOptions
      );
      const result = await response.json();
      setExistingSchedules(result.data.meetings || []);
    } catch (error) {
      console.error("Error fetching office hours:", error);
    }
  }, [walletAddress, daoName]);

  useEffect(() => {
    getOfficeHours();
  }, [getOfficeHours]);

  const memoizedCalendar = useMemo(
    () => (
      <Calendar
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        selectedDates={selectedDates}
        toggleDateSelection={toggleDateSelection}
        isDateDisabled={isDateDisabled}
        isDateSelected={isDateSelected}
      />
    ),
    [
      currentDate,
      selectedDates,
      toggleDateSelection,
      isDateDisabled,
      isDateSelected,
    ]
  );

  const memoizedTimeSlotSection = useMemo(
    () => (
      <TimeSlotSection
        hostAddress={walletAddress}
        daoName={daoName}
        selectedDates={selectedDates}
        setSelectedDates={setSelectedDates}
        generateTimeOptions={generateTimeOptions}
        toggleRecurring={toggleRecurring}
        addTimeSlot={addTimeSlot}
        removeTimeSlot={removeTimeSlot}
        updateTime={updateTime}
        updateBookedSlot={updateBookedSlot}
        deleteBookedSlot={deleteBookedSlot}
        removeExistingSchedule={removeExistingSchedule}
      />
    ),
    [
      selectedDates,
      generateTimeOptions,
      toggleRecurring,
      addTimeSlot,
      removeTimeSlot,
      updateTime,
      updateBookedSlot,
      deleteBookedSlot,
      removeExistingSchedule,
    ]
  );

  const isScheduleValid = useMemo(() => {
    const hasDates = selectedDates.length > 0;
    const hasTitle = title.trim() !== "";
    const hasDescription = description.trim() !== "";

    return hasDates && hasTitle && hasDescription && !isSaving;
  }, [selectedDates, title, description, isSaving]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-xl">
                {daoName.charAt(0)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{daoName}</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <label htmlFor="title" className="block">
                  <span className="text-lg font-semibold text-gray-900 mb-1 block">
                    Title
                  </span>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your schedule"
                    className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <label htmlFor="description" className="block">
                  <span className="text-lg font-semibold text-gray-900 mb-1 block">
                    Description
                  </span>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the purpose of this schedule"
                    rows={3}
                    className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Schedule Availability
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              All times shown in {timezone}
            </p>

            <div className="flex gap-8">
              {memoizedCalendar}
              {memoizedTimeSlotSection}
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!isScheduleValid}
          className={`w-full mt-4 py-3 px-4 rounded-xl text-base font-medium transition-all ${
            !isScheduleValid
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
          }`}
        >
          {isSaving ? "Saving..." : "Save Schedule"}{" "}
        </button>
      </div>
    </div>
  );
};

export default React.memo(UserScheduledHours);
