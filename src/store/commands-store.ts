import { useSyncExternalStore } from "react";

export type CommandEntry = {
    command: string;
    value: string;
};

export type IndoorUnitCommand = "CSHWMODIUADD" | "CSHWMODIUADB";

export type IndoorUnitEntry = {
    command: IndoorUnitCommand;
    address: string;
    isMaster: boolean;
};

export type HvacUnitEntry = {
    id: number;
    type: number;
    address: string;
    master: boolean;
    heating: boolean;
    cooling: boolean;
    allowConflictingMode: boolean;
};

type CommandsState = {
    commandText: string;
    commands: CommandEntry[];
    hoveredCommand: string | null;
    lastChange: {
        id: number;
        source: "field" | "text" | "field-click";
        commandKeys: string[];
        textLine: number | null;
    } | null;
};

const commandLines = [
    "CSHWMIV5",
    "CSHWMTO1000",
    "CSHWMRE1",
    "CSHWPTM5",
    "CSHWPHT0",
    "CSHWPCT0",
    "CSHWMIT15",
    "CSHWMXT30",
    "CSHWATS20",
    "CSHWETS16",
    "CSHWDHC1",
    "CSHWDCC1",
    "CSHWCHA0",
    "CSHWCHU0",
    "CSHWCCA0",
    "CSHWCCU0",
    "CSHWTHC30",
    "CSHWDTN2",
    "CSHWTVN00000800",
    "CSHWTHR0",
    "CSHWSCC1",
    "CSHWMLS86400",
    "CSHWCHT6",
    "CSHWCCT6",
    "CSHWCTT10",
    "CSHWHCT10",
    "CSHWMCT21",
    "CSHWTLT2",
    "CSHWTUM30",
    "CSHWCDN0",
    "CSHWMTY1",
    "CSHWMIP172.20.1.18",
    "CSHWMPN502",
    "CSHWMBD9600",
    "CSHWMODIUCLEAR",
    "CSHWMODIUADD320;1",
    "CSHWMODIUADB320;1",
];

const INDOOR_UNITS_CLEAR_COMMAND = "CSHWMODIUCLEAR";
const INDOOR_UNITS_ADD_COMMAND = "CSHWMODIUADD";
const INDOOR_UNITS_ADB_COMMAND = "CSHWMODIUADB";
const indoorUnitManagedCommands = new Set<string>([
    INDOOR_UNITS_CLEAR_COMMAND,
    INDOOR_UNITS_ADD_COMMAND,
    INDOOR_UNITS_ADB_COMMAND,
]);

const HVAC_UNIT_COMMAND = "CSHWHVAC";

const HVAC_FLAG_MASTER = 0x01;
const HVAC_FLAG_HEATING = 0x02;
const HVAC_FLAG_COOLING = 0x04;
const HVAC_FLAG_ALLOW_CONFLICTING = 0x08;

function parseHvacUnitValue(value: string): HvacUnitEntry | null {
    const parts = value.split(";");
    if (parts.length !== 4) return null;

    const id = parseInt(parts[0], 10);
    const type = parseInt(parts[1], 10);
    const address = parts[2];
    const flags = parseInt(parts[3], 10);

    if (isNaN(id) || isNaN(type) || isNaN(flags)) return null;

    return {
        id,
        type,
        address,
        master: (flags & HVAC_FLAG_MASTER) !== 0,
        heating: (flags & HVAC_FLAG_HEATING) !== 0,
        cooling: (flags & HVAC_FLAG_COOLING) !== 0,
        allowConflictingMode: (flags & HVAC_FLAG_ALLOW_CONFLICTING) !== 0,
    };
}

function serializeHvacUnitEntry(entry: HvacUnitEntry): string {
    let flags = 0;
    if (entry.master) flags |= HVAC_FLAG_MASTER;
    if (entry.heating) flags |= HVAC_FLAG_HEATING;
    if (entry.cooling) flags |= HVAC_FLAG_COOLING;
    if (entry.allowConflictingMode) flags |= HVAC_FLAG_ALLOW_CONFLICTING;

    return `${entry.id};${entry.type};${entry.address};${flags}`;
}

const legacyHvacCommands = new Set<string>([
    "CSHWCHT",
    "CSHWCCT",
    "CSHWBOR",
    INDOOR_UNITS_CLEAR_COMMAND,
    INDOOR_UNITS_ADD_COMMAND,
    INDOOR_UNITS_ADB_COMMAND,
]);

function parseCommand(line: string): CommandEntry {
    const [, command = line, value = ""] = line.match(/^([A-Z]+)(.*)$/) ?? [];
    return { command, value };
}

