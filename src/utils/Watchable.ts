import Component from "../components/Component"

type Watcher = Component | (() => void)

export default class Watchable<T> {
  watchers = Array<Watcher>()
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

  watch(c: Watcher) {
    this.watchers.push(c)
  }

  unwatch(c: Watcher) {
    this.watchers = this.watchers.filter(d => c !== d)
  }
}