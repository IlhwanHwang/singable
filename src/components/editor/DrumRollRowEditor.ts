import Component from "../Component";
import { DrumRollRowStructure } from "../DrumRollStructure";
import { createDivNode, createButtonNode } from "../../utils/node";

export default class DrumRollRowEditor extends Component {
  data: DrumRollRowStructure

  constructor(parent: Component, data: DrumRollRowStructure) {
    super(parent)
    this.data = data
  }

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      n.style.display = "flex"
      n.style.border = "solid 1px black"
    }, [
      createButtonNode(n => {
        n.innerText = "Delete"
        n.onclick = e => {
          this.destroy()
        }
      }),
      ...(this.data.beats.map((b, ind) => {
        return createButtonNode(n => {
          n.style.backgroundColor = b ? "white" : (ind % 4 === 0 ? "red" : "gray")
          n.style.border = "solid 1px black"
          n.style.margin = "5px"
          n.style.width = "30px"
          n.style.height = "40px"
          n.onclick = e => {
            this.data.beats[ind] = !this.data.beats[ind]
            n.style.backgroundColor = this.data.beats[ind] ? "white" : (ind % 4 === 0 ? "red" : "gray")
          }
        })
      }))
    ])
    return [newDiv, newDiv]
  }
}