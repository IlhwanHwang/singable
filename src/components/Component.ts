import { create } from "domain";
import { flatten } from "lodash"

let id = 0


export default class Component {
  target: HTMLElement = null
  container: HTMLElement = null
  parent: Component = null
  debugName: string = `component-${id++}`
  children = new Array<Component>()

  constructor(parent: Component = null) {
    this.parent = parent
    if (this.parent === null) {
      this.container = document.querySelector("body")
    }
    else {
      this.parent.addChild(this)
    }
  }

  removeChild(child: Component) {
    this.children = this.parent.children.filter((c) => { return c !== child })
  }

  addChild(child: Component) {
    this.children.push(child)
  }

  destroy() {
    this.target.parentNode.removeChild(this.target)
    if (this.parent !== null) {
      this.parent.removeChild(this)
    }
  }

  create() {
    if (this.parent !== null) {
      const [newTarget, newContainer] = this.render()
      this.parent.container.insertBefore(newTarget, this.target)
      if (this.target !== null) {
        const oldTarget = this.target
        oldTarget.parentNode.removeChild(oldTarget)
      }
      this.target = newTarget;
      this.container = newContainer;
    }
  }

  update() {
    this.create()
    this.children.forEach((c) => {
      c.target = null
      c.update()
    })
  }

  render(): [HTMLElement, HTMLElement] {
    return [null, null]
  }

  find(predicate: (c: Component) => boolean): Array<Component> {
    return flatten(this.children.map(c => c.find(predicate)).concat(predicate(this) ? [this] : []))
  }
}