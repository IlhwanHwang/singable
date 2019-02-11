import { number } from "prop-types";

export function createNode<T extends Node>(tagname: string, initializer: (n: T) => void = null, children: Array<Node> = null): Node {
  const node = document.createElement(tagname)
  if (initializer !== null) {
    initializer((node as any) as T)
  }
  if (children !== null) {
    children.forEach(n => {node.appendChild(n)})
  }
  return node
}

function makeCreateNode<T extends Node>(tagname: string) { return (initializer: (n: T) => void = null, children: Array<Node> = null) => { return createNode<T>(tagname, initializer, children) } }
export const createDivNode = makeCreateNode<HTMLDivElement>("div")
export const createButtonNode = makeCreateNode<HTMLButtonElement>("button")
export const createInputNode = makeCreateNode<HTMLInputElement>("input")
export const createPNode = makeCreateNode<HTMLElement>("p")