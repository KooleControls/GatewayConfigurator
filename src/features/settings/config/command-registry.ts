import registry from "@/features/settings/config/command-registry.json"
import type {
  CommandDefinition,
  CommandRegistry,
  CommandRegistryEntry,
} from "@/features/settings/types"

const commandRegistry = registry as CommandRegistry

export const COMMAND_REGISTRY = commandRegistry
export const INITIAL_COMMAND_TEXT = COMMAND_REGISTRY.initialCommands.join("\n")

export const COMMAND_DEFINITIONS: CommandDefinition[] = COMMAND_REGISTRY.commands.map(
  ({ id, code, label, description, valueType }) => ({
    id,
    code,
    label,
    description,
    valueType,
  })
)

export function getFeatureCommandEntries(featureId: string) {
  return COMMAND_REGISTRY.commands.filter((entry) =>
    (entry.features ?? []).includes(featureId)
  )
}

export function getCommandEntryById(commandId: string) {
  return COMMAND_REGISTRY.commands.find((entry) => entry.id === commandId)
}

export function getCommandEntryByCode(commandCode: string) {
  return COMMAND_REGISTRY.commands.find((entry) => entry.code === commandCode)
}

export function isNumericEntry(entry: CommandRegistryEntry) {
  return (entry.valueType ?? "text") === "number"
}
