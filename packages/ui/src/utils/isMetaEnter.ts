export function isMetaEnter(evt: React.KeyboardEvent) {
  return (evt.metaKey || evt.ctrlKey) && evt.key === 'Enter'
}
