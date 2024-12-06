export function delay(timeout: number) {
  const timeoutSeconds = timeout * 1000

  return new Promise((resolve) => setTimeout(resolve, timeoutSeconds))
}
