import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/pages/Home.vue";
import Watchlist from "../components/pages/Watchlist.vue";
import Settings from "../components/pages/Settings.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/watchlist",
    name: "Watchlist",
    component: Watchlist,
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
