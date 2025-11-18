"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
  disabled,
  className,
  maxDate = new Date(),
  minDate,
}: DatePickerComponentProps) {
  const [open, setOpen] = React.useState(false)

  // Format date as DD/MM/YYYY
  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return placeholder
    return format(date, "dd/MM/yyyy")
  }

  const isDateDisabled = (date: Date) => {
    if (typeof disabled === 'boolean') return disabled
    if (typeof disabled === 'function') return disabled(date)
    if (maxDate && date > maxDate) return true
    if (minDate && date < minDate) return true
    return false
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "h-[50px] w-full justify-start text-left font-normal px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] text-sm",
            !date && "text-[#a1aeb7]",
            date && "text-[#505d68]",
            className
          )}
          disabled={typeof disabled === 'boolean' ? disabled : false}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#a1aeb7]" />
          {formatDateDisplay(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onSelect?.(selectedDate)
            setOpen(false)
          }}
          disabled={isDateDisabled}
          initialFocus
          defaultMonth={date || maxDate}
          captionLayout="dropdown-buttons"
          fromYear={1920}
          toYear={new Date().getFullYear()}
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  )
}
