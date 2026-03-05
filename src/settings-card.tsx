import { useMemo, useState } from "react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { ModbusCategory } from "./categories/modbus-category"
import { HvacCategory } from "./categories/hvac-category"
import { TimesCategory } from "./categories/times-category"
import { InputsCategory } from "./categories/inputs-category"
import { ThermostatCategory } from "./categories/thermostat-category"
import { NighttimeCategory } from "./categories/nighttime-category"
import { PreconditioningCategory } from "./categories/preconditioning-category"
import { getMatchingAccordionSections } from "@/lib/command-search"

type SettingsCardProps = {
    searchQuery: string;
    onSearchQueryChange: (value: string) => void;
};

export function SettingsCard({ searchQuery, onSearchQueryChange }: SettingsCardProps) {
    const [openSections, setOpenSections] = useState<string[]>([])
    const normalizedSearchQuery = searchQuery.trim()
    const matchingSections = useMemo(
        () => getMatchingAccordionSections(searchQuery),
        [searchQuery],
    )

    const accordionValue = normalizedSearchQuery ? matchingSections : openSections

    return (
        <div className="flex h-full min-h-[18rem] flex-col gap-3">
            <Input
                type="search"
                placeholder="Search settings"
                value={searchQuery}
                onChange={(event) => {
                    onSearchQueryChange(event.target.value)
                }}
            />
            <Accordion
                type="multiple"
                value={accordionValue}
                onValueChange={(value) => {
                    if (!normalizedSearchQuery) {
                        setOpenSections(value)
                    }
                }}
                className="min-h-0 flex-1 space-y-3 overflow-auto"
            >
                <AccordionItem value="modbus" className="border px-3">
                    <AccordionTrigger>Modbus</AccordionTrigger>
                    <AccordionContent>
                        <ModbusCategory searchQuery={searchQuery} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hvac" className="border px-3">
                    <AccordionTrigger>HVAC</AccordionTrigger>
                    <AccordionContent>
                        <HvacCategory searchQuery={searchQuery} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="times" className="border px-3">
                    <AccordionTrigger>Timings</AccordionTrigger>
                    <AccordionContent>
                        <TimesCategory searchQuery={searchQuery} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="io" className="border px-3">
                    <AccordionTrigger>Inputs / Outputs</AccordionTrigger>
                    <AccordionContent>
                        <InputsCategory searchQuery={searchQuery} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="thermostat" className="border px-3">
                    <AccordionTrigger>Thermostat</AccordionTrigger>
                    <AccordionContent>
                        <ThermostatCategory searchQuery={searchQuery} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="nighttime" className="border px-3">
                    <AccordionTrigger>Nighttime</AccordionTrigger>
                    <AccordionContent>
                        <NighttimeCategory searchQuery={searchQuery} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="preconditioning" className="border px-3">
                    <AccordionTrigger>Preconditioning</AccordionTrigger>
                    <AccordionContent>
                        <PreconditioningCategory searchQuery={searchQuery} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
