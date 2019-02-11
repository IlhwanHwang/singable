import Component from "../Component";
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

  render(): [HTMLElement, HTMLElement] {
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
            .map(([name, key]) => {
              return createOptionNode(n => {
                n.innerText = name
                n.value = key.toString()
              })
            })
          )
      ]),
      createDivNode(null, 
        this.data.beats.map((b, ind) => {
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
        })
      )
      
    ])
    return [newDiv, newDiv]
  }
}