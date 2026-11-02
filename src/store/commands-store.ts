import { useSyncExternalStore } from "react";

export type CommandEntry = {
    command: string;
    value: string;
};

export type IndoorUnitEntry = {
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
];

const INDOOR_UNITS_CLEAR_COMMAND = "CSHWMODIUCLEAR";
const INDOOR_UNITS_ADD_COMMAND = "CSHWMODIUADD";
// The gateway has no handler for ADB; it is only listed so old configs get cleaned up.
const INDOOR_UNITS_ADB_COMMAND = "CSHWMODIUADB";
const indoorUnitManagedCommands = new Set<string>([
    INDOOR_UNITS_CLEAR_COMMAND,
    INDOOR_UNITS_ADD_COMMAND,
    INDOOR_UNITS_ADB_COMMAND,
]);

// While any of these is non-zero the gateway builds its units from them and the
// indoor-unit list, and ignores every CSHWHVAC slot.
const legacyHvacTypeCommands = ["CSHWCHT", "CSHWCCT", "CSHWBOR"];

const HVAC_UNIT_COMMAND = "CSHWHVAC";
export const HVAC_SLOT_COUNT = 10;

const HVAC_TYPE_NA = 0;
const HVAC_TYPE_OPENTHERM = 1;
const HVAC_TYPE_RELAY = 2;
const HVAC_TYPE_SAMSUNG = 3;
const HVAC_TYPE_HISENSE = 9;

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

// Matches the gateway's default for an unused slot.
function emptyHvacSlot(id: number): HvacUnitEntry {
    return {
        id,
        type: HVAC_TYPE_NA,
        address: "0",
        master: false,
        heating: false,
        cooling: false,
        allowConflictingMode: false,
    };
}

function isEmptyHvacSlot(entry: HvacUnitEntry) {
    return serializeHvacUnitEntry(entry) === serializeHvacUnitEntry(emptyHvacSlot(entry.id));
}

const hvacManagedCommands = new Set<string>([
    HVAC_UNIT_COMMAND,
    ...legacyHvacTypeCommands,
    ...indoorUnitManagedCommands,
]);

function getNumericValue(commands: CommandEntry[], command: string): number {
    return parseInt(commands.find((entry) => entry.command === command)?.value || "0", 10) || 0;
}

/** Puts `replacement` where the first managed command was (or at the end) and drops the other managed commands. */
function replaceManagedCommands(
    commands: CommandEntry[],
    managedCommands: Set<string>,
    replacement: CommandEntry[],
): CommandEntry[] {
    const firstManagedIndex = commands.findIndex((entry) => managedCommands.has(entry.command));
    const insertionIndex = firstManagedIndex >= 0 ? firstManagedIndex : commands.length;
    const unmanagedCommands = commands.filter((entry) => !managedCommands.has(entry.command));

    return [
        ...unmanagedCommands.slice(0, insertionIndex),
        ...replacement,
        ...unmanagedCommands.slice(insertionIndex),
    ];
}

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

/** Mirrors HvacUnitManager::SetupLegacyHvacs in the gateway firmware. */
function legacyHvacUnits(commands: CommandEntry[]): HvacUnitEntry[] {
    let heaterType = getNumericValue(commands, "CSHWCHT");
    let coolerType = getNumericValue(commands, "CSHWCCT");
    if (heaterType === HVAC_TYPE_NA && coolerType === HVAC_TYPE_NA) {
        heaterType = getNumericValue(commands, "CSHWBOR");
        coolerType = heaterType;
    }

    const indoorUnits = commands
        .filter((entry) => entry.command === INDOOR_UNITS_ADD_COMMAND)
        .map((entry) => parseIndoorUnitValue(entry.value));
    const units: HvacUnitEntry[] = [];

    const addUnits = (type: number, heating: boolean, cooling: boolean) => {
        if (type === HVAC_TYPE_NA || type > HVAC_TYPE_HISENSE) return;

        if (type === HVAC_TYPE_OPENTHERM || type === HVAC_TYPE_RELAY) {
            units.push({
                id: units.length,
                type,
                address: "0",
                master: true,
                heating,
                cooling,
                allowConflictingMode: false,
            });
            return;
        }

        for (const indoorUnit of indoorUnits) {
            units.push({
                id: units.length,
                type,
                address: indoorUnit.address,
                master: indoorUnit.isMaster,
                heating,
                cooling,
                allowConflictingMode: !indoorUnit.isMaster && type !== HVAC_TYPE_SAMSUNG,
            });
        }
    };

    if (heaterType === coolerType) {
        addUnits(heaterType, true, true);
    } else {
        addUnits(heaterType, true, false);
        addUnits(coolerType, false, true);
    }

    return units.slice(0, HVAC_SLOT_COUNT);
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
            .filter((entry) => entry.command === INDOOR_UNITS_ADD_COMMAND)
            .map((entry) => parseIndoorUnitValue(entry.value));
    },
    setIndoorUnitEntries(entries: IndoorUnitEntry[]) {
        const indoorUnitCommands: CommandEntry[] = [
            { command: INDOOR_UNITS_CLEAR_COMMAND, value: "" },
            ...entries.map((entry) => ({
                command: INDOOR_UNITS_ADD_COMMAND,
                value: `${entry.address};${entry.isMaster ? 1 : 0}`,
            })),
        ];
        const commands = replaceManagedCommands(
            state.commands,
            indoorUnitManagedCommands,
            indoorUnitCommands,
        );
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
            .filter((entry): entry is HvacUnitEntry => entry !== null && !isEmptyHvacSlot(entry));
    },
    /**
     * Writes all slots, so a removed unit is also cleared on the gateway, and
     * zeroes the legacy types so the gateway uses these slots at all.
     */
    setHvacUnitEntries(entries: HvacUnitEntry[]) {
        const slots = Array.from(
            { length: HVAC_SLOT_COUNT },
            (_, id) => entries.find((entry) => entry.id === id) ?? emptyHvacSlot(id),
        );
        const hvacCommands: CommandEntry[] = [
            ...legacyHvacTypeCommands.map((command) => ({ command, value: "0" })),
            ...slots.map((slot) => ({
                command: HVAC_UNIT_COMMAND,
                value: serializeHvacUnitEntry(slot),
            })),
        ];
        const commands = replaceManagedCommands(state.commands, hvacManagedCommands, hvacCommands);
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
    hasLegacyHvacTypes(commands = state.commands): boolean {
        return legacyHvacTypeCommands.some((command) => getNumericValue(commands, command) !== 0);
    },
    hasLegacyHvacCommands(commands = state.commands): boolean {
        return (
            this.hasLegacyHvacTypes(commands) ||
            commands.some((entry) => indoorUnitManagedCommands.has(entry.command))
        );
    },
    hasNewHvacCommands(commands = state.commands): boolean {
        return commands.some((entry) => entry.command === HVAC_UNIT_COMMAND);
    },
    upgradeLegacyHvac() {
        this.setHvacUnitEntries(legacyHvacUnits(state.commands));
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