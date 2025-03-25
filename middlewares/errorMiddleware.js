import multer from 'multer'
import { apiResponse } from '../utils/response.js'
export const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return apiResponse(
      res,
      false,
      'Error de carga de archivo',
      null,
      err.message,
      400
    )
  }

  return apiResponse(
    res,
    false,
    'Error interno en el servidor',
    null,
    err.message,
    500
  )
}
