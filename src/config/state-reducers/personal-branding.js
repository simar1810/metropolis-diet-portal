export function personalBrandingReducer(state, action) {
  switch (action.type) {
    case "CHANGE_FIELD_VALUE":
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.name]: action.payload.value
        }
      }
    case "SELECT_PERSONAL_BRAND_EDIT":
      // const lastIndex = action.payload.length - 1
      const lastIndex = 0
      return {
        ...state,
        selectedBrand: action.payload.length >= 1
          ? {
            ...action.payload.at(lastIndex),
            primaryColor: action.payload.at(lastIndex)?.primaryColor?.slice(-6) || "",
            textColor: action.payload.at(lastIndex)?.textColor?.slice(-6) || ""
          }
          : null,
        formData: action.payload.length >= 1
          ? {
            ...action.payload.at(lastIndex),
            brandLogo: "",
            file: action.payload.length >= 1 ? action.payload.at(lastIndex).brandLogo : undefined,
            primaryColor: action.payload.at(lastIndex)?.primaryColor?.slice(-6) || "",
            textColor: action.payload.at(lastIndex)?.textColor?.slice(-6) || ""
          }
          : { ...state.formData },
        type: action.payload.length >= 1 ? "edit" : "new",
        stage: action.payload.length >= 1 ? 2 : 3,
        mutate: action.mutate
      }
    case "PERSONAL_BRAND_UPDATED":
      return {
        ...state,
        selectedBrand: {},
        formData: {},
        type: "edit",
        stage: 1
      }

    case "PERSONAL_BRAND_CREATED":
      return {
        ...state,
        stage: 2,
        formData: action.payload,
        selectedBrand: action.payload
      }

    default:
      return state;
  }
}

export function changeFieldvalue(name, value) {
  return {
    type: "CHANGE_FIELD_VALUE",
    payload: {
      name,
      value
    }
  }
}

export function selectPersonalBrandToEdit(payload, mutate) {
  return {
    type: "SELECT_PERSONAL_BRAND_EDIT",
    payload,
    mutate
  }
}

export function personalBrandUpdated() {
  return { type: "PERSONAL_BRAND_UPDATED" }
}

export function personalBrandCreated(payload) {
  return {
    type: "PERSONAL_BRAND_CREATED",
    payload
  }
}

const fields = ["file", "brandName"];
export function generateRequestPayload(state, id) {
  const payload = new FormData();
  for (const field of fields) {
    if (state[field]) payload.append(field, state[field]);
  }
  for (const field of ["primaryColor", "textColor"]) {
    if (state[field]) payload.append(field, `ff${state[field]}`)
  }
  if (state.brandLogo && Boolean(id)) {
    payload.append("file", state.brandLogo)
  } else if (state.brandLogo) {
    payload.append("brandLogo", state.brandLogo)
  }
  if (Boolean(id)) payload.append("id", id)
  return payload;
}