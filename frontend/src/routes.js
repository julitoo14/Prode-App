import {createRouter, createWebHistory} from "vue-router";
const routes = [
    
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