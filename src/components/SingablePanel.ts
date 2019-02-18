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
import Singable from "./Singable";
import ArpeggioSingable from "./ArpeggioSingable";
import RepeatSingable from "./RepeatSingable";

export default class SingablePanel extends Component {

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(
      n => {
        n.style.border = "solid 1px black",
        n.style.width = "100%",
        n.style.height = "100%",
        n.style.boxSizing = "border-box"
        n.style.overflow = "hidden"
      },
      [
        ["New drum roll", () => new DrumRollSingable(this)],
        ["New piano roll", () => new PianoRollSingable(this)],
        ["New transpose", () => new TransposeSingable(this)],
        ["New at-channel", () => new AtChannelSingable(this)],
        ["New output", () => new OutputSingable(this)],
        ["New parallel", () => new ParallelSingable(this)],
        ["New enumerate", () => new EnumerateSingable(this)],
        ["New reharmonize", () => new ReharmonizeSingable(this)],
        ["New arpeggio", () => new ArpeggioSingable(this)],
        ["New repeat", () => new RepeatSingable(this)],
      ]
        .map(x => x as [string, () => Singable])
        .map(([text, factory]) =>
        createButtonNode(n => {
          n.innerText = text
          n.onclick = e => {
            const newSingable = factory()
            newSingable.update()
          }
        })
      )
    )
    return [newDiv, newDiv]
  }
}