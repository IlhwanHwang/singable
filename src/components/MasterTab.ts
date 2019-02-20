import Component from "./Component";
import Player from "../utils/Player";
import { createDivNode, createButtonNode } from "../utils/singable";
import { singablePanel, connections, rootComp } from "../renderer";
import OutputSingable from "./OutputSingable";
import Singable from "./Singable";


export default class MasterTab extends Component {
  player: Player = null

  newProject(e: MouseEvent) {
    while (connections.get().length > 0) {
      connections.set(connections.get().slice(0, connections.get().length - 1))
    }
    while (singablePanel.children.length > 0) {
      singablePanel.children[0].destroy()
    }
    singablePanel.zoom = 1
    singablePanel.moveTo(0, 0)
    rootComp.update()
  }

  openProject(e: MouseEvent) {
  }

  saveProject(e: MouseEvent) {
  }

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      n.style.width = "100vw"
      n.style.height = "24px"
    }, [
      createButtonNode(n => {
        n.innerText = "New"
        n.onclick = this.newProject
      }),
      createButtonNode(n => {
        n.innerText = "Open"
        n.onclick = this.openProject
      }),
      createButtonNode(n => {
        n.innerText = "Save"
        n.onclick = this.saveProject
      }),
      createButtonNode(n => {
        n.innerText = "Play"
        const play = (): void => {
          const output = (() => {
            const founds = singablePanel.find(s => (s instanceof OutputSingable))
            if (founds.length === 1) {
              return founds[0]
            }
            else {
              window.alert("Zero, two or more outputs are detected.")
              return
            }
          })() as Singable
        
          if (output === null) {
            return
          }
        
          output.sing().toFile("./test.mid")
          this.player = new Player()
          this.player.play("./test.mid", stop)
          n.innerText = "Stop"
        }
        const stop = (): void => {
          if (this.player) { this.player.stop() }
          this.player = null
          n.innerText = "Play"
        }
        n.onclick = e => this.player ? stop() : play()
      })
    ])
    return [newDiv, newDiv]
  }
}