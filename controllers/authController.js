import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { apiResponse } from '../utils/response.js'
import sharp from 'sharp'
import { s3 } from '../bd/s3.js'

export const register = async (req, res) => {
  try {
    const { username, email, password } = new User(req.body)
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    })
    await newUser.save()
    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' })
    }
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    res.status(200).json({ message: 'User logged in successfully', token })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const updateAvatar = async (req, res) => {
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
    const user = await User.findById(req.user._id)
    if (!user) {
      return apiResponse(
        res,
        false,
        'Usuario no encontrado',
        null,
        'Usuario no encontrado',
        404
      )
    }
    if (!req.file) {
      return apiResponse(
        res,
        false,
        'No se ha proporcionado una imagen',
        null,
        'Imagen no encontrada',
        400
      )
    }
    const { buffer } = req.file
    const resizedBuffer = await sharp(buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer()
    const filename = `${req.user._id}.png`
    const s3params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `avatars/${filename}`,
      Body: resizedBuffer,
      ContentType: 'image/png'
    }
    const uploadResult = await s3.upload(s3params).promise()
    console.log(uploadResult)
    await user.updateOne({ urlAvatar: uploadResult.Location })
    return apiResponse(res, true, 'Avatar actualizado exitosamente', {
      urlAvatar: uploadResult.Location
    })
  } catch (error) {
    return apiResponse(
      res,
      false,
      'Error al actualizar avatar',
      null,
      error.message,
      500
    )
  }
}
