import { useSyncExternalStore } from "react";

export type CommandEntry = {
    command: string;
    value: string;
};

type CommandsState = {
    commandText: string;
    commands: CommandEntry[];
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

export function serializeCommands(commands: CommandEntry[]): string {
    return commands.map((entry) => `${entry.command}${entry.value}`).join("\n");
}

let state: CommandsState = {
    commandText: commandLines.join("\n"),
    commands: commandLines.map(parseCommand),
};

const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}

export const commandsStore = {
    getState(): CommandsState {
        return state;
    },
    setCommands(commands: CommandEntry[]) {
        state = {
            ...state,
            commands,
            commandText: serializeCommands(commands),
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
        };
        notify();
    },
    setCommandsFromText(text: string) {
        state = {
            ...state,
            commandText: text,
            commands: parseCommandsText(text),
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