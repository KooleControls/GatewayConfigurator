import { useEffect, useMemo, useRef, useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FeatureGroupSection } from "@/features/settings/components/feature-group-section"
import { COMMAND_REGISTRY } from "@/features/settings/config/command-registry"
import { getFeatureGroupCommandEntries } from "@/features/settings/config/feature-groups"
import { FEATURE_GROUPS } from "@/features/settings/config/feature-groups"
import {
  setRawCommands,
  useLatestHighlightedCommand,
  useLatestNavigatedCommand,
  useRawCommands,
} from "@/features/settings/store/settings-store"
import type { CommandRegistryEntry } from "@/features/settings/types"
import { cn } from "@/lib/utils"

type CommandSearchConfig = {
  searchTerm: string
  entriesByCode: Map<string, CommandRegistryEntry[]>
}

function buildCommandSearchText(command: CommandRegistryEntry) {
  return [command.label, command.description, command.field?.description]
    .filter((part) => typeof part === "string" && part.length > 0)
    .join(" ")
    .toLowerCase()
}

function commandMatchesSearch(command: CommandRegistryEntry, config: CommandSearchConfig) {
  if (!config.searchTerm) {
    return true
  }

  const code = command.code.toLowerCase()
  if (code === config.searchTerm || code.includes(config.searchTerm)) {
    return true
  }

  const searchableText = buildCommandSearchText(command)
  return searchableText.includes(config.searchTerm)
}

type SettingsFeaturesPanelProps = {
  searchQuery: string
  onSearchQueryChange: (nextQuery: string) => void
}

