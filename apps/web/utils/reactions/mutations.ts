/**
 * When creating reactions, we want snappy UI feedback. This means that we need
 * to optimistically create reactions before the server responds, which relies
 * on generating a `client_id` that gets set to the `reaction.id`. This is then
 * swapped with the server id on success.
 *
 * During this period we need to avoid calling mutations using the `client_id`.
 * That's why we use a map of promises referencing all reactions pending server
 * creation. This way we can defer mutations like `useCreatePostReaction` until
 * we get back the server id.
 */
const pendingReactionMutations = new Map<
  string,
  {
    promise: Promise<string>
    resolve: (value: string | PromiseLike<string>) => void
    reject: (reason?: any) => void
  }
>()

function createPendingReaction(client_id: string) {
  let resolve: (value: string | PromiseLike<string>) => void = () => void 0
  let reject: (reason?: any) => void = () => void 0
  const promise = new Promise<string>((innerResolve, innerReject) => {
    resolve = innerResolve
    reject = innerReject
  })

  pendingReactionMutations.set(client_id, { promise, resolve, reject })
}

export { createPendingReaction, pendingReactionMutations }
