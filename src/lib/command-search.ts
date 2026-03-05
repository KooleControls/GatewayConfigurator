import commandsRegistry from "@/commands-registery.json";

type CommandDefinition = {
    code: string;
    category: string;
    label?: string;
    description?: string;
    deprecatedMessage?: string;
};

const registry = commandsRegistry as CommandDefinition[];

const registryByCode = new Map(registry.map((entry) => [entry.code, entry]));

const sectionSearchText: Record<string, string> = {
    modbus: "modbus",
    hvac: "hvac indoor units indoor unit",
    times: "timings times",
    io: "inputs outputs io",
    thermostat: "thermostat",
    nighttime: "nighttime night",
    preconditioning: "preconditioning",
};

const indoorUnitsSearchText = [
    "indoor units",
    "indoor unit",
    "master",
    "address",
    "cshwmodiuclear",
    "cshwmodiuadd",
    "cshwmodiuadb",
].join(" ");

function normalizeQuery(query: string) {
    return query.trim().toLowerCase();
}

function mapCategoryToSection(category: string) {
    if (category === "inputs") {
        return "io";
    }

    return category;
}

export function matchesCommandQuery(commandKey: string, query: string) {
    const normalizedQuery = normalizeQuery(query);

    if (!normalizedQuery) {
        return true;
    }

    const definition = registryByCode.get(commandKey);
    const searchableText = [
        commandKey,
        definition?.label,
        definition?.description,
        definition?.deprecatedMessage,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return searchableText.includes(normalizedQuery);
}

export function getMatchingAccordionSections(query: string) {
    const normalizedQuery = normalizeQuery(query);

    if (!normalizedQuery) {
        return [];
    }

    const sections = new Set<string>();

    for (const [section, text] of Object.entries(sectionSearchText)) {
        if (text.includes(normalizedQuery)) {
            sections.add(section);
        }
    }

    for (const definition of registry) {
        if (matchesCommandQuery(definition.code, normalizedQuery)) {
            sections.add(mapCategoryToSection(definition.category));
        }
    }

    if (indoorUnitsSearchText.includes(normalizedQuery)) {
        sections.add("hvac");
    }

    return [...sections];
}
