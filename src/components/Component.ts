import { flatten, toPairs } from "lodash"

let id = 0

export type Container = { [target: string]: HTMLElement }
export type Children = { [target: string]: Array<Component> }


export default class Component {
  element: HTMLElement = null
  containers: Container = null
  parent: Component = null
  parentTarget: string = null
  systemName: string = `component-${id++}`
  children: Children = {}

  constructor(parent: Component = null, parentTarget: string = "default") {
    this.parent = parent
    this.parentTarget = parentTarget
    if (this.parent === null) {
      this.containers = { default: document.querySelector("body") }
    }
    else {
      this.parent.addChild(this, parentTarget)
    }
  }

  removeChild(child: Component) {
    try {
      const [target, array] = toPairs(this.children).filter(([t, a]) => a.some(c => c === child))[0]
      this.children[target] = array.filter(c => c !== child)
    }
    catch (e) {
      console.error(e)
    }
  }

  addChild(child: Component, target: string) {
    this.children[target].push(child)
  }

  destroy() {
    this.element.remove()
    this.element = null
    if (this.parent !== null) {
      this.parent.removeChild(this)
    }
  }

  onAttached() {

  }

  create() {
    if (this.parent !== null) {
      const [newTarget, newContainers] = this.render()
      const oldTarget = this.element
      this.parent.containers[this.parentTarget].insertBefore(newTarget, oldTarget)
      if (oldTarget !== null) {
        oldTarget.remove()
      }
      this.element = newTarget;
      this.onAttached()
      this.containers = newContainers;
    }
  }

  update() {
    if (this.element !== null) {
      this.element.remove()
    }
    this.element = null
    this.create()
    toPairs(this.children).forEach(([_, a]) => a.forEach((c) => {
      c.update()
    }))
  }

  render(): [HTMLElement, Container] {
    return [null, null]
  }

  find(predicate: (c: Component) => boolean): Array<Component> {
    return flatten(flatten(toPairs(this.children).map(([_, a]) => a)).map(c => c.find(predicate)).concat(predicate(this) ? [this] : []))
  }
}