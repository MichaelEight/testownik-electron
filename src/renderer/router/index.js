import Vue from 'vue'
import Router from 'vue-router'

import LandingPage from '@/components/LandingPage'
import Quiz from '@/components/Quiz'
import QuizEditor from '@/components/QuizEditor'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: LandingPage
    },
    {
      path: '/quiz',
      name: 'quiz',
      props: true,
      component: Quiz
    },
    {
      path: '/editor',
      name: 'quiz-editor',
      component: QuizEditor
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
