import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */

/* 
  所有用户都能访问到的路由
    常量路由
*/
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },
]
/* 
  根据用户返回的权限数据信息决定是否注册这个组件，这个路由不是常量路由
  页面所有的异步路由，需要根据权限数据来从这个所有异步路由的数组中过滤出用户能够看到的路由

*/
export const allAsyncRoutes = [
  {
    path: '/product',
    name: 'Product',
    component: Layout,
    redirect: '/product/trademark/list',
    meta: { title: '商品管理', icon: 'el-icon-s-goods' },   // 这里必须写，因为这里会决定侧边栏显示的内容
    children: [
      {
        path: 'trademark/list',
        name: 'Trademark',
        component: () => import('@/views/product/trademark/List'),
        meta: { title: '品牌管理' }
      },
      {
        path: 'attr/list',
        name: 'Attr',
        component: () => import('@/views/product/attr/List'),
        meta: { title: '属性管理' }
      },
      {
        path: 'sku/list',
        name: 'Sku',
        component: () => import('@/views/product/sku/List'),
        meta: { title: 'SKU管理' }
      },
      {
        path: 'spu/list',
        name: 'Spu',
        component: () => import('@/views/product/spu/List'),
        meta: { title: 'Spu管理' }
      }
    ]
  },
  {
    path: '/acl',
    name: 'Acl',
    component: Layout,      // 组件是一级路由Layout，Layout里面的AppMain组件里面才是这里写的二级路由
    redirect: '/acl/user/list',
    meta: { title: '权限管理', icon: 'password' },
    children: [
      {
        path: 'user/list',
        name: 'User',
        component: () => import("@/views/acl/user/List.vue"),
        meta: { title: '用户管理' }
      },
      {
        path: 'role/list',
        name: 'Role',
        component: () => import("@/views/acl/role/List.vue"),
        meta: { title: '角色管理' },
      },
      {
        path: 'role/auth/:id?',
        name: 'RoleAuth',
        component: () => import("@/views/acl/role/roleAuth.vue"),
        meta: {
          title: '角色授权',
        },
        hidden:true
      },
      {
        path: 'menu/list',
        name: 'Menu',
        component: () => import("@/views/acl/menu/List.vue"),
        meta: { title: '菜单管理' }
      }
    ]
  }

  /*   {
      path: '/example',
      component: Layout,
      redirect: '/example/table',
      name: 'Example',
      meta: { title: 'Example', icon: 'el-icon-s-help' },
      children: [
        {
          path: 'table',
          name: 'Table',
          component: () => import('@/views/table/index'),
          meta: { title: 'Table', icon: 'table' }
        },
        {
          path: 'tree',
          name: 'Tree',
          component: () => import('@/views/tree/index'),
          meta: { title: 'Tree', icon: 'tree' }
        }
      ]
    },
  
    {
      path: '/form',
      component: Layout,
      children: [
        {
          path: 'index',
          name: 'Form',
          component: () => import('@/views/form/index'),
          meta: { title: 'Form', icon: 'form' }
        }
      ]
    },
  
    {
      path: '/nested',
      component: Layout,
      redirect: '/nested/menu1',
      name: 'Nested',
      meta: {
        title: 'Nested',
        icon: 'nested'
      },
      children: [
        {
          path: 'menu1',
          component: () => import('@/views/nested/menu1/index'), // Parent router-view
          name: 'Menu1',
          meta: { title: 'Menu1' },
          children: [
            {
              path: 'menu1-1',
              component: () => import('@/views/nested/menu1/menu1-1'),
              name: 'Menu1-1',
              meta: { title: 'Menu1-1' }
            },
            {
              path: 'menu1-2',
              component: () => import('@/views/nested/menu1/menu1-2'),
              name: 'Menu1-2',
              meta: { title: 'Menu1-2' },
              children: [
                {
                  path: 'menu1-2-1',
                  component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
                  name: 'Menu1-2-1',
                  meta: { title: 'Menu1-2-1' }
                },
                {
                  path: 'menu1-2-2',
                  component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
                  name: 'Menu1-2-2',
                  meta: { title: 'Menu1-2-2' }
                }
              ]
            },
            {
              path: 'menu1-3',
              component: () => import('@/views/nested/menu1/menu1-3'),
              name: 'Menu1-3',
              meta: { title: 'Menu1-3' }
            }
          ]
        },
        {
          path: 'menu2',
          component: () => import('@/views/nested/menu2/index'),
          name: 'Menu2',
          meta: { title: 'menu2' }
        }
      ]
    },
  
    {
      path: 'external-link',
      component: Layout,
      children: [
        {
          path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
          meta: { title: 'External Link', icon: 'link' }
        }
      ]
    }, */

  // 404 page must be placed at the end !!!
]

//任意路由，用户随意输入的非法路由路由，全部都会转到404路由界面
//注册这个路由的时候，一定要放在最后面注册
export const anyRoutes = { path: '*', redirect: '/404', hidden: true }

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
