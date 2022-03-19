import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import router from '@/router'
import { Message } from 'element-ui'
import { constantRoutes, allAsyncRoutes, anyRoutes } from '@/router'
import {cloneDeep} from 'lodash'


// 根据用户信息去筛选能够展示的路由
function filterRoutes(allAsyncRoutes, routeNames) {
  // 从所有的异步路由中过滤
  let showRoutes = allAsyncRoutes.filter((item) => {
    if (routeNames.indexOf(item.name) !== -1) {
      if (item.children && item.children.length) {    //  如果是多级路由，就是说有孩子的
        //如果当前这个路由是有子路由的，子路由也要去过滤出用户路由名称包含的
        //过滤出子路由把原本的子路由替换掉
        item.children = filterRoutes(item.children, routeNames);  //  递归一下
      }
      return true;
    }
  })
  return showRoutes;
}


// 为了重置的时候方便，所以整了个函数
const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',   // 用户名字
    avatar: '',   //  用户头像
    asyncRoutes: [],   //保存当前用户返回的name数组对应的异步路由数组（返回的数据是异步路由名称的数组）
    roles: [],   //保存用户的角色权限信息
    buttons: [], //保存用户的按钮权限信息
    
    routes: [],   //最终用户要使用的所有路由：包含常量路由，用户的异步路由和任意路由
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())// 重置state，state中的属性被getDefaultState覆盖
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INFO: (state, { name, avatar, roles, buttons }) => {
    state.name = name
    state.avatar = avatar
    state.roles = roles
    state.buttons = buttons
  },
  SET_ASYNCROUTES: (state, asyncRoutes) => {
    state.asyncRoutes = asyncRoutes;
    // 把常量路由和用户的异步路由还有任意路由，拼接为这个用户所有的路由数组，后期生成菜单需要这个总的路由数组
    state.routes = constantRoutes.concat(asyncRoutes, anyRoutes)
    // 动态生成路由
    router.addRoutes([...asyncRoutes,anyRoutes])
  }
}

const actions = {
  // user login
  async login({ commit }, userInfo) {
    const { username, password } = userInfo
    const result = await login({ username: username.trim(), password })
    // 既然能拿到这个状态码，这个状态码不是xhr的状态码，是后端给的，xhr的状态码在拦截器中就已经处理了
    // 所以只需要看后端给的状态码对不对，然后再下一步
    if (result.code === 200 || result.code === 20000) {
      const { data } = result
      commit('SET_TOKEN', data.token);
      setToken(data.token)
      return 'ok'
    } else {
      // 弹出消息，才能知道是这里出了问题
      Message({
        message: '登录失败',
        type: 'error',
        duration: 2 * 1000
      })
      return Promise.reject(new Error('登录失败'))
    }
    /*     return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    }) */
  },
  
  // get user info
  async getInfo({ commit, state }) {
    const result = await getInfo(state.token)
    if (result.code === 20000 || result.code === 200) {
      const { data } = result
      if (!data) {
        result.reject('找不到用户')
      } else {
        const { name, avatar, routes, roles, buttons } = data
        commit('SET_INFO', { name, avatar, roles, buttons });
        // filterRoutes函数会把allAsynRoutes内部原本的子路由过滤掉一部分
        // 拿到的子路由是残缺的，和上一个用户一样
        // 所以为例避免上一个用户的影响，记得用深拷贝一下allAsyncRoutes，不改源数据
        commit('SET_ASYNCROUTES', filterRoutes(cloneDeep(allAsyncRoutes), routes))
      }
    } else {
      return Promise.reject(new Error('getInfo error'))
    }

    /* return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('登录失败')
        }

        const { name, avatar } = data

        commit('SET_INFO', { name, avatar })
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    }) */
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

