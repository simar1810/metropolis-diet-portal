import { extractNumber } from "../utils";

export function calculateBMI({ height, heightUnit, weight, weightUnit }) {
  let heightInMeters;
  // if (height == null) throw new Error("Height in cms is required.");

  if (heightUnit?.toLowerCase() === 'cms' || heightUnit?.toLowerCase() === 'cm') {
    heightInMeters = cms / 100;
  } else if (heightUnit?.toLowerCase() === 'inches') {
    const [feet, inches] = height.split(".");
    heightInMeters = ((Number(feet) || 0) * 30.48) + ((Number(inches) || 0) * 2.54)
    if (heightUnit.toLowerCase() === "cms" || heightUnit.toLowerCase() === "cm") {
      heightInMeters = Number(height) / 100; // FIXED: changed `cms` to `height` and added Number()
    } else if (heightUnit.toLowerCase() === "inches") {
      const [feet, inches] = String(height).split(".");
      heightInMeters =
        ((Number(feet) || 0) * 12 + (Number(inches) || 0)) * 0.0254; // FIXED: proper inches to meters conversion
    } else {
      // throw new Error('Invalid height unit. Use "cms" or "inches".');
    }

    const weightInKgs = weightUnit?.toLowerCase() === 'pounds' ? weight / 2.20462 : weight;
    const bmi = weightInKgs / (heightInMeters * heightInMeters);

    return parseFloat(bmi.toFixed(1));
  }
}

export function calculateIdealWeight({
  cms,
  heightUnit,
  feet,
  inches,
  gender,
  unit,
  referenceBMI = 23.0,
}) {
  let heightInCM;

  // Normalize input units
  const heightUnitLower = heightUnit?.toLowerCase();
  const unitLower = unit?.toLowerCase();

  // Validate and calculate height in cm
  if (heightUnitLower === "cms" || heightUnitLower === "cm") {
    if (!cms || cms < 100 || cms > 250) {
      throw new Error("Height in cm must be between 100 and 250.");
    }
    heightInCM = cms;
  } else if (heightUnitLower === "inches" || heightUnitLower === "feet") {
    if (feet == null || feet <= 0) {
      throw new Error("Feet value is required for height in feet.");
    }
    const totalInches = feet * 12 + (inches || 0);
    heightInCM = totalInches * 2.54;
  } else {
    // throw new Error('Invalid height unit. Use "cms" or "inches".');
    throw new Error(
      'Invalid height unit. Use "cms", "cm", "inches", or "feet".'
    );
  }

  const heightInMeters = heightInCM / 100.0;

  // Apply reference BMI formula
  let idealWeightKg = referenceBMI * heightInMeters ** 2; // in kilograms

  // Convert to pounds if needed
  const finalWeight =
    unitLower === "pounds" ? idealWeightKg * 2.20462 : idealWeightKg;


  return Math.round(finalWeight);
}

function generateHeightStandard({
  heightUnit, // e.g. inches, inch, cm, cms
  heightCms,
  heightInches,
  heightFeet,
}) {
  try {
    if (["inches", "inch"].includes(heightUnit.toLowerCase())) {
      return ((Number(heightFeet) * 0.3048) + (Number(heightInches) * 0.0254)).toFixed(2);
    } else if (["cms", "cm"].includes(heightUnit.toLowerCase())) {
      return (Number(heightCms) / 100).toFixed(2);
    } else {
      throw new Error("Please provide correct height unit");
    }
  } catch (error) {
    return 0;
  }
}

export function generateWeightStandard({
  weightUnit, // e.g. "kg", "kgs", "pounds", "pound"
  weightInPounds,
  weightInKgs,
  weight
}) {
  try {
    if (["kg", "kgs"].includes(weightUnit?.toLowerCase())) {
      return extractNumber(weightInKgs) || extractNumber(weight)
    } else if (["pounds", "pound"].includes(weightUnit?.toLowerCase())) {
      return (extractNumber(weightInPounds) * 0.453592).toFixed(2) || extractNumber(weight)
    } else {
      throw new Error("Please provide correct height unit");
    }
  } catch (error) {
    return 0;
  }
}

export function calculateBMIFinal(data) {
  try {
    const height = generateHeightStandard(data);
    const weight = generateWeightStandard(data);
    return Number((weight / (height * height)).toFixed(1));
  } catch (error) {
    return 0;
  }
}

export function calculateIdealWeightFinal(data) {
  try {
    const height = generateHeightStandard(data);
    return Number((23.0 * height ** 2).toFixed(2));
  } catch (error) {
    return 0;
  }
}

