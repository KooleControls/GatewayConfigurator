import { useMemo, useSyncExternalStore } from "react"

import {
  COMMAND_REGISTRY,
  INITIAL_COMMAND_TEXT,
} from "@/features/settings/config/command-registry"
import {
  getChangedCommandCodes,
  getCommandValue,
  setCommandValue,
} from "@/features/settings/utils/command-text"

type SettingsState = {
  rawCommands: string
  highlightTickByCode: Record<string, number>
  latestHighlightedCommandCode: string | null
  highlightTick: number
}

let state: SettingsState = {
  rawCommands: INITIAL_COMMAND_TEXT,
  highlightTickByCode: {},
  latestHighlightedCommandCode: null,
  highlightTick: 0,
}

const knownCommandCodes = [...new Set(COMMAND_REGISTRY.commands.map((command) => command.code))]

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getRawCommandsSnapshot() {
  return state.rawCommands
}

export function setRawCommands(
  nextRawCommandsOrUpdater:
    | string
    | ((currentRawCommands: string) => string)
) {
  const nextRawCommands =
    typeof nextRawCommandsOrUpdater === "function"
      ? nextRawCommandsOrUpdater(state.rawCommands)
      : nextRawCommandsOrUpdater

  if (nextRawCommands === state.rawCommands) {
    return
  }

  const changedCommandCodes = getChangedCommandCodes(
    state.rawCommands,
    nextRawCommands,
    knownCommandCodes
  )

  const nextHighlightTick = state.highlightTick + 1
  const nextHighlightTickByCode = { ...state.highlightTickByCode }

  for (const commandCode of changedCommandCodes) {
    nextHighlightTickByCode[commandCode] = nextHighlightTick
  }

  state = {
    ...state,
    rawCommands: nextRawCommands,
    highlightTickByCode: nextHighlightTickByCode,
    latestHighlightedCommandCode:
      changedCommandCodes.length > 0
        ? changedCommandCodes[changedCommandCodes.length - 1]
        : state.latestHighlightedCommandCode,
    highlightTick: changedCommandCodes.length > 0 ? nextHighlightTick : state.highlightTick,
  }

  emitChange()
}

export function useRawCommands() {
  return useSyncExternalStore(
    subscribe,
    getRawCommandsSnapshot,
    getRawCommandsSnapshot
  )
}

function getCommandHighlightSnapshot(commandCode: string) {
  return state.highlightTickByCode[commandCode] ?? 0
}

export function useCommandHighlightTick(commandCode: string) {
  return useSyncExternalStore(
    subscribe,
    () => getCommandHighlightSnapshot(commandCode),
    () => getCommandHighlightSnapshot(commandCode)
  )
}

function getLatestHighlightedCommandSnapshot() {
  return {
    commandCode: state.latestHighlightedCommandCode,
    tick: state.highlightTick,
  }
}

export function useLatestHighlightedCommand() {
  return useSyncExternalStore(
    subscribe,
    getLatestHighlightedCommandSnapshot,
    getLatestHighlightedCommandSnapshot
  )
}

export function useCommandValue(commandCode: string) {
  const rawCommands = useRawCommands()

  const value = useMemo(
    () => getCommandValue(rawCommands, commandCode),
    [rawCommands, commandCode]
  )

  const setValue = (nextValue: string) => {
    setRawCommands((currentRawCommands) =>
      setCommandValue(currentRawCommands, commandCode, nextValue)
    )
  }

  return {
    value,
    setValue,
  }
}
