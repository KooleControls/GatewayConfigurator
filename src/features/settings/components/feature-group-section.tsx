import { CommandField } from "@/features/settings/components/command-field"
import { getFeatureGroupCommandEntries } from "@/features/settings/config/feature-groups"
import type { CommandRegistryEntry } from "@/features/settings/types"

type FeatureGroupSectionProps = {
  groupId: string
  description: string
  visibleCommands?: CommandRegistryEntry[]
}

function FeatureGroupSection({
  groupId,
  description,
  visibleCommands,
}: FeatureGroupSectionProps) {
  const commands = visibleCommands ?? getFeatureGroupCommandEntries(groupId)

  if (commands.length === 0) {
    return <p className="text-muted-foreground">{description}</p>
  }

  return (
    <div className="mt-1 grid gap-3 md:grid-cols-2">
      {commands.map((command) => (
        <CommandField key={command.id} command={command} />
      ))}
    </div>
  )
}

export { FeatureGroupSection }
