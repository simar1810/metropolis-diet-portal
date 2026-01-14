const YT_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const YT_REDIRECT_URL = "http://localhost:3001/youtube/redirection";
const YT_SCOPE = "https://www.googleapis.com/auth/youtube.upload"

export function getYoutubeLink_OAuth(state) {
  return `${YT_OAUTH_URL}?client_id=${process.env.NEXT_PUBLIC_YT_CLIENT_ID}&redirect_uri=${YT_REDIRECT_URL}&response_type=code&scope=${YT_SCOPE}&state=${state}&access_type=offline`
}

export function parseHashFragment() {
  if (typeof window === "undefined") return new URLSearchParams()
  const fragment = window.location.hash.substring(1);
  return new URLSearchParams(fragment);
}