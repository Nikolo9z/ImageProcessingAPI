import multer from 'multer'
import sharp from 'sharp'
import Image from '../models/imageModel.js'
import { s3 } from '../bd/s3.js'
import dotenv from 'dotenv'
import { apiResponse } from '../utils/response.js'
dotenv.config()

const multerStorage = multer.memoryStorage()
export const upload = multer({ storage: multerStorage })

export const uploadImage = async (req, res) => {
  try {
    if (!req.user) {
      return apiResponse(
        res,
        false,
        'Usuario no autenticado',
        null,
        'Token inválido o expirado',
        401
      )
    }

    const { buffer } = req.file
    const metadata = await sharp(buffer).metadata()

    if (!metadata.format) {
      return apiResponse(
        res,
        false,
        'Formato de imagen no reconocido',
        null,
        'Formato inválido',
        400
      )
    }

    const resizedBuffer = await sharp(buffer)
      .resize({ width: 1200 })
      .toBuffer()

    const filename = `${Date.now()}.${metadata.format}`
    const s3params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${filename}`,
      Body: resizedBuffer,
      ContentType: `image/${metadata.format}`
    }

    const uploadResult = await s3.upload(s3params).promise()

    const newImage = new Image({
      filename,
      urls3: uploadResult.Location,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      user: req.user._id
    })

    await newImage.save()

    return apiResponse(res, true, 'Imagen subida exitosamente', newImage)
  } catch (error) {
    return apiResponse(
      res,
      false,
      'Error al subir imagen',
      null,
      error.message,
      400
    )
  }
}

export const getAllMyImages = async (req, res) => {
  try {
    if (!req.user) {
      return apiResponse(
        res,
        false,
        'Usuario no autenticado',
        null,
        'Token inválido o expirado',
        401
      )
    }

    const images = await Image.find({ user: req.user._id })
    if (images.length === 0) {
      return apiResponse(res, true, 'No tienes imágenes subidas', [])
    }

    return apiResponse(res, true, 'Imágenes obtenidas correctamente', images)
  } catch (error) {
    return apiResponse(
      res,
      false,
      'Error al obtener imágenes',
      null,
      error.message,
      500
    )
  }
}

export const getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)
      .populate('user', 'username urlAvatar')
      .populate({
        path: 'likes',
        select: 'username urlAvatar'
      })
      .populate({
        path: 'comments.user',
        select: 'username urlAvatar'
      })

    if (!image) {
      return apiResponse(
        res,
        false,
        'Imagen no encontrada',
        null,
        'No existe una imagen con ese ID',
        404
      )
    }

    const isOwner = req.user
      ? String(image.user._id) === String(req.user._id)
      : false

    return apiResponse(res, true, 'Imagen obtenida correctamente', {
      ...image.toObject(),
      isOwner
    })
  } catch (error) {
    return apiResponse(
      res,
      false,
      'Error al obtener imagen',
      null,
      error.message,
      500
    )
  }
}

export const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)

    if (!image) {
      return apiResponse(
        res,
        false,
        'Imagen no encontrada',
        null,
        'No existe una imagen con ese ID',
        404
      )
    }
    if (String(image.user) !== String(req.user._id)) {
      return apiResponse(
        res,
        false,
        'No tienes permiso para eliminar esta imagen',
        null,
        'Acceso denegado',
        403
      )
    }
    await Image.findByIdAndDelete(req.params.id)
    const s3params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${image.filename}`
    }
    await s3.deleteObject(s3params).promise()

    return apiResponse(res, true, 'Imagen eliminada correctamente')
  } catch (error) {
    return apiResponse(
      res,
      false,
      'Error al eliminar imagen',
      null,
      error.message,
      500
    )
  }
}

export const toggleLike = async (req, res) => {
  try {
    const imageId = req.params.id
    const image = await Image.findById(imageId)
    if (!image) {
      return apiResponse(
        res,
        false,
        'Imagen no encontrada',
        null,
        'ID inválido',
        404
      )
    }

    const userId = req.user._id
    const alreadyLiked = image.likes.some(
      (id) => id.toString() === userId.toString()
    )

    if (alreadyLiked) {
      image.likes.pull(userId)
    } else {
      image.likes.push(userId)
    }

    await image.save()

    return apiResponse(
      res,
      true,
      alreadyLiked ? 'Like quitado' : 'Like agregado',
      {
        imageId: image._id,
        likes: image.likes.length
      }
    )
  } catch (error) {
    return apiResponse(
      res,
      false,
      'Error al modificar el like',
      null,
      error.message,
      500
    )
  }
}

export const addComment = async (req, res) => {
  try {
    const imageId = req.params.id
    const image = await Image.findById(imageId)
    if (!image) {
      return apiResponse(
        res,
        false,
        'Imagen no encontrada',
        null,
        'ID inválido',
        404
      )
    }
    if (!req.body.text) {
      return apiResponse(
        res,
        false,
        'Comentario vacío',
        null,
        'Debes ingresar un comentario',
        400
      )
    }
    const comment = {
      user: req.user._id,
      username: req.user.username,
      text: req.body.text
    }

    image.comments.push(comment)
    await image.save()

    return apiResponse(res, true, 'Comentario agregado', comment)
  } catch (error) {
    return apiResponse(
      res,
      false,
      'Error al agregar comentario',
      null,
      error.message,
      500
    )
  }
}

export const deleteComment = async (req, res) => {
  try {
    const imageId = req.params.id
    const commentId = req.params.commentId

    const image = await Image.findById(imageId)
    if (!image) {
      return apiResponse(
        res,
        false,
        'Imagen no encontrada',
        null,
        'ID inválido',
        404
      )
    }

    const comment = image.comments.id(commentId)
    if (!comment) {
      return apiResponse(
        res,
        false,
        'Comentario no encontrado',
        null,
        'ID inválido',
        404
      )
    }

    if (String(comment.user) !== String(req.user._id)) {
      return apiResponse(
        res,
        false,
        'No tienes permiso para eliminar este comentario',
        null,
        'Acceso denegado',
        403
      )
    }

    comment.deleteOne()
    await image.save()

    return apiResponse(res, true, 'Comentario eliminado correctamente')
  } catch (error) {
    return apiResponse(
      res,
      false,
      'Error al eliminar comentario',
      null,
      error.message,
      500
    )
  }
}