// calculate skeletal mass percentage
export function calculateSMPFinal(data) {
  try {
    const height = generateHeightStandard(data);
    const weight = generateWeightStandard(data);
    const genderInt = data?.gender?.toLowerCase() === 'male' ? 1 : 0;
    let skeletalMuscleMass = (0.22 * weight) + (6.5 * height) - (0.1 * data.age) + (5.8 * genderInt) - 3.5;
    let skeletalMassPercentage = (skeletalMuscleMass / weight) * 100;
    switch (data.bodyComposition?.toLowerCase()) {
      case "slim":
        skeletalMassPercentage += 0.5;
        break;
      case "medium":
        skeletalMassPercentage += 1.0;
        break;
      case "fat":
        skeletalMassPercentage -= 2.0;
        break;
      default:
        break;
    }
    skeletalMassPercentage = Math.max(25.0, Math.min(42.0, skeletalMassPercentage));
    return Math.round(skeletalMassPercentage * 10) / 10;
  } catch (error) {
    return 0;
  }
}

export function calculateBodyFatFinal(data) {
  try {
    const bmi = calculateBMIFinal(data);
    const bmiNum = parseFloat(bmi);
    const ageNum = parseInt(data.age);
    const genderInt = data.gender?.toLowerCase() === "male" ? 1 : 0;

    let fat;
    switch (data?.bodyComposition?.toLowerCase()) {
      case "slim":
        fat = 1.3 * bmiNum + 0.23 * ageNum - 10.8 * genderInt - 5.4 - 2.5;
        break;
      case 'medium':
        fat = 1.30 * bmi + 0.23 * (data.age || 0) - 10.8 * genderInt - 5.4;
        break;
      case 'fat':
        fat = 1.30 * bmi + 0.23 * (data.age || 0) - 10.8 * genderInt - 5.4 + 2.5;
        break;
      default:
        throw new Error('Invalid or missing body composition. Use "slim", "medium", or "fat".');
    }

    fat = Math.max(5.0, Math.min(35.0, fat));

    return parseFloat(fat.toFixed(1));
  } catch (error) {
    return 0;
  }
}

export function calculateBMRFinal(data) {
  try {
    const height = generateHeightStandard(data);
    const weight = generateWeightStandard(data);
    return Math.round(
      data.gender?.toLowerCase() === "male"
        ? 10 * weight + 6.25 * (height * 100) - 5 * data.age + 5
        : 10 * weight + 6.25 * (height * 100) - 5 * data.age - 161
    )
  } catch (error) {
    return 0;
  }
}

export function calculateBodyAgeFinal(data) {
  try {
    const bmi = calculateBMIFinal(data);
    const fat = calculateBodyFatFinal(data);
    let bodyAge = data.age;

    const gender = data.gender?.toLowerCase() || '';
    const bodyComposition = data.bodyComposition?.toLowerCase() || '';

    if (bmi < 18.5) {
      bodyAge += 2;
    } else if (bmi > 25.0) {
      bodyAge += 3;
    } else {
      bodyAge -= 1;
    }

    if (gender === 'male') {
      if (fat < 8.0) {
        bodyAge -= 2;
      } else if (fat > 25.0) {
        bodyAge += 4;
      }
    } else if (gender === 'female') {
      if (fat < 21.0) {
        bodyAge -= 2;
      } else if (fat > 32.0) {
        bodyAge += 4;
      }
    }

    // Body composition adjustments
    switch (bodyComposition) {
      case 'slim':
        bodyAge -= 1;
        break;
      case 'fat':
        bodyAge += 2;
        break;
    }

    // Ensure bodyAge is not negative
    return Math.max(0, Math.round(bodyAge));
  } catch (error) {
    return 0;
  }
}

export function calculateBMI2({
  height,
  heightUnit,
  feet,
  inches,
  weightPounds,
  weightKgs,
  weightUnit,
}) {
  let heightInMeters;

  if (heightUnit?.toLowerCase() === 'cm' || heightUnit?.toLowerCase() === 'cms') {
    // if (height == null) throw new Error("Height in cm is required.");
    if (heightUnit.toLowerCase() === "cm" || heightUnit.toLowerCase() === "cms") {
      if (height == null) throw new Error("Height in cm is required.");
      heightInMeters = height / 100.0;
    } else if (heightUnit?.toLowerCase() === 'inches') {
    } else if (heightUnit.toLowerCase() === "inches") {
      heightInMeters = height / 3.28084;
    } else {
      // throw new Error('Invalid height unit. Use "cms" or "inches".');
    }

    const weightInKgs = weightUnit?.toLowerCase() === 'pounds' ? weight / 2.20462 : weight;
    const bmi = weightInKgs / (heightInMeters * heightInMeters);

    return parseFloat(bmi.toFixed(1));
  }
}

