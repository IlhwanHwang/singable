import Component from "./Component"
import Draggable from "./Draggable"
import {createDivNode, createButtonNode, createInputNode} from "../utils/singable"
import { outConnectionFocus, connections } from "../renderer";


export default class Singable extends Draggable {
	name: string
  nameEditing: boolean
  editor: Component

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
            this.destroy()
          }
        }),
        createButtonNode(n => {
          n.classList.add("in-connection")
          n.innerText = "in"
          n.style.position = "absolute"
          n.style.right = "160px"
          n.style.top = "60px"
          n.onclick = e => {
            if (outConnectionFocus.get() !== null) {
              connections.add(outConnectionFocus.get(), this)
            }
          }
        }),
        createButtonNode(n => {
          n.classList.add("out-connection")
          n.innerText = "out"
          n.style.position = "absolute"
          n.style.left = "160px"
          n.style.top = "60px"
          n.onclick = e => {
            outConnectionFocus.set(this)
          }
        })
			]
		)
		return [newDiv, newDiv]
	}
}