function parseCommandsText(text: string): CommandEntry[] {
    return text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map(parseCommand);
}

function parseIndoorUnitValue(value: string) {
    const [rawAddress = "", rawRole = ""] = value.split(";");

    return {
        address: rawAddress,
        isMaster: rawRole === "1",
    };
}

function getChangedCommandKeys(previous: CommandEntry[], next: CommandEntry[]): string[] {
    const commandKeys = new Set([
        ...previous.map((entry) => entry.command),
        ...next.map((entry) => entry.command),
    ]);

    return [...commandKeys].filter((commandKey) => {
        const previousValues = previous
            .filter((entry) => entry.command === commandKey)
            .map((entry) => entry.value);
        const nextValues = next
            .filter((entry) => entry.command === commandKey)
            .map((entry) => entry.value);

        if (previousValues.length !== nextValues.length) {
            return true;
        }

        return previousValues.some((value, index) => value !== nextValues[index]);
    });
}

function getTextLineForCommand(commands: CommandEntry[], commandKey: string | undefined): number | null {
    if (!commandKey) {
        return null;
    }

    const line = commands.findIndex((entry) => entry.command === commandKey);
    return line >= 0 ? line : null;
}

export function serializeCommands(commands: CommandEntry[]): string {
    return commands.map((entry) => `${entry.command}${entry.value}`).join("\n");
}

let state: CommandsState = {
    commandText: commandLines.join("\n"),
    commands: commandLines.map(parseCommand),
    hoveredCommand: null,
    lastChange: null,
};

let changeId = 0;

function createChange(
    source: "field" | "text" | "field-click",
    commandKeys: string[],
    textLine: number | null,
) {
    return {
        id: ++changeId,
        source,
        commandKeys,
        textLine,
    };
}

const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}

