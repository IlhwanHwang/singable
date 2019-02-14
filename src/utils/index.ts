export function fillArray<T>(arr: Array<T>, value: T) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = value
  }
  return arr
}

export function filled<T>(value: T, length: number) {
  const arr = new Array<T>(length)
  return fillArray(arr, value)
}

export function forEach(object: any, func: (key: string, e: any) => void) {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const element = object[key];
      func(key, element)
    }
  }
}

export function centerOf(elem: Element) {
  const rect = elem.getClientRects()[0]
  return [rect.left + rect.width / 2, rect.top + rect.height / 2]
}

export function checkInside(elem: Element, x: number, y: number) {
  const rect = elem.getClientRects()[0]
  return (rect.left <= x && rect.right > x && rect.top <= y && rect.bottom > y)
}