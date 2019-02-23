import Component, { Container } from "../Component";
import { DrumRollRowStructure } from "../DrumRollStructure";
import { createDivNode, createButtonNode, createSelectNode, createOptionNode } from "../../utils/singable";
import { toPairs } from "lodash"
import { drumKeys } from "../../keys"

export default class DrumRollRowEditor extends Component {
  data: DrumRollRowStructure

  constructor(parent: Component, data: DrumRollRowStructure) {
    super(parent)
    this.data = data
  }

  render(): [HTMLElement, Container] {
    const newDiv = createDivNode(n => {
      n.style.border = "solid 1px black"
    }, [
      createDivNode(null, [
        createSelectNode(n => {
          n.onchange = e => {
            this.data.key = parseInt((e.target as HTMLOptionElement).value)
          }
        },
          toPairs(drumKeys)
            .sort()
            .map(([key, name]) => {
              return createOptionNode(n => {
                n.innerText = name
                n.value = key
                if (n.value === this.data.key.toString()) {
                  n.selected = true
                }
              })
            })
          )
      ]),
      createDivNode(null, 
        this.data.cells.map((b, ind) => {
          return createButtonNode(n => {
            n.style.backgroundColor = b ? "white" : (ind % this.data.cellsPerBeat === 0 ? "red" : "gray")
            n.style.border = "solid 1px black"
            n.style.margin = "5px"
            n.style.width = "30px"
            n.style.height = "40px"
            n.onclick = e => {
              this.data.cells[ind] = !this.data.cells[ind]
              n.style.backgroundColor = this.data.cells[ind] ? "white" : (ind % 4 === 0 ? "red" : "gray")
            }
          })
        })
      )
      
    ])
    return [newDiv, { default: newDiv }]
  }
}