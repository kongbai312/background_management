import { login, logout, getInfo } from '@/api/acl/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter,constantRoutes,allAsyncRoutes,anyRoute } from '@/router'
import router from '@/router'
import { cloneDeep } from 'lodash'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',//存储用户名称信息
    avatar: '',//存储用户头像信息

    buttons:[],//和按钮权限相关数据
    roles:[],//和用户角色相关数据
    routes:[],//存储所有的路由对象，不是字符串
    asyncRoutes:[],//存储所有用户相关的异步存储的路由对象（不同用户的路由对象不一致），不是字符串
  }
}

//用于过滤出自身权限相关的路由对象,routeNames在用户本身的routes中
const filterMyAsyncRoutes = function(allAsyncRoutes,routeNames){
  const myAsyncRoutes = allAsyncRoutes.filter(item =>{
    if(routeNames.indexOf(item.name)!==-1){//如果存在这个路由
      //判断是否有子路由
      if(item.children && item.children.length){//子路由存在且不为零
        //进行递归判断,将二级路由改为符合条件的二级路由
        item.children = filterMyAsyncRoutes(item.children,routeNames)
      }
      return true
    }
  })
  return myAsyncRoutes
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  // SET_NAME: (state, name) => {
  //   state.name = name
  // },
  // SET_AVATAR: (state, avatar) => {
  //   state.avatar = avatar
  // }
  SET_USERINFO(state,userInfo){
    state.name = userInfo.name
    state.avatar = userInfo.avatar
    state.buttons = userInfo.buttons
    state.roles = userInfo.roles
  },
  SET_ROUTES(state,myAsyncRoutes){
    state.asyncRoutes = myAsyncRoutes
    state.routes = constantRoutes.concat(myAsyncRoutes,anyRoute)
    //动态添加路由
    router.addRoutes([...myAsyncRoutes,anyRoute])
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        // const { name, avatar } = data

        // commit('SET_NAME', name)
        // commit('SET_AVATAR', avatar)
        //存储用户信息相关
        commit('SET_USERINFO',data)
        //存储路由相关
        commit('SET_ROUTES',filterMyAsyncRoutes(cloneDeep(allAsyncRoutes),data.routes))
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
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

