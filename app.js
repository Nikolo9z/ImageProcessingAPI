import express from 'express'
import limiter from './middlewares/rateLimitMiddleware.js'
import { connectDB } from './config.js'
import imageRoutes from './routes/imageRoutes.js'
import authRoutes from './routes/authRoutes.js'
import swaggerUi from 'swagger-ui-express'
import swaggerJsDoc from 'swagger-jsdoc'
import dotenv from 'dotenv'
import { swaggerOptions } from './docs/swaggerConfig.js'

dotenv.config()
const app = express()

app.use(limiter)
app.disable('x-powered-by')

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

connectDB()

app.use(express.json())
app.use('/api/images', imageRoutes)
app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
