const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export const getAccessToken = () => sessionStorage.getItem(ACCESS_TOKEN_KEY)

export const getRefreshToken = () => sessionStorage.getItem(REFRESH_TOKEN_KEY)

export const setAuthTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  }

  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  } else {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

export const clearAuthTokens = () => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}
