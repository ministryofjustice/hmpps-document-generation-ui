import { RequestHandler, Router, NextFunction, Request, Response } from 'express'
import { Page } from '../../services/auditService'
import { populateAuditPageName } from '../../middleware/audit/populateAuditPageName'

function asyncMiddleware<T, ResBody, ReqBody, Q>(fn: RequestHandler<T, ResBody, ReqBody, Q>) {
  return (req: Request<T, ResBody, ReqBody, Q>, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export const BaseRouter = () => {
  const router = Router({ mergeParams: true })

  const get = <T, ResBody, ReqBody, Q>(
    path: string,
    pageOrHandler: RequestHandler<T, ResBody, ReqBody, Q> | Page,
    ...otherHandlers: RequestHandler<T, ResBody, ReqBody, Q>[]
  ) => {
    const firstHandler = typeof pageOrHandler === 'string' ? populateAuditPageName(pageOrHandler) : pageOrHandler
    const handlers = [firstHandler, ...otherHandlers]

    return router.get(path, ...handlers.slice(0, -1), asyncMiddleware(handlers.slice(-1)[0]!))
  }

  const post = <T, ResBody, ReqBody, Q>(path: string, ...handlers: RequestHandler<T, ResBody, ReqBody, Q>[]) =>
    router.post(path, ...handlers.slice(0, -1), asyncMiddleware(handlers.slice(-1)[0]!))

  return {
    router,
    get,
    post,
  }
}
