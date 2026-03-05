import { useEffect, useRef } from "react"

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

  useEffect(() => {
    if (!tick || !textareaRef.current) {
      return
    }

    const element = textareaRef.current
    element.classList.remove("command-flash-textarea")
    void element.offsetWidth
    element.classList.add("command-flash-textarea")

    const timeoutId = window.setTimeout(() => {
      element.classList.remove("command-flash-textarea")
    }, 950)

    return () => {
      window.clearTimeout(timeoutId)
      element.classList.remove("command-flash-textarea")
    }
  }, [tick])

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
          <Label htmlFor="raw-commands" className="justify-between gap-3">
            <span>Raw Commands</span>
            {commandCode ? (
              <span
                key={`${commandCode}-${tick}`}
                className="command-flash-badge rounded-sm px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                Updated: {commandCode}
              </span>
            ) : null}
          </Label>
          <Textarea
            ref={textareaRef}
            id="raw-commands"
            value={commandsText}
            className="min-h-0 flex-1 font-mono"
            onChange={(event) => setRawCommands(event.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export { RawCommandsPanel, SettingsFeaturesPanel }
