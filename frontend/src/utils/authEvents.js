export const AUTH_LOGOUT_EVENT = 'app:auth-logout'

export const emitAuthLogout = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
  }
}
