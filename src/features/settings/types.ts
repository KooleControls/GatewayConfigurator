export type CommandValueType = "text" | "number"

export type CommandFieldConfig = {
  description?: string
  min?: number
  max?: number
  step?: number
  options?: Array<{
    value: string
    label: string
  }>
}

export type CommandDefinition = {
  id: string
  code: string
  label: string
  description?: string
  valueType?: CommandValueType
}

export type CommandRegistryEntry = CommandDefinition & {
  features?: string[]
  deprecated?: boolean
  field?: CommandFieldConfig
}

export type CommandRegistry = {
  initialCommands: string[]
  commands: CommandRegistryEntry[]
}

export type FeatureGroup = {
  id: string
  title: string
  description: string
  commandIds: string[]
}

export type CommandValues = Record<string, string>

export type ParsedCommands = {
  values: CommandValues
  unknownLines: string[]
}
