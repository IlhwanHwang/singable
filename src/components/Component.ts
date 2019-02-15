import { create } from "domain";
import { flatten } from "lodash"
import { PianoRollEditor } from "./PianoRollSingable";

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
    this.children = this.children.filter(c => c !== child)
  }

  addChild(child: Component) {
    console.log("Add child", this.debugName, child)
    this.children.push(child)
  }

  destroy() {
    this.target.remove()
    this.target = null
    if (this.parent !== null) {
      this.parent.removeChild(this)
    }
  }

  create() {
    if (this.parent !== null) {
      const [newTarget, newContainer] = this.render()
      const oldTarget = this.target
      this.parent.container.insertBefore(newTarget, oldTarget)
      if (oldTarget !== null) {
        console.log("Old target remove", this.debugName, this.container.children)
        oldTarget.remove()
      }
      this.target = newTarget;
      this.container = newContainer;
      console.log("Create complete", this.debugName, this.children)
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