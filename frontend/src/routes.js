import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Torneos from '@/views/Torneos.vue';
import Partidos from '@/views/Partidos.vue';
import PublicHome from "@/views/PublicHome.vue";
import Profile from '@/views/Profile.vue';
import CrearTorneo from '@/views/CrearTorneo.vue';
import { useAuth } from './store/auth';

const routes = [
    { path: '/', component: Home, meta: { requiresAuth: true } },
    { path: '/public', component: PublicHome },
    { path: '/torneos', component: Torneos, meta: { requiresAuth: true } },
    { path: '/crear-torneo', component: CrearTorneo, meta: { requiresAuth: true } },
    { path: '/partidos', component: Partidos, meta: { requiresAuth: true } },
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const { isAuthenticated } = useAuth();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !isAuthenticated.value) {
        next('/public');
    } else {
        next();
    }
});

export { router };