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
} from "lucide-react";
import { TimeSlotSectionProps, TimeSlot } from "@/types/OfficeHoursTypes";
import EditOfficeHoursModal from "./EditOfficeHoursModal";
import DeleteOfficeHoursModal from "./DeleteOfficeHoursModal";
import { toast } from "react-hot-toast";
import { fetchApi } from "@/utils/api";

const TimeSlotSection: React.FC<TimeSlotSectionProps> = ({
  hostAddress,
  daoName,
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
}) => {
  const [editingSlot, setEditingSlot] = useState<{
    dateIndex: number;
    slotIndex: number;
    slot: TimeSlot;
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
    const handleClickOutside = (event:MouseEvent) => {
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
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    setEditingSlot({ dateIndex, slotIndex, slot });
    setShowEditOptions(null);
  };

  const handleDeleteClick = (dateIndex: number, slotIndex: number) => {
    setConfirmDelete({ dateIndex, slotIndex });
    setShowEditOptions(null);
  };

  const confirmDeleteSlot = async () => {
    if (confirmDelete) {
      const { dateIndex, slotIndex } = confirmDelete;
      try {
        const slotId =
          selectedDates[dateIndex].timeSlots[slotIndex].reference_id;
        console.log("slotId", slotId);

        const requestOptions = {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            host_address: hostAddress,
            dao_name: daoName,
            reference_id: slotId,
          }),
        };

        const result = await fetchApi(`/edit-office-hours`, requestOptions);

        if (result.ok) {
          // Update the local state to remove the deleted slot
          setSelectedDates((prevDates) => {
            const updatedDates = [...prevDates];
            updatedDates[dateIndex].timeSlots.splice(slotIndex, 1);
            if (updatedDates[dateIndex].timeSlots.length === 0) {
              updatedDates.splice(dateIndex, 1);
            }
            return updatedDates;
          });

          // Also update the parent component's state
          deleteBookedSlot(dateIndex, slotIndex);
          if (slotId) removeExistingSchedule(slotId);

          // Show a success message
          toast.success("Time slot deleted successfully");
        } else {
          throw new Error("Failed to delete time slot");
        }
      } catch (error) {
        console.error("Error deleting time slot:", error);
        toast.error("Failed to delete time slot. Please try again.");
      }
    }
    setConfirmDelete(null);
  };

  return (
    

    // max-h-[calc(100vh-8rem)]
    <div className="flex-1 1.5lg:max-h-[350px] max-h-[600px] overflow-y-auto px-1 mt-6 md:mt-0 1.5lg:mr-6 xl:mr-0 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:transition-all [&::-webkit-scrollbar]:duration-300  [&::-webkit-scrollbar-track]:rounded-full  [&::-webkit-scrollbar-thumb]:rounded-full  [&::-webkit-scrollbar-thumb]:bg-blue-200  [&::-webkit-scrollbar-track]:bg-blue-50  hover:[&::-webkit-scrollbar-thumb]:bg-blue-100">
      {selectedDates.length > 0 ? (
        <div className="mb-4 space-y-6">
          {selectedDates
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((schedule, dateIndex) => (
              <div
                key={schedule.date.toISOString()}
                className="relative group bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="absolute -left-0.5 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl"></div>
                <div className="p-3 0.2xs:p-4 md:p-6">
                  <div className="flex flex-col xm:flex-row xm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-50 p-3 rounded-xl">
                        <CalendarIcon className="text-blue-600 h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900">
                          {format(schedule.date, "EEEE, MMMM d, yyyy")}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {schedule.timeSlots.length} time slot
                          {schedule.timeSlots.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleRecurring(dateIndex)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                        schedule.isRecurring
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
                        className={`relative flex flex-row items-start sm:items-center gap-1 0.2xs:gap-3 p-3 sm:p-4 rounded-xl transition-all ${
                          slot.bookedTitle
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
                          className={`h-4 w-4 ${
                            slot.bookedTitle
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
                                updateTime(
                                  dateIndex,
                                  slotIndex,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              disabled={Boolean(slot.bookedTitle)}
                              className={`rounded-xl px-1 py-1.5 0.5xs:px-3 0.5xs:py-2 text-xs sm:text-sm bg-white border flex-1 sm:flex-none
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
                                updateTime(
                                  dateIndex,
                                  slotIndex,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              disabled={Boolean(slot.bookedTitle)}
                              className={`rounded-xl px-1 py-1.5 0.5xs:px-3 0.5xs:py-2 text-xs sm:text-sm bg-white border flex-1 sm:flex-none
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
                            onClick={() => removeTimeSlot(dateIndex, slotIndex)}
                            className="text-gray-400 hover:text-red-500 transition-all p-2 ml-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                          </div>
                          {/* {slot.bookedTitle && (
                            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-amber-200 w-full sm:w-auto">
                              <div className="size-4">
                            <User className="h-4 w-4 text-amber-500" />
                            </div>
                            <span className="text-xs sm:text-sm text-amber-900 font-medium line-clamp-1">
                                {slot.bookedTitle}
                              </span>
                            </div>
                          )} */}
                        
                        {slot.bookedTitle && (
                          <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-amber-200 w-[180px] 0.5xs:w-[190px] ">
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
                              className="text-amber-600 hover:text-amber-700 p-2 transition-all"
                              aria-label="Edit booked slot size-4"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {showEditOptions?.dateIndex === dateIndex &&
                              showEditOptions?.slotIndex === slotIndex && (
                                <div ref={editOptionsRef} className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10 border border-gray-200">
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
                                        handleDeleteClick(dateIndex, slotIndex)
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
                        ) } 
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => addTimeSlot(dateIndex)}
                      className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium p-4 rounded-xl w-full transition-all"
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
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-gray-900 font-semibold mb-2">
            No dates selected
          </h3>
          <p className="text-gray-500">
            Select dates from the calendar to schedule your availability
          </p>
        </div>
      )}
      {editingSlot && hostAddress && (
        <EditOfficeHoursModal
          hostAddress={hostAddress}
          daoName={daoName}
          slot={editingSlot.slot}
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
      <DeleteOfficeHoursModal
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteSlot}
      />
    </div>
  );
};

export default React.memo(TimeSlotSection);
