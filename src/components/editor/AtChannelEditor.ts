import Component from "../Component"
import {createDivNode, createSelectNode, createOptionNode} from "../../utils/singable"
import {AtChannelStructure} from "../AtChannelSingable"
import { editorSingable } from "../../renderer";
import { fillArray } from "../../utils";


export default class AtChannelEditor extends Component {
  data: AtChannelStructure

  constructor(parent: Component, data: AtChannelStructure) {
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
        createSelectNode(n => {
          n.value = this.data.channel.toString()
          n.onchange = e => {
            this.data.channel = parseInt((e.target as HTMLOptionElement).value)
            editorSingable.get().update()
          }
        }, [
          ...fillArray(Array<number>(16), 0).map((_, ind) => {
            return createOptionNode(n => {
              n.value = ind.toString()
              n.innerText = (ind + 1).toString()
            })
          })
        ])
      ]
    )
    return [newDiv, newDiv]
  }
}