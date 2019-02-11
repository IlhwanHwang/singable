import Component from "../Component"
import {createDivNode, createButtonNode, createInputNode} from "../../utils/singable"
import {TransposeStructure} from "../TransposeSingable"
import { editorSingable } from "../../renderer";


export default class TransposeEditor extends Component {
  data: TransposeStructure
  editing: boolean = false
  semitonesInput: string

  constructor(parent: Component, data: TransposeStructure) {
    super(parent)
    this.data = data
  }

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(
      n => {
        n.style.border = "solid 1px orange",
        n.style.width = "100%",
        n.style.height = "100%",
        n.style.boxSizing = "border-box"
      },
      [
        this.editing
          ? createInputNode(n => {
              n.value = this.data.semitones.toString()
              n.onchange = e => {
                this.semitonesInput = (e.target as HTMLInputElement).value
              }
            })
          : createDivNode(n => {
              n.innerText = this.data.semitones.toString()
            }),
        createButtonNode(n => {
          n.innerText = "Edit"
          n.onclick = e => {
            if (this.editing) {
              try {
                this.data.semitones = parseInt(this.semitonesInput)
                editorSingable.get().update()
              } catch (e) {
                // pass
              }
              this.editing = false
            }
            else {
              this.editing = true
            }
            this.update()
          }
        })
      ]
    )
    return [newDiv, newDiv]
  }
}