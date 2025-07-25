import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Torneos from '@/views/Torneos.vue';
import Partidos from '@/views/Partidos.vue';
import PublicHome from "@/views/PublicHome.vue";

const routes = [
    { path: '/', component: Home },
    {path: '/login', component: PublicHome},
    { path: '/torneos', component: Torneos },
    { path: '/partidos', component: Partidos },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

/*
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("token");
    if (to.meta.requiresAuth && !token) {
        next("/login");
    } else if (token) {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const expirationDate = new Date(decodedToken.exp);
        if (expirationDate <= new Date()) {
            localStorage.removeItem("token");
            next("/login");
        } else {
            next();
        }
    } else {
        next();
    }
});
*/

export { router };