import { Router, NextFunction, Request, Response } from 'express'

export const overrideTimeoutMiddleware = (timeoutSeconds: number) => {
  const router = Router({ mergeParams: true })

  router.use((req: Request, _res: Response, next: NextFunction) => {
    req.setTimeout(timeoutSeconds * 1000)
    next()
  })
  return router
}
