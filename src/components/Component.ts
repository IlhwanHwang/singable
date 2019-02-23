import { create } from "domain";
import { flatten } from "lodash"
import { PianoRollEditor } from "./PianoRollSingable";

let id = 0


export default class Component {
  element: HTMLElement = null
  container: HTMLElement = null
  parent: Component = null
  systemName: string = `component-${id++}`
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
    this.children = this.children.filter(c => c !== child)
  }

  addChild(child: Component) {
    this.children.push(child)
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
      const [newTarget, newContainer] = this.render()
      const oldTarget = this.element
      this.parent.container.insertBefore(newTarget, oldTarget)
      if (oldTarget !== null) {
        oldTarget.remove()
      }
      this.element = newTarget;
      this.onAttached()
      this.container = newContainer;
    }
  }

  update() {
    if (this.element !== null) {
      this.element.remove()
    }
    this.element = null
    this.create()
    this.children.forEach((c) => {
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