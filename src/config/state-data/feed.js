export const feedTypes = ["global", "our", "both", "mine"];
export const displayedPostsType = ["myPosts", "mySavedPosts"];
export const newPostFields = ["file1", "video", "caption", "type", "contentType"];

export const feedDataInitialState = {
  type: "our", // e.g. "global", "our", "both"
  displayedPostsType: "myPosts", // e.g. all, saved
  page: 1,
  finalPage: Infinity,
  newPostFormData: {
    file1: null,
    caption: "",
    type: "our",
    contentType: "img",
    video: ""
  }
}