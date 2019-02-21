function getSvgCanvas() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.style.position = "absolute"
  svg.style.width = "100%"
  svg.style.height = "100%"
  svg.style.left = "0"
  svg.style.top = "0"
  svg.style.zIndex = "-1"
  return svg
}

export const svgBackground = getSvgCanvas()

export function drawLine(id: string, x1: number, y1: number, x2: number, y2: number) {
  const svg = svgBackground
  const line = (() => {
    const lineElem = svg.getElementById(id)
    if (lineElem) {
      lineElem.remove()
    }
    return document.createElementNS("http://www.w3.org/2000/svg", "line")
  })()
  line.id = id
  line.setAttribute("x1", x1.toString())
  line.setAttribute("y1", y1.toString())
  line.setAttribute("x2", x2.toString())
  line.setAttribute("y2", y2.toString())
  svg.appendChild(line)
  return line
}

export function drawClear(id: string) {
  const elem = svgBackground.getElementById(id)
  if (elem) {
    elem.remove()
  }
}