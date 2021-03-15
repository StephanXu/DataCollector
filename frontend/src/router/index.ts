import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/views/layout/Layout.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'index',
        component: Layout,
        redirect: '/task'
    },
    {
        path: '/task',
        name: 'task',
        component: Layout,
        redirect: '/task/index',
        children: [
            {
                path: 'index',
                name: 'task',
                component: () => import('@/views/task/Task.vue'),
                meta: {
                    title: '检测任务'
                }
            }]
    },
]

const router = new VueRouter({
    mode: 'hash',
    routes
})

router.beforeEach(async (to, from, next) => {
    document.title = `${to.meta.title} - 食品添加剂检测实验平台`
    next()
})

export default router