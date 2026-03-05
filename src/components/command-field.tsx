import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldTitle,
} from "@/components/ui/field";
import commandsRegistry from "@/commands-registery.json";
import { commandsStore, useCommandsStore } from "@/store/commands-store";

type CommandFieldProps = {
    command: string;
};

type RegistryValueType = "text" | "number";

type CommandDefinition = {
    id: string;
    code: string;
    category: string;
    label: string;
    description?: string;
    valueType: RegistryValueType;
    required?: boolean;
    defaultValue?: string | number;
    valueFormat?: string;
    min?: number;
    max?: number;
    step?: number;
    options?: { value: string | number; label: string }[];
    deprecated?: boolean;
    deprecatedMessage?: string;
};

const registry = commandsRegistry as CommandDefinition[];

function sanitizeValue(value: string, valueType: RegistryValueType) {
    if (valueType === "number") {
        return value.replace(/\D/g, "");
    }

    return value;
}

export function CommandField({ command }: CommandFieldProps) {
    const { commands } = useCommandsStore();
    const definition = registry.find((entry) => entry.code === command);

    if (!definition) {
        return null;
    }

    const value = commands.find((entry) => entry.command === command)?.value ?? "";
    const inputType = definition.valueType;
    const placeholder =
        definition.defaultValue !== undefined
            ? String(definition.defaultValue)
            : undefined;

    const updateValue = (nextValue: string) => {
        const hasCommand = commands.some((entry) => entry.command === command);

        if (hasCommand) {
            commandsStore.updateCommandValue(command, nextValue);
            return;
        }

        commandsStore.setCommands([
            ...commands,
            { command, value: nextValue },
        ]);
    };

    return (
        <Field className="gap-1.5">
            <FieldTitle className="flex w-full items-center justify-between text-sm leading-tight">
                <span>{definition.label}</span>
                <span className="flex items-center gap-2">
                    {definition.deprecated ? <Badge variant="destructive">Deprecated</Badge> : null}
                    <span className="text-sm font-normal text-muted-foreground">{definition.code}</span>
                </span>
            </FieldTitle>
            {definition.description ? (
                <FieldDescription className="text-sm">{definition.description}</FieldDescription>
            ) : null}
            {definition.deprecatedMessage ? (
                <FieldDescription className="text-sm">{definition.deprecatedMessage}</FieldDescription>
            ) : null}
            <FieldContent>
                {definition.options?.length ? (
                    <Select value={value || String(definition.defaultValue ?? "")} onValueChange={updateValue}>
                        <SelectTrigger className="h-9 w-full bg-background text-sm">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {definition.options.map((option) => (
                                <SelectItem key={String(option.value)} value={String(option.value)}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        type={inputType}
                        min={definition.min}
                        max={definition.max}
                        step={definition.step}
                        placeholder={placeholder}
                        value={value}
                        onChange={(event) => {
                            const sanitizedValue = sanitizeValue(
                                event.target.value,
                                definition.valueType,
                            );

                            updateValue(sanitizedValue);
                        }}
                    />
                )}

            </FieldContent>
        </Field>
    );
}
