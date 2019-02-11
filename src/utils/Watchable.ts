import Component from "../components/Component"

export default class Watchable<T> {
  watchers = Array<Component | (() => void)>()
  value: T

  constructor(initial: T) {
    this.value = initial
  }

  set(value: T) {
    this.value = value
    this.update()
  }

  update() {
    this.watchers.forEach(c => {
      if (c instanceof Component) {
        c.update()
      }
      else {
        c()
      }
    })
  }
  
  get() {
    return this.value
  }

  watch(c: Component | (() => void)) {
    this.watchers.push(c)
  }
}