export function isDropboxPaper(html: string): boolean {
  // real example: <meta charset='utf-8'><span class=" author-d-1gg9uz65z1iz85zgdz68zmqkz84zo2qotvotu4z70znz76z3lfyyz86zz77zz68zz68zz122zvz65zjeo5tyz122zlz89z1r">foo</span>
  return html.startsWith("<meta charset='utf-8'>") && /author-d-[a-zA-Z0-9^"]+/.test(html)
}
