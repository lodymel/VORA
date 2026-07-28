import handler from 'vinext/server/app-router-entry'

type WorkerEnv = Parameters<typeof handler.fetch>[1]
type WorkerContext = Parameters<typeof handler.fetch>[2]

const worker = {
  fetch(request: Request, env: WorkerEnv, ctx: WorkerContext) {
    return handler.fetch(request, env, ctx)
  },
}

export default worker
