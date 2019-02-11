// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// const div = document.createElement("div")
// div.setAttribute("style", "width: 100px; height: 80px; border: solid 1px black;")
// document.querySelector("body").appendChild(div)

import SingablePanel from "./components/SingablePanel"
import Singable from "./components/Singable"
import Component from "./components/Component"
import EditorBase from "./components/editor/EditorBase"
import CommonEditor from "./components/editor/CommonEditor"

// export let editorSingable: Singable = null

export class Watchable<T> {
  watchers = Array<Component>()
  value: T

  constructor(initial: T) {
    this.value = initial
  }

  set(value: T) {
    this.value = value
    this.watchers.forEach(c => c.update())
  }

  get() {
    return this.value
  }

  add(c: Component) {
    this.watchers.push(c)
  }
}

// TODO: Listenable object
export const editorSingable = new Watchable<Singable>(null)
// const editorSingableListener = Array<Component>()
// export const addListenerEditorSingable = (component: Component) => { editorSingableListener.push(component) }
// export const setEditorSingable = (singable: Singable) => {
//   editorSingable = singable
//   editorSingableListener.forEach(c => c.update())
// }

const outConnectionFocusListener = Array<Component>()
export let outConnectionFocus: Singable = null
export const setOutConnectionFocus = (singable: Singable) => {
  outConnectionFocus = singable
  outConnectionFocusListener.forEach(c => c.update())
}

const root = new Component()
new SingablePanel(root)
export const editorBase = new EditorBase(root)
const commonEditor = new CommonEditor(editorBase)

root.update()
// addListenerEditorSingable(commonEditor)
editorSingable.add(commonEditor)
eval("window.rootComp = root")