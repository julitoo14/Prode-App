import {createRouter, createWebHistory} from "vue-router";
import UserHome from "./views/UserHome.vue";
import NewHabit from "./views/NewHabit.vue";
import EditHabit from "./views/EditHabit.vue";
import UserHabitList from "./views/userHabitList.vue";

const routes = [
    {
        path: '/',
        component: UserHome,
    },
    {
        path: '/addHabit',
        component: NewHabit
    },
    {
        path: '/editHabit/:id',
        component: EditHabit
    },
    {
        path: '/userHabits',
        component: UserHabitList
    }
]

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