export function createNode<T extends HTMLElement>(tagname: string, initializer: (n: T) => void = null, children: Array<HTMLElement> = null): HTMLElement {
  const node = document.createElement(tagname)
  if (initializer !== null) {
    initializer((node as any) as T)
  }
  if (children !== null) {
    children.forEach(n => {node.appendChild(n)})
  }
  return node
}

function makeCreateNode<T extends HTMLElement>(tagname: string) { return (initializer: (n: T) => void = null, children: Array<HTMLElement> = null) => { return createNode<T>(tagname, initializer, children) } }
export const createDivNode = makeCreateNode<HTMLDivElement>("div")
export const createButtonNode = makeCreateNode<HTMLButtonElement>("button")
export const createInputNode = makeCreateNode<HTMLInputElement>("input")
export const createPNode = makeCreateNode<HTMLElement>("p")
export const createSelectNode = makeCreateNode<HTMLSelectElement>("select")
export const createOptionNode = makeCreateNode<HTMLOptionElement>("option")
export const createSpanNode = makeCreateNode<HTMLSpanElement>("span")

import { singablePanel } from "../renderer";
import ArpeggioSingable from "../components/ArpeggioSingable";
import AtChannelSingable from "../components/AtChannelSingable";
import BoundSingable from "../components/BoundSingable";

const factory = {
  arpeggio: () => new ArpeggioSingable(singablePanel),
  "at-channel": () => new AtChannelSingable(singablePanel),
  bound: () => new BoundSingable(singablePanel),
}

export function fromData(type: string, data: any) {
  switch (type) {
  case "arpeggio":
     = new ArpeggioSingable(singablePanel)
    singable.data = data
  }
}