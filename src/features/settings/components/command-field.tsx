import { useEffect, useRef } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isNumericEntry } from "@/features/settings/config/command-registry"
import {
  useCommandHighlightTick,
  useCommandValue,
} from "@/features/settings/store/settings-store"
import type { CommandRegistryEntry } from "@/features/settings/types"

type CommandFieldProps = {
  command: CommandRegistryEntry
}

function CommandField({ command }: CommandFieldProps) {
  const { code, label, field } = command
  const isNumeric = isNumericEntry(command)
  const hasOptions = (field?.options?.length ?? 0) > 0
  const { value, setValue } = useCommandValue(code)
  const highlightTick = useCommandHighlightTick(code)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!highlightTick || !containerRef.current) {
      return
    }

    const element = containerRef.current
    element.classList.remove("command-flash")
    void element.offsetWidth
    element.classList.add("command-flash")

    const timeoutId = window.setTimeout(() => {
      element.classList.remove("command-flash")
    }, 950)

    return () => {
      window.clearTimeout(timeoutId)
      element.classList.remove("command-flash")
    }
  }, [highlightTick])

  return (
    <div
      ref={containerRef}
      className="space-y-1 rounded-md border border-transparent px-2 py-1"
    >
      <Label htmlFor={code} className="justify-between gap-3">
        <span>{label}</span>
        <span className="text-muted-foreground">{code}</span>
      </Label>
      {hasOptions ? (
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-full" id={code}>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {field?.options?.map((option) => (
              <SelectItem key={`${code}-${option.value}`} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={code}
          type={isNumeric ? "number" : "text"}
          inputMode={isNumeric ? "decimal" : "text"}
          min={field?.min}
          max={field?.max}
          step={field?.step ?? (isNumeric ? 1 : undefined)}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      )}
      {field?.description ? (
        <p className="text-xs/relaxed text-muted-foreground">
          {field.description}
        </p>
      ) : null}
      {command.deprecated ? (
        <p className="text-xs/relaxed text-muted-foreground">
          Deprecated command.
        </p>
      ) : null}
    </div>
  )
}

export { CommandField }
