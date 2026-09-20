import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../components/HomeView.vue'
import ScanView from '../components/ScanView.vue'
import CompareView from '../components/CompareView.vue'
import ContactView from '../components/ContactView.vue'
import NotFoundView from '../components/NotFoundView.vue'

const router = createRouter({
  // hash routes let pages refresh on the deakin server
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Search additives' },
    },
    {
      path: '/scan',
      name: 'scan',
      component: ScanView,
      meta: { title: 'Scan a label' },
    },
    {
      path: '/compare',
      name: 'compare',
      component: CompareView,
      meta: { title: 'Saved additives' },
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
      meta: { title: 'Contact' },
    },
    {
      path: '/:pathMatch(.*)*',
      component: NotFoundView,
      meta: { title: 'Page not found' },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title + ' | LabelLens'
})

export default router
