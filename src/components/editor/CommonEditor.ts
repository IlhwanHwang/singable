import Component from "../Component"
import {createDivNode, createButtonNode, createInputNode} from "../../utils/node"
import {editorSingable} from "../../renderer"

export default class CommonEditor extends Component {
  nameEditing = false

  render(): [Node, Node] {
    const newDiv = createDivNode(n => {
      n.style.border = "solid 1px red"
    }, [
      this.nameEditing
        ? createInputNode(n => {
            n.value = editorSingable.name
            n.onchange = e => {
              editorSingable.name = (e.target as HTMLInputElement).value
            }
          })
        : createDivNode(n => {
            if (editorSingable === null ) {
              n.innerText = "No singable selected"
            }
            else {
              n.innerText = editorSingable.name
            }
          }),
      createButtonNode(n => {
        n.innerText = "Edit"
        n.onclick = e => {
          this.nameEditing = !this.nameEditing
          this.update()
          editorSingable.update()
        }
        n.disabled = (editorSingable === null)
      })
    ])
    return [newDiv, newDiv]
  }
}