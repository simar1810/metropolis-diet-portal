
const KG_TO_LBS = 2.20462
const CM_PER_INCH = 2.54
const INCHES_PER_FOOT = 12

export const convertWeight = function (value, unit) {
  if (unit === "kg") {
    return {
      value: +(value * KG_TO_LBS).toFixed(2),
      unit: "lbs",
    }
  }
  if (unit === "lbs") {
    return {
      value: +(value / KG_TO_LBS).toFixed(2),
      unit: "kg",
    }
  }
  throw new Error("Invalid unit. Use 'kg' or 'lbs'")
}

export function convertHeight(value, unit) {
  if (unit === "cm") {
    const cm = parseFloat(value)
    if (isNaN(cm)) return { value: "", unit: "ft/in" }

    const totalInches = cm / CM_PER_INCH
    const feet = Math.floor(totalInches / INCHES_PER_FOOT)
    const inches = Math.round(totalInches % INCHES_PER_FOOT)

    return {
      value: `${feet}'${inches}"`,
      unit: "ft/in",
    }
  }
  if (unit === "ft/in") {
    const match = value.match(/(\d+)'(\d+)?/)
    if (!match) return { value: "", unit: "cm" }

    const feet = parseInt(match[1] || 0, 10)
    const inches = parseInt(match[2] || 0, 10)

    const cm = Math.round((feet * INCHES_PER_FOOT + inches) * CM_PER_INCH)

    return {
      value: String(cm),
      unit: "cm",
    }
  }
  throw new Error("Invalid height unit")
}
