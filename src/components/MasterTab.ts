import Component from "./Component";
import Player from "../utils/Player";
import { createDivNode, createButtonNode } from "../utils/singable";
import { singablePanel, connections, rootComp } from "../renderer";
import OutputSingable from "./OutputSingable";
import Singable from "./Singable";
import { remote } from "electron"
import { writeFileSync, readFileSync } from "fs"
import { toPairs } from "lodash"

export default class MasterTab extends Component {
  player: Player = null
  savePath: string = null

  newProject() {
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

  openProject() {
    const path = remote.dialog.showOpenDialog({
      filters: [
        { name: "Singable 파일 (*.singable)", extensions: ["singable"] }
      ]
    })

    if (path === undefined) {
      return
    }

    this.newProject()
    const data = JSON.parse(readFileSync(path[0], { "encoding": "utf-8" }))
    const singableData = data["singableData"] as Array<any>
    singableData.forEach(d => {
      d
    })
  }

  saveProject(dialog: boolean) {
    if (dialog) {
      const path = remote.dialog.showSaveDialog({
        filters: [
          { name: "Singable 파일 (*.singable)", extensions: ["singable"] }
        ]
      })
      if (path !== undefined) {
        this.savePath = path
      }
      else {
        return
      }
    }

    const singableData = singablePanel.children
      .filter(c => c instanceof Singable)
      .map(c => c as Singable)
      .map(singable => {
        return {
          type: singable.className,
          x: singable.__translateX,
          y: singable.__translateY,
          name: singable.name,
          id: singable.systemName,
          data: singable.data,
          endpoints: singable.endpoints.map(ep => [ep.systemName, ep.uniqueName]),
        }
      })

    const connectionData = connections.get().map(({ op, ip }) => {
      return {
        op: [op.systemName, op.uniqueName],
        ip: [ip.systemName, ip.uniqueName],
      }
    })

    const data = {
      singables: singableData,
      connections: connectionData
    }

    writeFileSync(this.savePath, JSON.stringify(data, null, 2))
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
        n.onclick = e => { this.saveProject(this.savePath === null) }
      }),
      createButtonNode(n => {
        n.innerText = "Save As"
        n.onclick = e => { this.saveProject(true) }
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