function SettingsFeaturesPanel({
  searchQuery,
  onSearchQueryChange,
}: SettingsFeaturesPanelProps) {
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([])
  const { commandCode: navigatedCommandCode, tick: navigatedCommandTick } =
    useLatestNavigatedCommand()
  const normalizedSearchTerm = searchQuery.trim().toLowerCase()

  const groupIdsByCommandCode = useMemo(() => {
    const groupedGroupIds = new Map<string, string[]>()

    for (const group of FEATURE_GROUPS) {
      const commandEntries = getFeatureGroupCommandEntries(group.id)

      for (const commandEntry of commandEntries) {
        const existingGroupIds = groupedGroupIds.get(commandEntry.code)

        if (existingGroupIds) {
          if (!existingGroupIds.includes(group.id)) {
            existingGroupIds.push(group.id)
          }
        } else {
          groupedGroupIds.set(commandEntry.code, [group.id])
        }
      }
    }

    return groupedGroupIds
  }, [])

  const entriesByCode = useMemo(() => {
    const groupedEntries = new Map<string, CommandRegistryEntry[]>()

    for (const command of COMMAND_REGISTRY.commands) {
      const commandCode = command.code
      const existingEntries = groupedEntries.get(commandCode)

      if (existingEntries) {
        existingEntries.push(command)
      } else {
        groupedEntries.set(commandCode, [command])
      }
    }

    return groupedEntries
  }, [])

  const searchConfig = useMemo(
    () => ({ searchTerm: normalizedSearchTerm, entriesByCode }),
    [entriesByCode, normalizedSearchTerm]
  )

  const matchedCommandsByGroupId = useMemo(
    () =>
      Object.fromEntries(
        FEATURE_GROUPS.map((group) => {
          const groupCommands = getFeatureGroupCommandEntries(group.id)
          const matchingCommands = groupCommands.filter((command) =>
            commandMatchesSearch(command, searchConfig)
          )

          return [group.id, matchingCommands]
        })
      ) as Record<string, CommandRegistryEntry[]>,
    [searchConfig]
  )

  const groupsWithMatches = useMemo(
    () =>
      FEATURE_GROUPS.filter(
        (group) => (matchedCommandsByGroupId[group.id]?.length ?? 0) > 0
      ),
    [matchedCommandsByGroupId]
  )

  useEffect(() => {
    if (!normalizedSearchTerm) {
      return
    }

    const nextOpenItems = groupsWithMatches.map((group) => group.id)

    setOpenAccordionItems((currentOpenItems) => {
      if (
        currentOpenItems.length === nextOpenItems.length &&
        currentOpenItems.every((value, index) => value === nextOpenItems[index])
      ) {
        return currentOpenItems
      }

      return nextOpenItems
    })
  }, [groupsWithMatches, normalizedSearchTerm])

  useEffect(() => {
    if (!navigatedCommandTick || !navigatedCommandCode) {
      return
    }

    const targetGroupIds = groupIdsByCommandCode.get(navigatedCommandCode)

    if (!targetGroupIds || targetGroupIds.length === 0) {
      return
    }

    setOpenAccordionItems((currentOpenItems) => {
      let hasChanges = false
      const nextOpenItems = [...currentOpenItems]

      for (const groupId of targetGroupIds) {
        if (!nextOpenItems.includes(groupId)) {
          nextOpenItems.push(groupId)
          hasChanges = true
        }
      }

      return hasChanges ? nextOpenItems : currentOpenItems
    })
  }, [groupIdsByCommandCode, navigatedCommandCode, navigatedCommandTick])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Features</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto pr-2">
        <div className="mb-3">
          <Input
            id="command-search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search by command code or description"
            className="mt-1"
          />
        </div>
        <Accordion
          type="multiple"
          value={openAccordionItems}
          onValueChange={setOpenAccordionItems}
          className="space-y-3"
        >
          {FEATURE_GROUPS.map((group) => (
            <AccordionItem key={group.id} value={group.id}>
              <AccordionTrigger>
                <span className="inline-flex items-center gap-2">
                  <span>{group.title}</span>
                  {normalizedSearchTerm ? (
                    <Badge variant="outline">
                      {matchedCommandsByGroupId[group.id]?.length ?? 0}
                    </Badge>
                  ) : null}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-3 pt-2 pb-3">
                <FeatureGroupSection
                  groupId={group.id}
                  description={group.description}
                  visibleCommands={
                    normalizedSearchTerm
                      ? matchedCommandsByGroupId[group.id] ?? []
                      : undefined
                  }
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

type RawCommandsPanelProps = {
  searchQuery: string
}

function RawCommandsPanel({ searchQuery }: RawCommandsPanelProps) {
  const commandsText = useRawCommands()
  const { commandCode, tick } = useLatestHighlightedCommand()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [lineFlash, setLineFlash] = useState<{
    top: number
    height: number
    key: string
  } | null>(null)
  const normalizedSearchTerm = searchQuery.trim().toLowerCase()

  const entriesByCode = useMemo(() => {
    const groupedEntries = new Map<string, CommandRegistryEntry[]>()

    for (const command of COMMAND_REGISTRY.commands) {
      const commandCode = command.code
      const existingEntries = groupedEntries.get(commandCode)

      if (existingEntries) {
        existingEntries.push(command)
      } else {
        groupedEntries.set(commandCode, [command])
      }
    }

    return groupedEntries
  }, [])

  const knownCommandCodesDesc = useMemo(
    () => [...entriesByCode.keys()].sort((left, right) => right.length - left.length),
    [entriesByCode]
  )

  const searchConfig = useMemo(
    () => ({ searchTerm: normalizedSearchTerm, entriesByCode }),
    [entriesByCode, normalizedSearchTerm]
  )

  const lineMatchStates = useMemo(() => {
    const lines = commandsText.split(/\r?\n/)

    return lines.map((line) => {
      if (!searchConfig.searchTerm) {
        return true
      }

      const trimmedLine = line.trimStart()
      const commandCode = knownCommandCodesDesc.find((knownCode) =>
        trimmedLine.startsWith(knownCode)
      )

      if (!commandCode) {
        return trimmedLine.toLowerCase().includes(searchConfig.searchTerm)
      }

      const commandEntries = searchConfig.entriesByCode.get(commandCode) ?? []
      return commandEntries.some((commandEntry) =>
        commandMatchesSearch(commandEntry, searchConfig)
      )
    })
  }, [commandsText, knownCommandCodesDesc, searchConfig])

  useEffect(() => {
    if (!tick || !textareaRef.current) {
      return
    }

    const element = textareaRef.current
    if (!commandCode) {
      setLineFlash(null)
      return
    }

    const lines = commandsText.split(/\r?\n/)
    const changedLineIndex = lines.findIndex((line) =>
      line.trimStart().startsWith(commandCode)
    )

    if (changedLineIndex === -1) {
      setLineFlash(null)
      return
    }

    const computedStyle = window.getComputedStyle(element)
    const paddingTop = Number.parseFloat(computedStyle.paddingTop) || 0
    const lineHeight =
      Number.parseFloat(computedStyle.lineHeight) ||
      (Number.parseFloat(computedStyle.fontSize) || 16) * 1.5
    const top = paddingTop + changedLineIndex * lineHeight - element.scrollTop
    const isOutOfView = top + lineHeight < 0 || top > element.clientHeight

    if (isOutOfView) {
      setLineFlash(null)
      return
    }

    setLineFlash({
      top,
      height: lineHeight,
      key: `${commandCode}-${tick}`,
    })

    const timeoutId = window.setTimeout(() => {
      setLineFlash((currentLineFlash) =>
        currentLineFlash?.key === `${commandCode}-${tick}` ? null : currentLineFlash
      )
    }, 1500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [commandCode, commandsText, tick])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Raw Commands</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <div className="flex h-full min-h-0 flex-col gap-1">
          <div className="relative min-h-0 flex-1">
            {lineFlash ? (
              <div
                key={lineFlash.key}
                className="command-line-flash pointer-events-none absolute left-2 right-2 z-10 rounded-sm"
                style={{
                  top: `${lineFlash.top}px`,
                  height: `${lineFlash.height}px`,
                }}
              />
            ) : null}
            <Textarea
              ref={textareaRef}
              id="raw-commands"
              value={commandsText}
              className={cn(
                "relative z-20 min-h-0 flex-1 bg-transparent font-mono caret-foreground selection:bg-accent/40",
                normalizedSearchTerm ? "text-transparent" : "text-foreground"
              )}
              onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
              onChange={(event) => setRawCommands(event.target.value)}
            />
            {normalizedSearchTerm ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-md px-2 py-2">
                <div
                  className="font-mono text-sm leading-6 md:text-xs/relaxed"
                  style={{ transform: `translateY(-${scrollTop}px)` }}
                >
                  {commandsText.split(/\r?\n/).map((line, lineIndex) => (
                    <div
                      key={`${lineIndex}-${line}`}
                      className={lineMatchStates[lineIndex] ? "text-foreground" : "text-muted-foreground"}
                    >
                      {line || "\u00A0"}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SettingsCard() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <>
      <SettingsFeaturesPanel
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
      <RawCommandsPanel searchQuery={searchQuery} />
    </>
  )
}

export { RawCommandsPanel, SettingsCard, SettingsFeaturesPanel }
