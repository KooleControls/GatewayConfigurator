import groups from "@/features/settings/config/feature-groups.json"
import { getCommandEntryById } from "@/features/settings/config/command-registry"
import type { FeatureGroup } from "@/features/settings/types"

export const FEATURE_GROUPS = groups as FeatureGroup[]

export function getFeatureGroupById(groupId: string) {
  return FEATURE_GROUPS.find((group) => group.id === groupId)
}

export function getFeatureGroupCommandEntries(groupId: string) {
  const group = getFeatureGroupById(groupId)

  if (!group) {
    return []
  }

  return group.commandIds
    .map((commandId) => getCommandEntryById(commandId))
    .filter((entry) => entry !== undefined)
}
