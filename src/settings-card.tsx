import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { ModbusCategory } from "./categories/modbus-category"

export function SettingsCard() {
    return (
        <Accordion type="single" collapsible defaultValue="modbus" className="h-full min-h-[18rem] space-y-3 overflow-auto">
            <AccordionItem value="modbus" className="border px-3">
                <AccordionTrigger>Modbus</AccordionTrigger>
                <AccordionContent><ModbusCategory /></AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
