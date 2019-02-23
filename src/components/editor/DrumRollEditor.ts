import Component, { Container } from "../Component"
import {createDivNode, createButtonNode} from "../../utils/singable"
import DrumRollStructure from "../DrumRollStructure"
import DrumRollRowEditor from "./DrumRollRowEditor";
import { filled } from "../../utils";
import Player from "../../utils/Player";
import BaseEditor from "../BaseEditor";
import DrumRollSingable from "../DrumRollSingable";

export default class DrumRollEditor extends BaseEditor {
  data: DrumRollStructure
  player: Player = null

  constructor(parent: Component, parentTarget: string = "default", singable: DrumRollSingable) {
    super(parent, parentTarget, singable)
    this.data = singable.data
  }

  removeChild(child: Component) {
    if (child instanceof DrumRollRowEditor) {
      this.data.rows = this.data.rows.filter(d => {
        return d !== child.data
      })
    }
    super.removeChild(child)
  }

  render(): [HTMLElement, Container] {
    const newDiv = createDivNode(
      n => {
        n.style.border = "solid 1px orange",
        n.style.width = "100%",
        n.style.height = "100%",
        n.style.boxSizing = "border-box"
      },
      [
        createButtonNode(n => {
          n.innerText = "Play"
          const stop = () => {
            if (this.player) {
              this.player.stop()
              this.player = null
              n.innerText = "Play"
            }
          }
          const play = () => {
            this.singable.sing().toFile("./temp.mid")
            this.player = new Player()
            this.player.play("./temp.mid", _ => stop())
            n.innerText = "Stop"
          }
          n.onclick = e => this.player === null ? play() : stop()
        }),
        createButtonNode(n => {
          n.innerText = "Add new drumroll row"
          n.onclick = e => {
            const newDR = new DrumRollRowEditor(this, {
              name: "new drumroll row",
              cells: filled(false, this.data.length * this.data.cellsPerBeat),
              cellsPerBeat: this.data.cellsPerBeat,
              key: 35
            })
            newDR.update()
            // TODO: Smarter data sync
            this.data.rows.push(newDR.data)
          }
        }),
      ]
    )
    this.data.rows.forEach(dr => {
      new DrumRollRowEditor(this, dr)
    })
    return [newDiv, { default: newDiv }]
  }
}