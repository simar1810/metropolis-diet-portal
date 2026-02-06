export const createRequestPayload = function (state) {
  return {
    firstName: state.firstName,
    name: `${state.firstName} ${state.lastName}`,
    mobileNumber: state.mobileNumber,
    goal: state.goal,
    sex: state.gender,
    dob: state.dob,
    weight: `${state.weight} ${state.weightUnit}`,
    height: `${state.height} ${state.heightUnit}`,
    activityLevel: state.dailyActivity,
    medicalConditions: state.medicalConditions,
    allergies: state.allergies,
    dietPreference: state.preferences,
    countryPreference: "India 🇮🇳",
    regionPreference: state.regionPreference,
  }
}

export const buildUpdateClientPreferences = function (state) {
  return {
    "clientId": state.selectedClientDetails?.pid,
    "preferences": {
      firstName: state.firstName,
      name: `${state.firstName} ${state.lastName}`,
      goal: state.goal,
      dob: state.dob,
      weight: `${state.weight} ${state.weightUnit}`,
      height: `${state.height} ${state.heightUnit}`,
      "dietPreference": state.dietPreference,
      "activityLevel": state.activityLevel,
      medicalConditions: state.medicalConditions,
      allergies: state.allergies,
      countryPreference: "India 🇮🇳",
      regionPreference: state.regionPreference,
    }
  }
}

export const buildCoreIntegrationPayload = function (state) {
  return {
    "firstName": state.selectedClientDetails?.patientName,
    "lastName": "",
    "dob": state.selectedClientDetails.dob,
    "gender": state.gender,
    "mobileNumber": state.mobileNumber,
    "email": "test@gmail.com",
    "grossAmount": 499,
    "discount": 0,
    "netAmount": 0,
    "amountReceived": 490,
    "salutation": "Mr."
  }
}

export const buildAIMealGeneratePayload = function (state) {
  const client = state.selectedClientDetails || {}
  return {
    "mode": "daily",
    "profile": {
      "client": {
        "name": client.firstName || client.name,
        "age": client.age,
        "gender": client.gender,
        "goal": state.goal,
        "city": "Pune",
        "activity": state.dailyActivity
      },
      "health": {
        "height": state.height,
        "heightUnit": state.heightUnit,
        "weight": state.weight,
        "weightUnit": state.weightUnit,
        "bodyAge": client.age
      }
    },
    "preferences": {
      "dietaryType": state.dietPreferences,
      "healthConditions": state.medicalConditions,
      "allergies": state.allergies,
    }
  }
}