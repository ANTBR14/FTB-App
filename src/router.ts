import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
    // mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
        },
        {
            path: '/modpacks',
            name: 'modpacks',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "about" */ './views/Modpacks.vue'),
        },
        {
            path: '/browseModpacks',
            name: 'browseModpacks',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "about" */ './views/BrowseModpacks.vue'),
        },
        {
            path: '/news',
            name: 'news',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "news" */ './views/News.vue'),
        },
        {
            path: '/settings',
            name: 'settings',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "settings" */ './views/Settings.vue'),
        },
        {
            path: '/instancepage',
            name: 'instancepage',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "instancepage" */ './views/InstancePage.vue'),
        },
        {
            path: '/modpackpage',
            name: 'modpackpage',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "modpackpage" */ './views/ModpackPage.vue'),
        },
        {
            path: '/thirdparty',
            name: 'thirdparty',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "modpackpage" */ './views/ComingSoon.vue'),
        },
        {
            path: '/license',
            name: 'license',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "modpackpage" */ './views/License.vue'),
        },
    ],
});