export function calculateSkeletalMassPercentage({
  gender,
  weight,
  heightFeet,
  heightInches,
  heightCms,
  height,
  age,
  bodyAge,
  bodyComposition,
  weightUnit,
  heightUnit,
}) {
  // Convert to numbers if passed as strings
  weight = parseFloat(weight);
  height = parseFloat(height);
  age = parseInt(age);

  const weightInKgs = weightUnit === "Pounds" ? weight * 0.453592 : weight;

  const heightInCms =
    heightUnit === "Cm"
      ? height
      : heightUnit === "Feet-Inches"
        ? (parseInt(heightFeet || 0) * 12 + parseInt(heightInches || 0)) * 2.54
        : height * 12 * 2.54; // fallback if height is in feet

  const heightInMeters = heightInCms / 100.0;

  const genderInt = gender?.toLowerCase() === 'male' ? 1 : 0;

  let skeletalMuscleMass =
    0.22 * weightInKgs +
    6.5 * heightInMeters -
    0.1 * Number(age || bodyAge || 0) +
    5.8 * genderInt -
    3.5;
  0.26 * weightInKgs +
    6.3 * heightInMeters -
    0.15 * age +
    5.1 * genderInt -
    2.5;

  let skeletalMassPercentage = (skeletalMuscleMass / Number(weightInKgs || 0)) * 100;

  switch (bodyComposition?.toLowerCase()) {
    case 'slim':
      switch (bodyComposition?.toLowerCase()) {
        case "slim":
          skeletalMassPercentage += 0.5;
          break;
        case "medium":
          skeletalMassPercentage += 1.0;
          break;
        case "fat":
          skeletalMassPercentage -= 2.0;
          break;
        default:
          skeletalMassPercentage += 0;
      }

      skeletalMassPercentage = Math.max(
        25.0,
        Math.min(42.0, skeletalMassPercentage)
      );

      return Math.round(skeletalMassPercentage * 10) / 10;
  }

}

export function calculateBodyFatPercentage({
  bmi,
  age,
  gender,
  bodyComposition,
}) {
  // Type coercion to ensure valid numbers
  const bmiNum = parseFloat(bmi);
  const ageNum = parseInt(age);
  const g = gender?.toLowerCase() === "male" ? 1 : 0;

  let fat;

  switch (bodyComposition?.toLowerCase()) {
    case 'slim':
      fat = 1.30 * Number(bmi) + 0.23 * Number(age || 0) - 10.8 * g - 5.4 - 2.5;
      switch (bodyComposition?.toLowerCase()) {
        case "slim":
          fat = 1.3 * bmiNum + 0.23 * ageNum - 10.8 * g - 5.4 - 2.5;
          break;
        case 'medium':
          fat = 1.30 * Number(bmi) + 0.23 * Number(age || 0) - 10.8 * g - 5.4;
        case "medium":
          fat = 1.3 * bmiNum + 0.23 * ageNum - 10.8 * g - 5.4;
          break;
        case 'fat':
          fat = 1.30 * Number(bmi) + 0.23 * Number(age || 0) - 10.8 * g - 5.4 + 2.5;
        case "fat":
          fat = 1.3 * bmiNum + 0.23 * ageNum - 10.8 * g - 5.4 + 2.5;
          break;
        default:
          // throw new Error('Invalid body composition. Use "slim", "medium", or "fat".');
          throw new Error(
            'Invalid or missing body composition. Use "slim", "medium", or "fat".'
          );
      }

      // Clamp the value between 5% and 35%
      fat = Math.max(5.0, Math.min(35.0, fat));

      return parseFloat(fat.toFixed(1));
  }
}

export function calculateBMR({
  gender,

  weight,
  weightUnit,

  height,
  heightUnit,
  feet,
  inches,

  age,
}) {
  // Convert weight to kilograms
  const weightInKg =
    weightUnit?.toLowerCase() === "pounds"
      ? parseFloat(weight) * 0.453592
      : parseFloat(weight);

  // Convert height to centimeters
  let heightInCm;
  const unit = heightUnit?.toLowerCase();

  if (unit === "cm" || unit === "cms") {
    heightInCm = parseFloat(height);
  } else if (unit === "inches") {
    heightInCm = parseFloat(height) * 2.54;
  } else if (unit === "feet") {
    heightInCm = (parseInt(feet) * 12 + parseInt(inches || 0)) * 2.54;
  }

  const ageNum = parseInt(age);

  // Apply Mifflin-St Jeor Equation
  let bmr;
  if (gender?.toLowerCase() === "male") {
    bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageNum + 5;
  } else if (gender?.toLowerCase() === "female") {
    bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageNum - 161;
  }

  return Math.round(bmr);
}

