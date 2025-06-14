"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  format,
  isToday,
  isBefore,
  startOfDay,
  addWeeks,
} from "date-fns";
import { getAccessToken } from "@privy-io/react-auth";
import TimeSlotSection from "@/components/ComponentUtils/TimeSlotSection";
import Calendar from "@/components/ComponentUtils/Calendar";
import {
  DateSchedule,
  TimeSlot,
  ExistingSchedule,
} from "@/types/OfficeHoursTypes";
import { toast } from "react-hot-toast";
import { fetchApi } from "@/utils/api";
import { AlertCircle, CalendarIcon, Clock, Loader2 } from "lucide-react";
import { useAccount, useSwitchChain } from "wagmi";

const UserScheduledHours: React.FC<{
  onScheduleSave?: () => void;
}> = ({ onScheduleSave }) => {
  const { address } = useAccount()
  const [selectedDates, setSelectedDates] = useState<DateSchedule[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [existingSchedules, setExistingSchedules] = useState<
    ExistingSchedule[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Check if it's too late to book slots for today
  const isTooLateForToday = useCallback(() => {
    const now = new Date();
    return now.getHours() >= 23;
  }, []);

  const generateTimeOptions = useCallback(
    (selectedDate: Date, isStartTime: boolean, startTime?: string) => {
      const options: string[] = [];
      const now = new Date();
      const isCurrentDate = isToday(selectedDate);
      let startHour = isCurrentDate ? now.getHours() : 0;

      // Check if it's too late for today
      if (isCurrentDate && isTooLateForToday()) {
        return options; // Return empty array if it's too late
      }

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
    [isTooLateForToday]
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
    (date: Date, startTime: string): TimeSlot | null => {
      // Check if startTime is undefined or if it's too late for today
      if (!startTime || (isToday(date) && isTooLateForToday())) {
        return null;
      }

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
    [isTooLateForToday]
  );

  const toggleDateSelection = useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return;

      // Check if it's too late to book for today
      if (isToday(date) && isTooLateForToday()) {
        toast.error("You cannot add slots for today, today's time is up. Please book slots for future dates.");
        return;
      }

      setSelectedDates((prevDates) => {
        const dateString = format(date, "yyyy-MM-dd");

        // Check if date is already selected
        const existingScheduleIndex = prevDates.findIndex(
          (schedule) => format(schedule.date, "yyyy-MM-dd") === dateString
        );

        if (existingScheduleIndex !== -1) {
          // Remove the date if it's already selected
          const newDates = [...prevDates];
          newDates.splice(existingScheduleIndex, 1);
          return newDates;
        }

        // Get existing schedules for the selected date
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
            id: schedule.reference_id || Math.random().toString(36).substr(2, 9),
            bookedTitle: schedule.title,
            bookedDescription: schedule.description,
            reference_id: schedule.reference_id,
          }))
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        // Determine initial time slots
        let initialTimeSlots: TimeSlot[] = [];

        if (existingTimeSlotsForDate.length > 0) {
          // If there are booked slots, use those
          initialTimeSlots = existingTimeSlotsForDate;
        } else {
          // If no booked slots, create a default time slot
          const defaultStartTime = isToday(date)
            ? generateTimeOptions(date, true)[0]
            : "09:00";

          if (defaultStartTime) {
            const timeSlot = createTimeSlot(date, defaultStartTime);
            if (timeSlot) {
              initialTimeSlots = [timeSlot];
            }
          }
        }

        // Only create a schedule if we have valid time slots
        if (initialTimeSlots.length === 0) {
          if (isToday(date)) {
            toast.error("You cannot add slots for today, today's time is up. Please book slots for future dates.");
          }
          return prevDates;
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
      generateTimeOptions,
      createTimeSlot,
      existingSchedules,
      title,
      description,
      isTooLateForToday,
    ]
  );

  const removeExistingSchedule = useCallback((referenceId: string) => {
    setExistingSchedules((prevSchedules) =>
      prevSchedules.filter((schedule) => schedule.reference_id !== referenceId)
    );
  }, []);

  useEffect(() => {
    if (selectedDates.length > 0) {
      setSelectedDates((prevDates) =>
        prevDates.map((schedule) => ({
          ...schedule,
          title: title,
          description: description,
        }))
      );
    }
  }, [title, description]);

  const toggleRecurring = useCallback(
    (dateIndex: number) => {
      setSelectedDates((prevDates) => {
        const newSchedules = [...prevDates];
        const schedule = newSchedules[dateIndex];

        if (!schedule.isRecurring) {
          const recurringDates = generateRecurringDates(schedule.date);
          const newRecurringSchedules = recurringDates.map((date) => ({
            date,
            timeSlots: schedule.timeSlots
              .filter((slot) => !slot.bookedTitle && !slot.reference_id) // Only copy unbooked slots
              .map((slot) => ({
                ...slot,
                id: Math.random().toString(36).substr(2, 9),
                // Remove any booked properties
                bookedTitle: undefined,
                bookedDescription: undefined,
                reference_id: undefined,
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

        // Check if it's too late to add slots for today
        if (isToday(schedule.date) && isTooLateForToday()) {
          toast.error("You cannot add slots for today, today's time is up. Please book slots for future dates.");
          return newSchedules;
        }

        const lastSlot = schedule.timeSlots[schedule.timeSlots.length - 1];

        // Check if we can create a new time slot
        const newTimeSlot = createTimeSlot(schedule.date, lastSlot.endTime);

        if (!newTimeSlot) {
          toast.error("Cannot add more time slots for this date.");
          return newSchedules;
        }

        // Check for overlap with existing booked slots
        const conflictingSlot = schedule.timeSlots.find((existingSlot) => {
          // Only check against booked slots
          if (!existingSlot.bookedTitle && !existingSlot.reference_id) return false;

          const newSlotStart = new Date(`${format(schedule.date, "yyyy-MM-dd")}T${newTimeSlot.startTime}:00`);
          const newSlotEnd = new Date(`${format(schedule.date, "yyyy-MM-dd")}T${newTimeSlot.endTime}:00`);
          const existingStart = new Date(`${format(schedule.date, "yyyy-MM-dd")}T${existingSlot.startTime}:00`);
          const existingEnd = new Date(`${format(schedule.date, "yyyy-MM-dd")}T${existingSlot.endTime}:00`);

          return newSlotStart < existingEnd && newSlotEnd > existingStart;
        });

        if (conflictingSlot) {
          toast.error("Cannot add time slot. It overlaps with an existing booked slot.");
          return newSchedules;
        }

        schedule.timeSlots.push(newTimeSlot);
        return newSchedules;
      });
    },
    [createTimeSlot, isTooLateForToday]
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

        // Check if it's too late for today
        if (isToday(schedule.date) && isTooLateForToday()) {
          toast.error("You cannot modify slots for today, today's time is up. Please book slots for future dates.");
          return prevDates;
        }

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
    [existingSchedules, isTooLateForToday]
  );

  const updateBookedSlot = useCallback(
    (dateIndex: number, slotIndex: number, updatedSlot: TimeSlot) => {
      setSelectedDates((prevDates) => {
        const newSchedules = [...prevDates];
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



  const convertToUTC = useCallback(() => {
    return selectedDates.flatMap((schedule) => {
      const scheduleDate = schedule.date;

      return schedule.timeSlots
        .filter((slot) => !slot.bookedTitle && !slot.reference_id) // Only include new, unbooked slots
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

  const resetState = useCallback(() => {
    setSelectedDates([]);
    setTitle("");
    setDescription("");
    setCurrentDate(new Date());
  }, []);



  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const utcSchedule = convertToUTC();
    console.log("UTC Schedule:", utcSchedule);

    const token = await getAccessToken();
    const myHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...(address && {
        "x-wallet-address": address,
        Authorization: `Bearer ${token}`,
      }),
    };

    const raw = JSON.stringify({
      host_address: address,
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

      toast.success("Schedule saved successfully!");
      resetState();
      getOfficeHours();
      onScheduleSave?.();
    } catch (error) {
      console.error("Error saving lectures:", error);
      toast.error("Failed to save schedule. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [convertToUTC, address, getAccessToken, resetState]);

  const processExistingSchedules = useCallback((schedules: ExistingSchedule[]) => {
    if (!schedules || schedules.length === 0) {
      return;
    }

    // Group schedules by date
    const schedulesByDate = schedules.reduce((acc, schedule) => {
      const startDate = new Date(schedule.startTime);
      const dateKey = format(startDate, "yyyy-MM-dd");

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: startDate,
          slots: [],
          title: schedule.title || title,
          description: schedule.description || description,
        };
      }

      acc[dateKey].slots.push({
        startTime: format(startDate, "HH:mm"),
        endTime: format(new Date(schedule.endTime), "HH:mm"),
        id: schedule.reference_id || Math.random().toString(36).substr(2, 9),
        bookedTitle: schedule.title,
        bookedDescription: schedule.description,
        reference_id: schedule.reference_id,
      });

      return acc;
    }, {} as Record<string, { date: Date; slots: TimeSlot[]; title: string; description: string }>);

    // Convert to DateSchedule format and add to selected dates
    const newSchedules: DateSchedule[] = Object.values(schedulesByDate).map(({ date, slots, title: scheduleTitle, description: scheduleDesc }) => ({
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()), // Normalize to start of day
      timeSlots: slots.sort((a, b) => a.startTime.localeCompare(b.startTime)), // Sort by start time
      isRecurring: false,
      title: scheduleTitle,
      description: scheduleDesc,
    }));

    // Update selected dates without duplicating existing dates
    setSelectedDates(prevDates => {
      const existingDateStrings = prevDates.map(schedule =>
        format(schedule.date, "yyyy-MM-dd")
      );

      const filteredNewSchedules = newSchedules.filter(newSchedule =>
        !existingDateStrings.includes(format(newSchedule.date, "yyyy-MM-dd"))
      );

      return [...prevDates, ...filteredNewSchedules];
    });

    // Set title and description from the first schedule if not already set
    if (!title && schedules.length > 0 && schedules[0].title) {
      setTitle(schedules[0].title);
    }
    if (!description && schedules.length > 0 && schedules[0].description) {
      setDescription(schedules[0].description);
    }
  }, [title, description]);

  const getOfficeHours = useCallback(async () => {
    setIsLoadingSchedules(true);
    const token = await getAccessToken();
    const myHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...(address && {
        "x-wallet-address": address,
        Authorization: `Bearer ${token}`,
      }),
    };

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    try {
      const response = await fetchApi(
        `/get-upcoming-officehours?host_address=${address}`,
        requestOptions
      );
      const result = await response.json();
      const meetings = result.data.meetings || [];

      setExistingSchedules(meetings);

      // Process existing schedules and add to selected dates
      processExistingSchedules(meetings);

    } catch (error) {
      console.error("Error fetching lectures:", error);
      toast.error("Failed to load existing schedules");
    } finally {
      setIsLoadingSchedules(false);
      setInitialLoad(false);
    }
  }, [address, processExistingSchedules]);

  useEffect(() => {
    getOfficeHours();
  }, [getOfficeHours, resetState]);

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
        hostAddress={address}
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
        isLoadingSchedules={isLoadingSchedules}
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
      isLoadingSchedules,
      existingSchedules
    ]
  );

  const isScheduleValid = useMemo(() => {
    const hasDates = selectedDates.length > 0;
    const hasTitle = title.trim() !== "";
    const hasDescription = description.trim() !== "";

    return hasDates && hasTitle && hasDescription && !isSaving;
  }, [selectedDates, title, description, isSaving]);

  return (
    <div className="min-h-screen rounded-2xl">
      {/* <div className="max-w-7xl mx-auto"> */}
      {/* Header Section */}
      <div className="mb-8">
        {/* Schedule Details Card */}
        <div className="bg-gradient-to-br from-slate-700 to-transparent rounded-2xl shadow-md p-3 0.2xs:p-4 sm:p-6 mb-8 transition-all hover:shadow-lg">
          <div className="space-y-6">
            <div className="space-y-4">
              <label htmlFor="title" className="block">
                <span className="text-lg font-semibold text-gray-100 mb-2 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-gray-100" />
                  Title
                </span>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your schedule"
                  className="w-full px-4 py-3 text-gray-100 bg-slate-800 bg-opacity-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  disabled={isLoadingSchedules}
                />
              </label>
            </div>

            <div className="space-y-4">
              <label htmlFor="description" className="block">
                <span className="text-lg font-semibold text-gray-100 mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-gray-100" />
                  Description
                </span>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose of this schedule..."
                  rows={3}
                  className="w-full px-4 py-3 text-gray-100 bg-slate-800 bg-opacity-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  disabled={isLoadingSchedules}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Schedule Availability Section */}
        <div className="bg-gradient-to-br from-slate-700 to-transparent rounded-2xl shadow-md p-3 0.2xs:p-4 sm:p-6 transition-all hover:shadow-lg relative">

          <div className="flex items-center mb-6">
            <Clock className="w-6 h-6 text-blue-100 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-100">
                Schedule Availability
              </h3>
              <p className="text-sm text-gray-200 mt-1">
                All times shown in {timezone}
              </p>
            </div>
          </div>

          <div className="flex flex-col 1.5lg:flex-row gap-6 lg:gap-8">
            <div className="w-full 1.5lg:w-1/3">{memoizedCalendar}</div>
            <div className="w-full 1.5lg:w-2/3">
              {memoizedTimeSlotSection}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!isScheduleValid || isLoadingSchedules}
        className={`w-full sm:w-auto sm:min-w-[200px] mt-4 py-4 px-6 rounded-2xl text-base font-medium transition-all ${!isScheduleValid || isLoadingSchedules
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:transform active:scale-95"
          } relative bottom-auto left-auto right-auto`}
      >
        {isSaving ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin mr-2" />
            Saving...
          </div>
        ) : (
          "Save Schedule"
        )}
      </button>
      {/* </div> */}
    </div>
  );
};

export default React.memo(UserScheduledHours);