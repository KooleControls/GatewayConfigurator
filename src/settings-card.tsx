import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { ModbusCategory } from "./categories/modbus-category"
import { HvacCategory } from "./categories/hvac-category"
import { TimesCategory } from "./categories/times-category"
import { InputsCategory } from "./categories/inputs-category"
import { ThermostatCategory } from "./categories/thermostat-category"
import { NighttimeCategory } from "./categories/nighttime-category"
import { PreconditioningCategory } from "./categories/preconditioning-category"

export function SettingsCard() {
    return (
        <Accordion type="single" collapsible defaultValue="modbus" className="h-full min-h-[18rem] space-y-3 overflow-auto">
            <AccordionItem value="modbus" className="border px-3">
                <AccordionTrigger>Modbus</AccordionTrigger>
                <AccordionContent>
                    <ModbusCategory />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="hvac" className="border px-3">
                <AccordionTrigger>HVAC</AccordionTrigger>
                <AccordionContent>
                    <HvacCategory />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="times" className="border px-3">
                <AccordionTrigger>Timings</AccordionTrigger>
                <AccordionContent>
                    <TimesCategory />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="io" className="border px-3">
                <AccordionTrigger>Inputs / Outputs</AccordionTrigger>
                <AccordionContent>
                    <InputsCategory />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="thermostat" className="border px-3">
                <AccordionTrigger>Thermostat</AccordionTrigger>
                <AccordionContent>
                    <ThermostatCategory />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="nighttime" className="border px-3">
                <AccordionTrigger>Nighttime</AccordionTrigger>
                <AccordionContent>
                    <NighttimeCategory />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="preconditioning" className="border px-3">
                <AccordionTrigger>Preconditioning</AccordionTrigger>
                <AccordionContent>
                    <PreconditioningCategory />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
