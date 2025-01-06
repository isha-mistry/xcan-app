import React, { useState } from "react";
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
    <div className="flex-1 max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      {selectedDates.length > 0 ? (
        <div className="space-y-6">
          {selectedDates
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((schedule, dateIndex) => (
              <div
                key={schedule.date.toISOString()}
                className="relative group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="absolute -left-0.5 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
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

                  <div className="space-y-4 ml-14">
                    {schedule.timeSlots.map((slot, slotIndex) => (
                      <div
                        key={slot.id}
                        className={`relative flex items-center space-x-4 p-3 rounded-lg transition-all group/slot
                          ${
                            slot.bookedTitle
                              ? "bg-amber-50 border border-amber-200"
                              : "hover:bg-gray-50"
                          }`}
                      >
                        {slot.bookedTitle && (
                          <div className="absolute -top-2 left-2 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md text-xs font-medium">
                            Booked
                          </div>
                        )}
                        <Clock
                          className={`h-4 w-4 ${
                            slot.bookedTitle
                              ? "text-amber-500"
                              : "text-gray-400"
                          }`}
                        />
                        <div className="flex items-center space-x-3 flex-1">
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
                            className={`rounded-lg px-4 py-2 text-sm bg-white border
                              ${
                                slot.bookedTitle
                                  ? "border-amber-200 text-amber-900 bg-amber-50"
                                  : "border-gray-200 hover:border-gray-300"
                              } 
                              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all`}
                          >
                            {generateTimeOptions(schedule.date, true).map(
                              (time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              )
                            )}
                          </select>
                          <span className="text-sm text-gray-400">to</span>
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
                            className={`rounded-lg px-4 py-2 text-sm bg-white border
                              ${
                                slot.bookedTitle
                                  ? "border-amber-200 text-amber-900 bg-amber-50"
                                  : "border-gray-200 hover:border-gray-300"
                              } 
                              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all`}
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
                          {slot.bookedTitle && (
                            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-amber-200">
                              <User className="h-4 w-4 text-amber-500" />
                              <span className="text-sm text-amber-900 font-medium">
                                {slot.bookedTitle}
                              </span>
                            </div>
                          )}
                        </div>
                        {slot.bookedTitle ? (
                          <div className="relative">
                            <button
                              onClick={() =>
                                handleEditClick(dateIndex, slotIndex)
                              }
                              className="text-amber-600 hover:text-amber-700 transition-all"
                              aria-label="Edit booked slot"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {showEditOptions?.dateIndex === dateIndex &&
                              showEditOptions?.slotIndex === slotIndex && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
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
                        ) : (
                          <button
                            onClick={() => removeTimeSlot(dateIndex, slotIndex)}
                            className="text-gray-400 hover:text-red-500 transition-all"
                            aria-label="Remove time slot"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => addTimeSlot(dateIndex)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium p-3 rounded-lg w-full transition-all"
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
        <div className="bg-white border border-gray-200 border-dashed rounded-lg p-12 text-center">
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
