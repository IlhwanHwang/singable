import Component from "./Component"
import Draggable from "./Draggable"
import {createDivNode, createButtonNode, createInputNode} from "../utils/singable"
import { outConnectionFocus, connections, editorSingable } from "../renderer";
import {Timeline} from "../Key"
import { Endpoint, InEndpoint, OutEndpoint } from "./Endpoint";

export default class Singable extends Draggable {
	name: string
  nameEditing: boolean
  editor: Component
  endpoints = Array<Endpoint>()

  constructor(parent: Component) {
    super(parent)
    this.name = "new singable object"
    this.onDragging = e => {
      connections.update()
    }
  }

	render(): [HTMLElement, HTMLElement] {
		const newDiv = createDivNode(
			n => {
        n.style.border = "solid 1px black"
        n.style.width = "160px"
        n.style.height = "120px"
        // n.style.overflow = "hidden"
        n.style.position = "absolute"
        n.style.left = "100px"
        n.style.top = "100px"
        n.style.pointerEvents = "auto"
      },
			[
        createDivNode(n => {
          n.style.height = "24px"
          n.style.backgroundColor = "cyan"
          n.setAttribute("draggable-target", "true")
        }),
        createDivNode(n => {
          n.innerText = this.name
        }),
        createButtonNode(n => {
          n.innerText = "Delete"
          n.onclick = e => {
            if (editorSingable.get() === this) {
              this.editor.destroy()
              editorSingable.set(null)
            }
            this.destroy()
          }
        })
			]
		)
		return [newDiv, newDiv]
  }
  
  sing(): Timeline {
    return new Timeline(0)
  }

  destroy() {
    const obj = (this as any)
    this.endpoints.forEach(ep => {
      if (ep instanceof InEndpoint) {
        connections.remove(null, ep)
      }
      if (ep instanceof OutEndpoint) {
        connections.remove(ep, null)
      }
    })
    super.destroy()
  }
}