export function calculateBodyAge({
  bmi,
  bodyFatPercentage,
  age,
  bodyAge: age2,
  gender,
  bodyComposition,
}) {
  let bodyAge = Number(age || age2 || 0);
  const bmiVal = parseFloat(bmi);
  const fatVal = parseFloat(bodyFatPercentage);
  const genderVal = gender?.toLowerCase();
  const comp = bodyComposition?.toLowerCase();

  // Adjustments based on BMI
  if (bmiVal < 18.5) {
    bodyAge += 2.0;
  } else if (bmiVal > 25.0) {
    bodyAge += 3.0;
  } else {
    bodyAge -= 1.0;
  }

  if (gender?.toLowerCase() === 'male') {
    if (bodyFatPercentage < 8.0) {
      // Adjustments based on body fat %
      if (genderVal === "male") {
        if (fatVal < 8.0) {
          bodyAge -= 2.0;
        } else if (fatVal > 25.0) {
          bodyAge += 4.0;
        }
      } else if (gender?.toLowerCase() === 'female') {
        if (bodyFatPercentage < 21.0) {
        } else if (genderVal === "female") {
          if (fatVal < 21.0) {
            bodyAge -= 2.0;
          } else if (fatVal > 32.0) {
            bodyAge += 4.0;
          }
        }

        const comp = bodyComposition?.toLowerCase();
        if (comp === 'slim') {
          bodyAge -= 1.0;
        } else if (comp === 'fat') {
          bodyAge += 2.0;
          // Adjustments based on body composition
          switch (comp) {
            case "slim":
              bodyAge -= 1.0;
              break;
            case "fat":
              bodyAge += 2.0;
              break;
            // "medium" makes no change
          }

          return Math.round(bodyAge);
        }
      }
    }
  }
}

export function calculateSubcutaneousFat(data) {
  const { age = 1, gender = "male", bodyComposition = "Medium" } = data
  const bmi = calculateBMIFinal(data)
  const g = gender.toLowerCase();
  if (g !== "male" && g !== "female") {
    throw new Error('gender must be "male" or "female"');
  }

  const bc = bodyComposition.toLowerCase();
  if (bc !== "slim" && bc !== "medium" && bc !== "fat") {
    throw new Error('bodyComposition must be "slim", "medium", or "fat"');
  }

  if (bmi < 0 || age < 0 || age > 120) {
    throw new Error("Invalid bmi/age values.");
  }

  const sexInt = g === "male" ? 1 : 0;
  let totalBodyFat = 1.20 * bmi + 0.23 * age - 10.8 * sexInt - 5.4;

  totalBodyFat += bc === "slim" ? -1.5 : bc === "fat" ? 1.5 : 0.0;

  const minBF = g === "male" ? 3.0 : 8.0;
  const maxBF = g === "male" ? 45.0 : 55.0;
  totalBodyFat = Math.min(Math.max(totalBodyFat, minBF), maxBF);

  let subQFrac = g === "male" ? 0.74 : 0.86;

  const ageOver20 = age > 20 ? age - 20 : 0;
  subQFrac -= g === "male" ? 0.002 * ageOver20 : 0.001 * ageOver20;

  if (bmi > 25) {
    subQFrac += Math.min(0.003 * (bmi - 25), 0.06);
  } else if (bmi < 20) {
    subQFrac -= Math.min(0.003 * (20 - bmi), 0.03);
  }

  subQFrac += bc === "slim" ? 0.005 : bc === "fat" ? 0.015 : 0.0;
  subQFrac = Math.min(Math.max(subQFrac, 0.55), 0.95);

  const subcutaneous = totalBodyFat * subQFrac;
  const visceral = totalBodyFat * (1.0 - subQFrac);

  const r1 = (v) => parseFloat(v.toFixed(1));

  return {
    subcutaneousPercent: r1(subcutaneous),
    visceralPercent: r1(visceral),
    totalBodyFatPercent: r1(totalBodyFat),
  };
}

const healthMatrixFields = [
  "visceral_fat", "rm", "muscle", "fat",
  "ideal_weight", "sub_fat", "bodyAge",
  "weight", "height", "bmi", "body_composition",
]

function isInvalidField(value) {
  if (value === "") return true;

  const num = Number(value);
  if (!Number.isFinite(num)) return true;

  const parts = value?.toString().split(".") || [];
  if (parts.length === 2 && parts[1].length > 1) return true;

  return false;
}

export function validStatistics(matrices) {
  let index = 0
  for (const matrix of matrices) {
    index++
    for (const field of healthMatrixFields) {
      if (isInvalidField(matrix[field])) {
        return false
      }
    }
  }

  // for (const field of healthMatrixFields) {
  //   if (isInvalidField(matrices[field])) return false
  // }

  return true
}