export const commandsStore = {
    getState(): CommandsState {
        return state;
    },
    setCommands(commands: CommandEntry[]) {
        const changedCommandKeys = getChangedCommandKeys(state.commands, commands);
        const primaryCommand = changedCommandKeys[0];

        state = {
            ...state,
            commands,
            commandText: serializeCommands(commands),
            lastChange: createChange(
                "field",
                changedCommandKeys,
                getTextLineForCommand(commands, primaryCommand),
            ),
        };
        notify();
    },
    updateCommandValue(command: string, value: string) {
        const commands = state.commands.map((entry) =>
            entry.command === command ? { ...entry, value } : entry,
        );

        state = {
            ...state,
            commands,
            commandText: serializeCommands(commands),
            lastChange: createChange("field", [command], getTextLineForCommand(commands, command)),
        };
        notify();
    },
    getIndoorUnitEntries(commands = state.commands): IndoorUnitEntry[] {
        return commands
            .filter(
                (entry): entry is CommandEntry & { command: IndoorUnitCommand } =>
                    entry.command === INDOOR_UNITS_ADD_COMMAND ||
                    entry.command === INDOOR_UNITS_ADB_COMMAND,
            )
            .map((entry) => {
                const parsedValue = parseIndoorUnitValue(entry.value);

                return {
                    command: entry.command,
                    address: parsedValue.address,
                    isMaster: parsedValue.isMaster,
                };
            });
    },
    setIndoorUnitEntries(entries: IndoorUnitEntry[]) {
        const existingCommands = state.commands;
        const firstIndoorIndex = existingCommands.findIndex((entry) =>
            indoorUnitManagedCommands.has(entry.command),
        );
        const insertionIndex = firstIndoorIndex >= 0 ? firstIndoorIndex : existingCommands.length;

        const baseCommands = existingCommands.filter(
            (entry) => !indoorUnitManagedCommands.has(entry.command),
        );
        const before = baseCommands.slice(0, insertionIndex);
        const after = baseCommands.slice(insertionIndex);
        const indoorUnitCommands: CommandEntry[] = [
            { command: INDOOR_UNITS_CLEAR_COMMAND, value: "" },
            ...entries.map((entry) => ({
                command: entry.command,
                value: `${entry.address};${entry.isMaster ? 1 : 0}`,
            })),
        ];
        const commands = [...before, ...indoorUnitCommands, ...after];
        const changedCommandKeys = getChangedCommandKeys(state.commands, commands);

        state = {
            ...state,
            commands,
            commandText: serializeCommands(commands),
            lastChange: createChange(
                "field",
                changedCommandKeys,
                getTextLineForCommand(commands, INDOOR_UNITS_CLEAR_COMMAND),
            ),
        };
        notify();
    },
    getHvacUnitEntries(commands = state.commands): HvacUnitEntry[] {
        return commands
            .filter((entry) => entry.command === HVAC_UNIT_COMMAND)
            .map((entry) => parseHvacUnitValue(entry.value))
            .filter((entry): entry is HvacUnitEntry => entry !== null);
    },
    setHvacUnitEntries(entries: HvacUnitEntry[]) {
        const existingCommands = state.commands;
        const firstHvacIndex = existingCommands.findIndex(
            (entry) => entry.command === HVAC_UNIT_COMMAND,
        );
        const insertionIndex = firstHvacIndex >= 0 ? firstHvacIndex : existingCommands.length;

        const baseCommands = existingCommands.filter(
            (entry) => entry.command !== HVAC_UNIT_COMMAND,
        );
        const before = baseCommands.slice(0, insertionIndex);
        const after = baseCommands.slice(insertionIndex);
        const hvacCommands: CommandEntry[] = entries.map((entry) => ({
            command: HVAC_UNIT_COMMAND,
            value: serializeHvacUnitEntry(entry),
        }));
        const commands = [...before, ...hvacCommands, ...after];
        const changedCommandKeys = getChangedCommandKeys(state.commands, commands);

        state = {
            ...state,
            commands,
            commandText: serializeCommands(commands),
            lastChange: createChange(
                "field",
                changedCommandKeys,
                getTextLineForCommand(commands, HVAC_UNIT_COMMAND),
            ),
        };
        notify();
    },
    hasLegacyHvacCommands(commands = state.commands): boolean {
        return commands.some((entry) => legacyHvacCommands.has(entry.command));
    },
    hasNewHvacCommands(commands = state.commands): boolean {
        return commands.some((entry) => entry.command === HVAC_UNIT_COMMAND);
    },
    upgradeLegacyHvac() {
        const commands = state.commands;
        const heaterType = parseInt(
            commands.find((entry) => entry.command === "CSHWCHT")?.value || "0",
            10,
        );
        const coolerType = parseInt(
            commands.find((entry) => entry.command === "CSHWCCT")?.value || "0",
            10,
        );
        const borType = parseInt(
            commands.find((entry) => entry.command === "CSHWBOR")?.value || "0",
            10,
        );

        const indoorEntries = this.getIndoorUnitEntries(commands);

        // Determine the effective type: prefer CHT/CCT, fall back to BOR
        const effectiveHeaterType = heaterType || borType;
        const effectiveCoolerType = coolerType || borType;
        const unitType = effectiveHeaterType || effectiveCoolerType;

        const hvacEntries: HvacUnitEntry[] = indoorEntries.map((entry, index) => ({
            id: index,
            type: unitType,
            address: entry.address,
            master: entry.isMaster,
            heating: effectiveHeaterType !== 0,
            cooling: effectiveCoolerType !== 0,
            allowConflictingMode: false,
        }));

        // Remove all legacy commands
        const cleanedCommands = commands.filter(
            (entry) => !legacyHvacCommands.has(entry.command),
        );

        // Add new HVAC commands
        const hvacCommands: CommandEntry[] = hvacEntries.map((entry) => ({
            command: HVAC_UNIT_COMMAND,
            value: serializeHvacUnitEntry(entry),
        }));

        const nextCommands = [...cleanedCommands, ...hvacCommands];
        const changedCommandKeys = getChangedCommandKeys(state.commands, nextCommands);

        state = {
            ...state,
            commands: nextCommands,
            commandText: serializeCommands(nextCommands),
            lastChange: createChange(
                "field",
                changedCommandKeys,
                getTextLineForCommand(nextCommands, HVAC_UNIT_COMMAND),
            ),
        };
        notify();
    },
    setCommandsFromText(text: string, editedLine?: number) {
        const commands = parseCommandsText(text);
        const changedCommandKeys = getChangedCommandKeys(state.commands, commands);
        const primaryCommand = changedCommandKeys[0];

        state = {
            ...state,
            commandText: text,
            commands,
            lastChange: createChange(
                "text",
                changedCommandKeys,
                editedLine ?? getTextLineForCommand(commands, primaryCommand),
            ),
        };
        notify();
    },
    flashCommandLine(command: string) {
        state = {
            ...state,
            lastChange: createChange(
                "field-click",
                [command],
                getTextLineForCommand(state.commands, command),
            ),
        };
        notify();
    },
    setHoveredCommand(command: string | null) {
        if (state.hoveredCommand === command) {
            return;
        }

        state = {
            ...state,
            hoveredCommand: command,
        };
        notify();
    },
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};

export function useCommandsStore() {
    return useSyncExternalStore(commandsStore.subscribe, commandsStore.getState);
}