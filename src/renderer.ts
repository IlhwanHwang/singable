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

const root = new Component()
const c1 = new SingablePanel(root)
export const editorBase = new EditorBase(root)
export let editorSingable: Singable = null
export const setEditorSingable = (singable: Singable) => { editorSingable = singable }