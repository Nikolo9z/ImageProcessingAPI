import express from 'express'
import limiter from './middlewares/rateLimitMiddleware.js'
import { connectDB } from './config.js'
import imageRoutes from './routes/imageRoutes.js'
import authRoutes from './routes/authRoutes.js'
import swaggerUi from 'swagger-ui-express'
import swaggerJsDoc from 'swagger-jsdoc'
import dotenv from 'dotenv'
import { swaggerOptions } from './docs/swaggerConfig.js'
import { errorHandler } from './middlewares/errorMiddleware.js'
import cors from 'cors'

dotenv.config()
const app = express()
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(limiter)
app.disable('x-powered-by')

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

connectDB()

app.use(express.json())
app.use('/api/images', imageRoutes)
app.use('/api/auth', authRoutes)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
