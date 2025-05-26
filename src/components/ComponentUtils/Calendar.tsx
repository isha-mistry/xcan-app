import React from "react";
import { format, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarProps } from "../../types/OfficeHoursTypes";

const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  setCurrentDate,
  selectedDates,
  toggleDateSelection,
  isDateDisabled,
  isDateSelected,
}) => {
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  return (
    <div className="w-full xs:w-[350px] h-fit md:sticky md:top-6 bg-slate-800 rounded-2xl shadow-md border border-gray-200 p-4">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
            )
          }
          className="p-2 hover:bg-gray-100 rounded-xl transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-200">
          {new Date(currentDate).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
            )
          }
          className="p-2 hover:bg-gray-100 rounded-xl transition-all"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 p-2"
          >
            {day}
          </div>
        ))}
        {generateCalendarDays().map((date, index) => (
          <div key={index} className="aspect-square p-0.5">
            {date && (
              <button
                onClick={() => toggleDateSelection(date)}
                disabled={isDateDisabled(date)}
                className={`w-full h-full flex items-center justify-center rounded-full text-sm transition-all
                ${
                  isDateSelected(date)
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : isDateDisabled(date)
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-gray-100 text-gray-700"
                }
                ${isToday(date) ? "ring-2 ring-blue-200" : ""}`}
              >
                {date.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Calendar);
