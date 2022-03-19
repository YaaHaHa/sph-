import Cookies from 'js-cookie' // 操作cookie的第三方库

const TokenKey = 'token' //  修改了默认的token名

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
