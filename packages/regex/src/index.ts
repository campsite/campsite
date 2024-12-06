let figmaExpression = /^https:\/\/([\w.-]+\.)?figma.com\/([\w-]+)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/gi
let loomExpression = /^https:\/\/([\w.-]+\.)?loom.com\/share\/([0-9a-zA-Z]{22,128})(?:\/.*)?(\?.*)?/gi
let codepenExpression = /^https:\/\/([\w.-]+\.)?codepen.io\/([0-9a-zA-Z]{1,32})\/pen\/([0-9a-zA-Z]{1,32})(?:\/.*)?$/gi
let codesandboxExpression = /^https:\/\/([\w.-]+\.)?codesandbox.io\/(embed|s)\/[-a-zA-Z0-9()@:%_+.~#?&//=]*$/gi
let riveExpression = /^https:\/\/([\w.-]+\.)?rive.app\/s\/[-a-zA-Z0-9()@:%_+.~#?&//=]*$/gi
let playExpression = /^https:\/\/([\w.-]+\.)?(share\.)createwithplay.com\/project\/[-a-zA-Z0-9()@:%_+.~#?&//=]*$/gi
let tomeExpression = /^https:\/\/([\w.-]+\.)?tome.app\/[0-9a-zA-Z]*\/[-a-zA-Z0-9()@:%_+.~#?&//=]*$/gi
let youtubeExpression = /^https:\/\/([\w.-]+\.)?youtube.com\/watch\?v=([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/gi

export const figmaRegex = new RegExp(figmaExpression)
export const loomRegex = new RegExp(loomExpression)
export const codepenRegex = new RegExp(codepenExpression)
export const codesandboxRegex = new RegExp(codesandboxExpression)
export const riveRegex = new RegExp(riveExpression)
export const playRegex = new RegExp(playExpression)
export const tomeRegex = new RegExp(tomeExpression)
export const youtubeRegex = new RegExp(youtubeExpression)

// not bulletproof; intended to differentiate between server IDs and client IDs
export const uuidExpression = /^[a-z,0-9,-]{36,36}$/
