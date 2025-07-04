import Vue from 'vue'
import LandingPage from '@/components/LandingPage'

describe('LandingPage.vue', () => {
  it('should render important UI elements', () => {
    const vm = new Vue({
      el: document.createElement('div'),
      render: h => h(LandingPage)
    }).$mount()

    const dragArea = vm.$el.querySelector('#drag')
    expect(dragArea).to.not.equal(null)
    const exampleButton = Array.from(vm.$el.querySelectorAll('button'))
      .find(btn => btn.textContent.trim() === 'EXAMPLE')
    expect(exampleButton).to.not.equal(undefined)
  })
})
