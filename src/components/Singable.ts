import Component from "./Component"
import Draggable from "./Draggable"
import {createDivNode, createButtonNode, createInputNode} from "../utils/node"


export default class Singable extends Draggable {
	name: string
  nameEditing: boolean
  editor: Component

  constructor(parent: Component) {
    super(parent)
    this.name = "new singable object"
  }

	render(): [Node, Node] {
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
          n.innerText = "in"
          n.style.position = "absolute"
          n.style.right = "160px"
          n.style.top = "60px"
        }),
        createButtonNode(n => {
          n.innerText = "out"
          n.style.position = "absolute"
          n.style.left = "160px"
          n.style.top = "60px"
        })
			]
		)
		return [newDiv, newDiv]
	}
}