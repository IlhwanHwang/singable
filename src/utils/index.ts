export function fillArray<T>(arr: Array<T>, value: T) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = value
  }
  return arr
}

export function forEach(object: any, func: (key: string, e: any) => void) {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const element = object[key];
      func(key, element)
    }
  }
}