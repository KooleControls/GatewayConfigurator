import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "./components/ui/textarea";
import { commandsStore, useCommandsStore } from "./store/commands-store";





export function CommandsCard()
{
    const { commandText } = useCommandsStore();


    return (
        <Card className="h-full min-h-[18rem]">
            <CardContent className="flex h-full min-h-0">
                <Textarea
                    value={commandText}
                    onChange={(event) => {
                        commandsStore.setCommandsFromText(event.target.value);
                    }}
                    className="h-full min-h-0 overflow-auto"
                />
            </CardContent>
        </Card>
    ); 
};


