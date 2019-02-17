import { Numeral } from "./index"
import { Scale } from "./Scale";

export class ChordNode {
  value: number
  timing: number
  length: number
  numeral: Numeral
  prevs: Array<ChordNode> = Array()
  target: ChordNode = null
  totalValue: number = null

  constructor(numeral: Numeral, value: number, timing: number, length: number) {
    this.numeral = numeral
    this.value = value
    this.timing = timing
    this.length = length
  }

  actualValue(lengthAdvantage: number = 1.1) {
    return Math.pow(this.length, lengthAdvantage) * this.value
  }
}


export class ChordDag {
  nodes: Array<ChordNode> = Array()

  constructor(nodes: Array<ChordNode>) {
    this.nodes = nodes
  }

  buildEdge(scale: Scale) {
    const nodesAtEnding: { [index: number]: Array<ChordNode> } = {}
    
    this.nodes.forEach(n => {
      const end = n.timing + n.length
      if (nodesAtEnding[end] === undefined) {
        nodesAtEnding[end] = Array()
      }
      nodesAtEnding[end].push(n)
    })

    this.nodes.forEach(n => {
      const leaders = nodesAtEnding[n.timing]
      if (leaders !== undefined) {
        n.prevs = leaders.filter(m => scale.isTransitable(m.numeral, n.numeral))
      }
    })
  }

  solve(scale: Scale) {
    this.buildEdge(scale)
    
    this.nodes
      .sort((n1, n2) => n1.timing - n2.timing)
      .forEach(n => {
        if (n.prevs.length > 0) {
          const maxLeader = n.prevs.reduce((acc, n) => n.totalValue > acc.totalValue ? n : acc)
          n.totalValue = maxLeader.totalValue + n.actualValue()
          n.target = maxLeader
        }
        else {
          n.totalValue = n.actualValue()
        }
      })
    
    const endMax = Math.max(...this.nodes.map(n => n.timing + n.length))
    const endNode = this.nodes
      .filter(n => n.timing + n.length === endMax)
      .reduce((acc, n) => n.totalValue > acc.totalValue ? n : acc)
    
    const result = Array<ChordNode>()
    let node = endNode
    while (node !== null) {
      result.unshift(node)
      node = node.target
    }

    return result
  }
}
