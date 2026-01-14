import {
  displayedPostsType,
  feedTypes,
  newPostFields
} from "../state-data/feed";

export function feedReducer(state, action) {
  switch (action.type) {
    case "CHANGE_FEED_TYPE":
      if (!feedTypes.includes(action.payload)) return state;
      return { ...state, type: action.payload, page: 1 }

    case "CHANGE_DISPLAYED_POST_TYPE":
      if (!displayedPostsType.includes(action.payload)) return state;
      return { ...state, displayedPostsType: action.payload }

    case "CHANGE_NEW_POST_FORM_DATA":
      if (!newPostFields.includes(action.payload.name)) return state;
      return {
        ...state,
        newPostFormData: {
          ...state.newPostFormData,
          [action.payload.name]: action.payload.value,
        }
      }

    case "CHANGE_FEED_PAGE":
      return { ...state, page: action.payload }

    case "SET_PAGE_END_VALUE":
      return { ...state, finalPage: action.payload, page: action.payload }

    default:
      break;
  }
}

export function changeFeedType(type) {
  return { type: "CHANGE_FEED_TYPE", payload: type }
}

export function changeDispalyedPostsType(type) {
  return { type: "CHANGE_DISPLAYED_POST_TYPE", payload: type }
}

export function changeNewPostFormData(name, value) {
  return {
    type: "CHANGE_NEW_POST_FORM_DATA",
    payload: {
      name,
      value
    }
  }
}

export function paginate(page) {
  return { type: "CHANGE_FEED_PAGE", payload: page }
}

export function pageEnd(page) {
  return { type: "SET_PAGE_END_VALUE", payload: page }
}

function generateFields(contentType) {
  const fields = ["caption", "contentType", "type"];
  if (contentType === "img") {
    fields.push("file1");
  } else {
    fields.push("video");
  }
  return fields
}

export function canPost(data) {
  const fields = generateFields(data.contentType);
  for (const field of fields) {
    if (!data[field]) return false;
  }
  return true;
}

export function generateFormData(data, person = "coach") {
  const fields = generateFields(data.contentType);
  const formData = new FormData();
  for (const field of fields) {
    formData.append(field, data[field]);
  }
  formData.append("person", person);
  formData.append("uploadedBy", "app-coach");
  return formData;
}