"use client"

import * as React from "react"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerComponentProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean | ((date: Date) => boolean)
  className?: string
  maxDate?: Date
  minDate?: Date
}

export function DatePickerComponent({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  className,
  maxDate = new Date(),
  minDate = new Date(1920, 0, 1),
}: DatePickerComponentProps) {
  // Separate boolean disabled from function-based date filtering
  const isInputDisabled = typeof disabled === 'boolean' ? disabled : false
  const filterDate = typeof disabled === 'function' ? (date: Date) => !disabled(date) : undefined
  
  return (
    <div className={cn("relative", className)}>
      <ReactDatePicker
        selected={date}
        onChange={(date) => onSelect?.(date || undefined)}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        disabled={isInputDisabled}
        filterDate={filterDate}
        maxDate={maxDate}
        minDate={minDate}
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        yearDropdownItemNumber={100}
        scrollableYearDropdown
        className={cn(
          "h-[50px] w-full px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9]",
          "font-[family-name:var(--font-poppins)] text-sm",
          "text-[#505d68] placeholder:text-[#a1aeb7]",
          "focus:outline-none focus:ring-2 focus:ring-[#437749] focus:border-transparent",
          "disabled:bg-gray-100 disabled:cursor-not-allowed"
        )}
        wrapperClassName="w-full"
        popperClassName="z-[9999]"
        calendarClassName="!font-[family-name:var(--font-poppins)]"
      />
      <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1aeb7] pointer-events-none" />
    </div>
  )
}
