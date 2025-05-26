import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Plus,
  Repeat,
  Trash2,
  User,
  Edit,
  X,
  Loader2,
} from "lucide-react";
import { TimeSlotSectionProps, TimeSlot } from "@/types/OfficeHoursTypes";
import EditOfficeHoursModal from "./EditOfficeHoursModal";
import DeleteOfficeHoursModal from "./DeleteOfficeHoursModal";
import { toast } from "react-hot-toast";
import { fetchApi } from "@/utils/api";


const TimeSlotSection: React.FC<TimeSlotSectionProps> = ({
  hostAddress,
  selectedDates,
  setSelectedDates,
  generateTimeOptions,
  toggleRecurring,
  addTimeSlot,
  removeTimeSlot,
  updateTime,
  updateBookedSlot,
  deleteBookedSlot,
  removeExistingSchedule,
  isLoadingSchedules = false,
}) => {
  const [editingSlot, setEditingSlot] = useState<{
    dateIndex: number;
    slotIndex: number;
    slot: TimeSlot;
    date: Date;
  } | null>(null);
  const [showEditOptions, setShowEditOptions] = useState<{
    dateIndex: number;
    slotIndex: number;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    dateIndex: number;
    slotIndex: number;
  } | null>(null);

  const editOptionsRef = useRef<HTMLDivElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both the edit button and popup
      const target = event.target as Element;
      if (
        showEditOptions &&
        editOptionsRef.current &&
        !editOptionsRef.current.contains(target) &&
        editButtonRef.current &&
        !editButtonRef.current.contains(target)
      ) {
        setShowEditOptions(null);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEditOptions]);

  const handleEditClick = (dateIndex: number, slotIndex: number) => {
    setShowEditOptions({ dateIndex, slotIndex });
  };

  const handleUpdateClick = (
    dateIndex: number,
    slotIndex: number,
    slot: TimeSlot
  ) => {
    setEditingSlot({
      dateIndex,
      slotIndex,
      slot,
      date: selectedDates[dateIndex].date,
    });
    setShowEditOptions(null);
  };

  const handleDeleteClick = (dateIndex: number, slotIndex: number) => {
    setConfirmDelete({ dateIndex, slotIndex });
    setShowEditOptions(null);
  };

  const getSlotId = (
    dateIndex: number,
    slotIndex: number
  ): string | undefined => {
    return selectedDates[dateIndex]?.timeSlots[slotIndex]?.reference_id;
  };

  const handleDeleteSuccess = () => {
    if (confirmDelete) {
      const { dateIndex, slotIndex } = confirmDelete;
      console.log("dateIndex", dateIndex, slotIndex);

      const slotId = getSlotId(dateIndex, slotIndex);

      // Update the local state to remove the deleted slot
      setSelectedDates((prevDates) => {
        console.log("prevDates", prevDates);
        const updatedDates = [...prevDates];
        console.log("updatedDates", updatedDates);
        updatedDates[dateIndex].timeSlots.splice(slotIndex, 1);
        if (updatedDates[dateIndex].timeSlots.length === 0) {
          updatedDates.splice(dateIndex, 1);
        }
        return updatedDates;
      });

      if (slotId) removeExistingSchedule(slotId);
      deleteBookedSlot(dateIndex, slotIndex);

      setConfirmDelete(null);
    }
  };

  // Function to check if a time slot overlaps with existing booked slots
  const checkTimeSlotOverlap = (
    schedule: any,
    startTime: string,
    endTime: string,
    currentSlotId?: string
  ) => {
    const newSlotStart = new Date(`${format(schedule.date, "yyyy-MM-dd")}T${startTime}:00`);
    const newSlotEnd = new Date(`${format(schedule.date, "yyyy-MM-dd")}T${endTime}:00`);

    return schedule.timeSlots.some((slot: TimeSlot) => {
      // Skip checking against the current slot being edited
      if (currentSlotId && slot.id === currentSlotId) return false;
      
      // Only check against booked slots
      if (!slot.bookedTitle && !slot.reference_id) return false;

      const existingSlotStart = new Date(`${format(schedule.date, "yyyy-MM-dd")}T${slot.startTime}:00`);
      const existingSlotEnd = new Date(`${format(schedule.date, "yyyy-MM-dd")}T${slot.endTime}:00`);

      return newSlotStart < existingSlotEnd && newSlotEnd > existingSlotStart;
    });
  };

  // Custom updateTime function with overlap checking
  const handleUpdateTime = (
    dateIndex: number,
    slotIndex: number,
    field: "startTime" | "endTime",
    newTime: string
  ) => {
    const schedule = selectedDates[dateIndex];
    const currentSlot = schedule.timeSlots[slotIndex];
    
    // Calculate the new start and end times
    let newStartTime = currentSlot.startTime;
    let newEndTime = currentSlot.endTime;
    
    if (field === "startTime") {
      newStartTime = newTime;
      // Auto-calculate end time (1 hour later)
      const [startHours, startMinutes] = newTime.split(":").map(Number);
      let endHours = startHours + 1;
      let endMinutes = startMinutes;

      if (endHours > 23) {
        endHours = 23;
        endMinutes = 59;
      }

      newEndTime = `${endHours.toString().padStart(2, "0")}:${endMinutes
        .toString()
        .padStart(2, "0")}`;
    } else {
      newEndTime = newTime;
    }

    // Check for overlap only if it's not a booked slot
    if (!currentSlot.bookedTitle && !currentSlot.reference_id) {
      const hasOverlap = checkTimeSlotOverlap(schedule, newStartTime, newEndTime, currentSlot.id);
      
      if (hasOverlap) {
        toast.error("This time slot overlaps with an existing booked slot. Please select a different time.");
        return;
      }
    }

    // If no overlap, proceed with the original updateTime function
    updateTime(dateIndex, slotIndex, field, newTime);
  };

  return (
    <div className={`flex-1 1.5lg:max-h-[350px] max-h-[600px] overflow-y-auto px-1 mt-6 md:mt-0 1.5lg:mr-6 xl:mr-0 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:transition-all [&::-webkit-scrollbar]:duration-300  [&::-webkit-scrollbar-track]:rounded-full  [&::-webkit-scrollbar-thumb]:rounded-full  [&::-webkit-scrollbar-thumb]:bg-blue-200  [&::-webkit-scrollbar-track]:bg-blue-50  hover:[&::-webkit-scrollbar-thumb]:bg-blue-100 relative`}>
      {/* Global loading overlay when loading and no dates selected */}
      {isLoadingSchedules && selectedDates.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="relative">
            {/* Triple spinning rings */}
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
            <div className="absolute top-2 left-2 w-12 h-12 rounded-full border-4 border-blue-200 border-b-blue-400 animate-spin animate-reverse"></div>
            <div className="absolute top-4 left-4 w-8 h-8 rounded-full border-4 border-blue-300 border-l-blue-600 animate-spin"></div>
          </div>
        </div>
      )}

      {selectedDates.length > 0 ? (
        <div className="mb-4 space-y-6">
          {selectedDates
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((schedule, dateIndex) => (
              <div
                key={schedule.date.toISOString()}
                className={`relative group bg-slate-800 bg-opacity-50 rounded-2xl shadow-md border border-gray-600 hover:shadow-lg transition-all
                  }`}
              >

                <div className="absolute -left-0.5 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl"></div>
                <div className="p-3 0.2xs:p-4 md:p-6">
                  <div className="flex flex-col xm:flex-row xm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center space-x-4">
                      <CalendarIcon className="text-blue-600 h-5 w-5" />
                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-300">
                          {new Date(schedule.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {schedule.timeSlots.length} time slot
                          {schedule.timeSlots.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleRecurring(dateIndex)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${schedule.isRecurring
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      <Repeat className="h-4 w-4" />
                      <span className="text-sm font-medium">Monthly</span>
                    </button>
                  </div>

                  <div className="space-y-4 md:ml-14">
                    {schedule.timeSlots.map((slot, slotIndex) => (
                      <div
                        key={slot.id}
                        className={`relative flex flex-row items-start sm:items-center gap-1 0.2xs:gap-3 p-3 sm:p-4 rounded-xl transition-all ${slot.bookedTitle
                          ? "bg-amber-50 border border-amber-200"
                          : "bg-gradient-to-br from-blue-50 to-transparent hover:bg-blue-50"
                          }`}
                      >
                        {slot.bookedTitle && (
                          <div className="absolute -top-3 left-2 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                            Booked
                          </div>
                        )}
                        <div className="w-4 h-4 mt-2.5 sm:mt-0">
                          <Clock
                            className={`h-4 w-4 ${slot.bookedTitle
                              ? "text-amber-500"
                              : "text-gray-400"
                              }`}
                          />

                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 w-full">
                          <div className="flex justify-between w-full">
                            <div className="flex items-center space-x-1 0.5xs:space-x-2 w-full sm:w-auto">
                              <select
                                value={slot.startTime}
                                onChange={(e) =>
                                  handleUpdateTime(
                                    dateIndex,
                                    slotIndex,
                                    "startTime",
                                    e.target.value
                                  )
                                }
                                disabled={Boolean(slot.bookedTitle)}
                                className={`rounded-xl px-1 py-1.5 0.5xs:px-3 0.5xs:py-2 text-xs sm:text-sm bg-white border flex-1 sm:flex-none transition-all
                                ${slot.bookedTitle
                                    ? "border-amber-200 text-amber-900 bg-amber-50"
                                    : "border-gray-200 hover:border-gray-300"
                                  }`}
                              >
                                {generateTimeOptions(schedule.date, true).map(
                                  (time) => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  )
                                )}
                              </select>
                              <span className="text-xs sm:text-sm text-gray-400">
                                to
                              </span>
                              <select
                                value={slot.endTime}
                                onChange={(e) =>
                                  handleUpdateTime(
                                    dateIndex,
                                    slotIndex,
                                    "endTime",
                                    e.target.value
                                  )
                                }
                                disabled={Boolean(slot.bookedTitle)}
                                className={`rounded-xl px-1 py-1.5 0.5xs:px-3 0.5xs:py-2 text-xs sm:text-sm bg-white border flex-1 sm:flex-none transition-all
                                ${slot.bookedTitle
                                    ? "border-amber-200 text-amber-900 bg-amber-50"
                                    : "border-gray-200 hover:border-gray-300"
                                  }`}
                              >
                                {generateTimeOptions(
                                  schedule.date,
                                  false,
                                  slot.startTime
                                ).map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {!slot.bookedTitle && (
                              <button
                                onClick={() =>
                                  removeTimeSlot(dateIndex, slotIndex)
                                }
                                className={`text-gray-400 hover:text-red-500 transition-all p-2 ml-auto`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {slot.bookedTitle && (
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-amber-200 w-[180px] 0.5xs:w-[190px]`}>
                                <div className="size-4">
                                  <User className="h-4 w-4 text-amber-500" />
                                </div>
                                <span className="text-xs sm:text-sm text-amber-900 font-medium truncate block">
                                  {slot.bookedTitle}
                                </span>
                              </div>
                              <div className="relative mr-auto">
                                <button
                                  ref={editButtonRef}
                                  onClick={() =>
                                    handleEditClick(dateIndex, slotIndex)
                                  }
                                  className={`text-amber-600 hover:text-amber-700 p-2 transition-all`}
                                  aria-label="Edit booked slot size-4"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                {showEditOptions?.dateIndex === dateIndex &&
                                  showEditOptions?.slotIndex === slotIndex && (
                                    <div
                                      ref={editOptionsRef}
                                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10 border border-gray-200"
                                    >
                                      <div className="py-1">
                                        <button
                                          onClick={() =>
                                            handleUpdateClick(
                                              dateIndex,
                                              slotIndex,
                                              slot
                                            )
                                          }
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          Update
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteClick(
                                              dateIndex,
                                              slotIndex
                                            )
                                          }
                                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => addTimeSlot(dateIndex)}
                      className={`flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium p-4 rounded-xl w-full transition-all`}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add time slot</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className={`bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center relative ${isLoadingSchedules ? 'pointer-events-none' : ''
          }`}>
          {isLoadingSchedules ? (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {/* Animated calendar icon with loading ring */}
                <CalendarIcon className="w-12 h-12 text-gray-300 opacity-50" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-48 mx-auto"></div>
              </div>
            </div>
          ) : (
            <>
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-gray-900 font-semibold mb-2">
                No dates selected
              </h3>
              <p className="text-gray-500">
                Select dates from the calendar to schedule your availability
              </p>
            </>
          )}
        </div>
      )}

      {/* Add shimmer keyframe */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      {editingSlot && hostAddress && (
        <EditOfficeHoursModal
          hostAddress={hostAddress}
          slot={editingSlot.slot}
          date={editingSlot.date}
          onClose={() => setEditingSlot(null)}
          onUpdate={(updatedSlot) => {
            updateBookedSlot(
              editingSlot.dateIndex,
              editingSlot.slotIndex,
              updatedSlot
            );
            setEditingSlot(null);
          }}
        />
      )}
      {hostAddress && confirmDelete && (
        <DeleteOfficeHoursModal
          isOpen={confirmDelete !== null}
          onClose={() => setConfirmDelete(null)}
          onSuccess={handleDeleteSuccess}
          hostAddress={hostAddress}
          slotId={
            selectedDates[confirmDelete.dateIndex].timeSlots[
              confirmDelete.slotIndex
            ].reference_id
          }
        />
      )}
    </div>
  );
};

export default React.memo(TimeSlotSection);