"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "../../styles/datepicker.css"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
}

export function DatePickerComponent({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled,
  className,
}: DatePickerComponentProps) {
  const [open, setOpen] = React.useState(false)

  const isDateDisabled = (date: Date) => {
    if (typeof disabled === 'boolean') return disabled
    if (typeof disabled === 'function') return disabled(date)
    return false
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background border rounded-md shadow-md" align="start">
        <div className="p-3">
          <DatePicker
            selected={date}
            onChange={(selectedDate: Date | null) => {
              onSelect?.(selectedDate || undefined)
              setOpen(false)
            }}
            inline
            calendarClassName="react-datepicker-custom"
            filterDate={disabled ? (date) => !isDateDisabled(date) : undefined}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
