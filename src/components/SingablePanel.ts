import Component from "./Component"
import {createDivNode, createButtonNode} from "../utils/singable"
import DrumRollSingable from "./DrumRollSingable";
import TransposeSingable from "./TransposeSingable";
import OutputSingable from "./OutputSingable"
import PianoRollSingable from "./PianoRollSingable"
import AtChannelSingable from "./AtChannelSingable";
import ParallelSingable from "./ParallelSingable";
import EnumerateSingable from "./EnumerateSingable";
import ReharmonizeSingable from "./ReharmonizeSingable";

export default class SingablePanel extends Component {

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(
      n => {
        n.style.border = "solid 1px black",
        n.style.width = "100%",
        n.style.height = "100%",
        n.style.boxSizing = "border-box"
      },
      [
        createButtonNode(n => {
          n.innerText = "New drum roll"
          n.onclick = e => {
            const newSingable = new DrumRollSingable(this)
            newSingable.update()
          }
        }),
        createButtonNode(n => {
          n.innerText = "New piano roll"
          n.onclick = e => {
            const newSingable = new PianoRollSingable(this)
            newSingable.update()
          }
        }),
        createButtonNode(n => {
          n.innerText = "New transpose"
          n.onclick = e => {
            const newSingable = new TransposeSingable(this)
            newSingable.update()
          }
        }),
        createButtonNode(n => {
          n.innerText = "New at-channel"
          n.onclick = e => {
            const newSingable = new AtChannelSingable(this)
            newSingable.update()
          }
        }),
        createButtonNode(n => {
          n.innerText = "New output"
          n.onclick = e => {
            const newSingable = new OutputSingable(this)
            newSingable.update()
          }
        }),
        createButtonNode(n => {
          n.innerText = "New parallel"
          n.onclick = e => {
            const newSingable = new ParallelSingable(this)
            newSingable.update()
          }
        }),
        createButtonNode(n => {
          n.innerText = "New enumerate"
          n.onclick = e => {
            const newSingable = new EnumerateSingable(this)
            newSingable.update()
          }
        }),
        createButtonNode(n => {
          n.innerText = "New reharmonize"
          n.onclick = e => {
            const newSingable = new ReharmonizeSingable(this)
            newSingable.update()
          }
        })
      ]
    )
    return [newDiv, newDiv]
  }
}