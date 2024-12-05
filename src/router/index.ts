import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
const routes: Array<RouteRecordRaw> = [
    // 项目打开后进入的默认地址
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: () => import('../views/login/login.vue')
    },
    {
        path: '/home',
        component: () => import('../views/home/home.vue')
    },
    {
        path: '/base',
        component: () => import('../views/map/baseMap.vue')
    }
]
const router = createRouter({
    history: createWebHashHistory(), // 本项目采用了哈希模式
    routes
})

router.beforeEach((to, from, next) => {
    console.log('Route change:', { from: from.path, to: to.path });
    next();
  })

export default router
