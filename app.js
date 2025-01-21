import express from 'express';
import { connectDB } from './config.js';
import imageRoutes from './routes/imageRoutes.js';
import authRoutes from './routes/authRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { imageSchema } from './docs/swaggerSchema.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Image Processing API',
            version: '1.0.0',
            description: 'API for uploading, resizing, and managing images',
        },
        components: {
            schemas: imageSchema,
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

connectDB();

app.use(express.json());
app.use('/api/images', imageRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));