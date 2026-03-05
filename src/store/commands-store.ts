import { useSyncExternalStore } from "react";

export type CommandEntry = {
    command: string;
    value: string;
};

type CommandsState = {
    commandText: string;
    commands: CommandEntry[];
    lastChange: {
        id: number;
        source: "field" | "text";
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
    "CSHWBOR0",
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

function getChangedCommandKeys(previous: CommandEntry[], next: CommandEntry[]): string[] {
    const previousMap = new Map(previous.map((entry) => [entry.command, entry.value]));
    const nextMap = new Map(next.map((entry) => [entry.command, entry.value]));
    const commandKeys = new Set([...previousMap.keys(), ...nextMap.keys()]);

    return [...commandKeys].filter((commandKey) => previousMap.get(commandKey) !== nextMap.get(commandKey));
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
    lastChange: null,
};

let changeId = 0;

function createChange(source: "field" | "text", commandKeys: string[], textLine: number | null) {
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
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};

export function useCommandsStore() {
    return useSyncExternalStore(commandsStore.subscribe, commandsStore.getState);
}