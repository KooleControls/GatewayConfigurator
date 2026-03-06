import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { commandsStore } from "@/store/commands-store";
import presetsData from "@/registry/examples-presets.json";

type SettingPreset = {
    value: string;
    label: string;
    description?: string;
    commands: string[];
};

const settingPresets = (presetsData.presets as SettingPreset[]).map((preset) => ({
    ...preset,
    commandText: preset.commands.join("\n"),
}));

export function ExamplesCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Examples</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {settingPresets.map((preset) => (
                    <Button
                        key={preset.value}
                        type="button"
                        variant="outline"
                        className="h-auto min-h-9 w-full items-start justify-start whitespace-normal py-2"
                        onClick={() => {
                            commandsStore.setCommandsFromText(preset.commandText);
                        }}
                    >
                        <span className="text-left break-words">
                            <span className="block">{preset.label}</span>
                            {preset.description ? (
                                <span className="block text-xs text-muted-foreground">{preset.description}</span>
                            ) : null}
                        </span>
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
}
