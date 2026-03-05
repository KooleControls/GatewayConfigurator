function splitLines(rawCommands: string) {
  return rawCommands
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function toCommandValuesByCode(rawCommands: string, knownCommandCodes: string[]) {
  const valuesByCode = new Map<string, string[]>()
  const codesByLength = [...knownCommandCodes].sort((a, b) => b.length - a.length)

  for (const line of splitLines(rawCommands)) {
    const matchedCode = codesByLength.find((code) => line.startsWith(code))

    if (!matchedCode) {
      continue
    }

    const value = line.slice(matchedCode.length)
    const currentValues = valuesByCode.get(matchedCode) ?? []
    valuesByCode.set(matchedCode, [...currentValues, value])
  }

  return valuesByCode
}

export function getChangedCommandCodes(
  previousRawCommands: string,
  nextRawCommands: string,
  knownCommandCodes: string[]
) {
  const previousValuesByCode = toCommandValuesByCode(
    previousRawCommands,
    knownCommandCodes
  )
  const nextValuesByCode = toCommandValuesByCode(nextRawCommands, knownCommandCodes)

  return knownCommandCodes.filter((commandCode) => {
    const previousValues = previousValuesByCode.get(commandCode) ?? []
    const nextValues = nextValuesByCode.get(commandCode) ?? []

    if (previousValues.length !== nextValues.length) {
      return true
    }

    return previousValues.some((value, index) => value !== nextValues[index])
  })
}

export function getCommandValue(rawCommands: string, commandCode: string) {
  const lines = splitLines(rawCommands)
  const matchedLine = lines.find((line) => line.startsWith(commandCode))

  if (!matchedLine) {
    return ""
  }

  return matchedLine.slice(commandCode.length)
}

export function setCommandValue(
  rawCommands: string,
  commandCode: string,
  nextValue: string
) {
  const lines = splitLines(rawCommands)
  const normalizedValue = nextValue.trim()
  const nextCommandLine = `${commandCode}${normalizedValue}`
  const commandLineIndex = lines.findIndex((line) => line.startsWith(commandCode))

  if (commandLineIndex === -1) {
    if (!normalizedValue) {
      return lines.join("\n")
    }

    return [...lines, nextCommandLine].join("\n")
  }

  if (!normalizedValue) {
    const nextLines = lines.filter((_, index) => index !== commandLineIndex)
    return nextLines.join("\n")
  }

  const nextLines = [...lines]
  nextLines[commandLineIndex] = nextCommandLine

  return nextLines.join("\n")
}
