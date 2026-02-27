import { Router, ErrorRequestHandler } from 'express'
import multer, { MulterError } from 'multer'

export default function handleFileUpload(): Router {
  const router = Router({ mergeParams: true })
  const maxUploadSize = 1024 * 1024 // 1MB
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: maxUploadSize } })

  router.use(upload.single('file'))
  router.use(uploadedFileTooLargeHandler)

  return router
}

export const uploadedFileTooLargeHandler: ErrorRequestHandler = (err: Error, req, _res, next): void => {
  if (!(err instanceof MulterError) && (err as MulterError).code !== 'LIMIT_FILE_SIZE') return next(err)

  req.fileError = 'The selected file must be smaller than 1MB'
  return next()
}
