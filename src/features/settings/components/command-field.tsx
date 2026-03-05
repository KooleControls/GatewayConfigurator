import { useEffect, useMemo, useRef } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getCommandEntryById,
  isNumericEntry,
} from "@/features/settings/config/command-registry"
import {
  navigateToCommandByCode,
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
  const deprecation =
    typeof command.deprecated === "object"
      ? command.deprecated
      : command.deprecated
        ? {}
        : null
  const replacementCommands = useMemo(
    () =>
      (deprecation?.replacedByCommandIds ?? [])
        .map((commandId) => getCommandEntryById(commandId))
        .filter((entry) => entry !== undefined),
    [deprecation?.replacedByCommandIds]
  )

  useEffect(() => {
    if (!highlightTick || !containerRef.current) {
      return
    }

    const element = containerRef.current
    element.scrollIntoView({ block: "nearest", behavior: "smooth" })
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
        <span className="inline-flex items-center gap-2">
          <span>{label}</span>
          {deprecation ? <Badge variant="destructive">Deprecated</Badge> : null}
        </span>
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
      {deprecation ? (
        <p className="text-xs/relaxed text-muted-foreground">
          <span>
            {deprecation.note ?? "This command is deprecated."}
            {replacementCommands.length > 0 ? " Use " : ""}
          </span>
          {replacementCommands.map((replacement, index) => (
            <span key={`${code}-${replacement.id}`}>
              <Button
                type="button"
                variant="link"
                size="xs"
                className="h-auto px-0 text-xs/relaxed"
                onClick={() => navigateToCommandByCode(replacement.code)}
              >
                {replacement.code}
              </Button>
              {index < replacementCommands.length - 2 ? ", " : null}
              {index === replacementCommands.length - 2 ? " and " : null}
            </span>
          ))}
          {replacementCommands.length > 0 ? <span> instead.</span> : null}
        </p>
      ) : null}
    </div>
  )
}

export { CommandField }
