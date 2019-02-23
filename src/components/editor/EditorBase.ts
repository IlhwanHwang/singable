import Component, { Container } from "../Component"
import { createDivNode, createInputNode, createButtonNode } from "../../utils/singable"
import {editorSingable} from "../../renderer"

export default class EditorBase extends Component {
  nameEditing = false

  render(): [HTMLElement, Container] {
    const container = createDivNode(n => {
      n.style.width = "100%"
      n.style.height = "calc(100% - 40px)"
    })

    const newDiv = createDivNode(n => {
        n.style.border = "solid 1px black",
        n.style.width = "100%",
        n.style.height = "100%",
        n.style.boxSizing = "border-box"
      },
      [
        createDivNode(n => {
          n.style.border = "solid 1px red"
          n.style.height = "40px"
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
        ]),
        container
      ]
    )

    return [newDiv, { default: container }]
  }
}