import { useEffect, useRef, useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FeatureGroupSection } from "@/features/settings/components/feature-group-section"
import { FEATURE_GROUPS } from "@/features/settings/config/feature-groups"
import {
  setRawCommands,
  useLatestHighlightedCommand,
  useRawCommands,
} from "@/features/settings/store/settings-store"

function SettingsFeaturesPanel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Features</CardTitle>
        <CardDescription>
          Expand sections and add feature settings one by one.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto pr-2">
        <Accordion type="multiple" className="space-y-3">
          {FEATURE_GROUPS.map((group) => (
            <AccordionItem key={group.id} value={group.id}>
              <AccordionTrigger>{group.title}</AccordionTrigger>
              <AccordionContent className="px-3 pt-2 pb-3">
                <FeatureGroupSection
                  groupId={group.id}
                  description={group.description}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

function RawCommandsPanel() {
  const commandsText = useRawCommands()
  const { commandCode, tick } = useLatestHighlightedCommand()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [lineFlash, setLineFlash] = useState<{
    top: number
    height: number
    key: string
  } | null>(null)

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
        <CardDescription>
          Source command text that stays visible while configuring features.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <div className="flex h-full min-h-0 flex-col gap-1">
          <Label htmlFor="raw-commands">Raw Commands</Label>
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
              className="min-h-0 flex-1 font-mono"
              onChange={(event) => setRawCommands(event.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { RawCommandsPanel, SettingsFeaturesPanel }
