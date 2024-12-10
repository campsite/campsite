export function editorTestSetup() {
  function getBoundingClientRect(): DOMRect {
    const rec = {
      x: 0,
      y: 0,
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0
    }

    return { ...rec, toJSON: () => rec }
  }

  class FakeDOMRectList extends Array<DOMRect> implements DOMRectList {
    item(index: number): DOMRect | null {
      return this[index]
    }
  }

  document.elementFromPoint = (): null => null
  HTMLElement.prototype.getBoundingClientRect = getBoundingClientRect
  HTMLElement.prototype.getClientRects = (): DOMRectList => new FakeDOMRectList()
  Range.prototype.getBoundingClientRect = getBoundingClientRect
  Range.prototype.getClientRects = (): DOMRectList => new FakeDOMRectList()
}
