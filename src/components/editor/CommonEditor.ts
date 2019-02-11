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
            n.value = editorSingable.get().name
            n.onchange = e => {
              editorSingable.get().name = (e.target as HTMLInputElement).value
            }
          })
        : createDivNode(n => {
            if (editorSingable.get() === null ) {
              n.innerText = "No singable selected"
            }
            else {
              n.innerText = editorSingable.get().name
            }
          }),
      createButtonNode(n => {
        n.innerText = "Edit"
        n.onclick = e => {
          this.nameEditing = !this.nameEditing
          this.update()
          editorSingable.get().update()
        }
        n.disabled = (editorSingable === null)
      })
    ])
    return [newDiv, newDiv]
  }
}