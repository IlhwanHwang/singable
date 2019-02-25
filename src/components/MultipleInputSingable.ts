import Component from "./Component"
import Singable from "./Singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";
import { Timeline } from "../Key";
import { NullEditor } from "./NullEditor";
import { connections } from "../renderer";


export default class MultipleInputSingable extends Singable {
  className: string = "multiple-input"
  ipConnected: Array<InEndpoint>
  ipDummy: Array<InEndpoint>

  constructor(parent: Component, parentTarget: string = "default") {
    super(parent)
    this.ipConnected = new Array<InEndpoint>()
    this.ipDummy = new Array<InEndpoint>()
    this.ipDummy.push(new InEndpoint(this))
    connections.watch(this)
  }

  destroy() {
    connections.unwatch(this)
    super.destroy()
  }

  update() {
    const newConnections = this.ipDummy
      .map((ip, ind) => { return { ip: ip, ind: ind } })
      .filter(({ ip }) => ip.findOut())
    const newDisconnections = this.ipConnected
      .map((ip, ind) => { return { ip: ip, ind: ind } })
      .filter(({ ip }) => !ip.findOut())

    if (newConnections.length == 1) {
      const { ip, ind } = newConnections[0]
      this.ipDummy = [
        ...this.ipDummy.slice(0, ind),
        new InEndpoint(this), new InEndpoint(this),
        ...this.ipDummy.slice(ind + 1)
      ]
      this.ipConnected = [
        ...this.ipConnected.slice(0, ind),
        ip,
        ...this.ipConnected.slice(ind)
      ]
    }
    else if (newDisconnections.length == 1) {
      const { ip, ind } = newDisconnections[0]
      const toBeDestoryed = [ip, this.ipDummy[ind]]
      this.ipDummy = [
        ...this.ipDummy.slice(0, ind),
        ...this.ipDummy.slice(ind + 1)
      ]
      this.ipConnected = [
        ...this.ipConnected.slice(0, ind),
        ...this.ipConnected.slice(ind + 1)
      ]
      toBeDestoryed.forEach(ep => ep.destroy())
    }
    else if (newDisconnections.length == 0 && newConnections.length == 0) {
      super.update()
      return
    }
    else {
      throw Error("Two or more connections or disconnections made simultanously")
    }

    const ipCountTotal = this.ipDummy.length + this.ipConnected.length
    this.ipDummy.forEach((ip, ind) => {
      ip.position = (ind * 2 + 1) / (ipCountTotal + 1)
      ip.uniqueName = `dummy-endpoint-${ind}`
    })
    this.ipConnected.forEach((ip, ind) => {
      ip.position = (ind * 2 + 2) / (ipCountTotal + 1)
      ip.uniqueName = `@connected-endpoint-${ind}`
    })

    super.update()
  }
}