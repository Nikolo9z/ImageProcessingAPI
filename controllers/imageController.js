import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import Image from '../models/imageModel.js';
import {s3} from '../s3.js';
import dotenv from 'dotenv';
dotenv.config();

const multerStorage = multer.memoryStorage();
export const upload = multer({ storage: multerStorage });

export const uploadImage = async (req, res) => {
    try {
        const { buffer} = req.file;
        const metadata = await sharp(buffer).metadata();
        const filename = `${Date.now()}.${metadata.format}`;
        const s3params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `images/${filename}`,
            Body: buffer,
            ContentType: `image/${metadata.format}`,
        };
        const uploadResult = await s3.upload(s3params).promise();
        const newImage = new Image({
            filename,
            urls3: uploadResult.Location,
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            user: req.user._id,
        });
        await newImage.save();
        res.status(201).json({ message: 'Image uploaded successfully', image: newImage });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
    };

export const getAllImages = async (req, res) => {
    try {
        const images = await Image.find({user:req.user._id});
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: 'user do not have images' });
    }
}

export const getImageId = async (req, res) => {
    try {
        const image = await Image.findById({ _id: req.params.id, user: req.user._id });
        res.status(200).json(image);
    } catch (error) {
        res.status(500).json({ error: 'image not found' });
    }
}

export const deleteImage = async (req, res) => {
    try {
        const image = await Image.findByIdAndDelete({ _id: req.params.id, user: req.user._id });
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        const s3params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `images/${image.filename}`,
        };
        await s3.deleteObject(s3params).promise();
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const resizeImage = async (req, res) => {
    try {
        const image = await Image.findById({ _id: req.params.id, user: req.user._id });
        if (!image) {
            return res.status(404).json({ error: 'image not found' });
        }

        const { width, height } = req.query;
        const s3Params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `images/${image.filename}`,
        };
        const s3Object = await s3.getObject(s3Params).promise();
        const buffer = s3Object.Body;
        const resizedBuffer = await sharp(buffer)
            .resize(Number(width), Number(height))
            .toBuffer();
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `images/${image.filename}`,
            Body: resizedBuffer,
            ContentType: s3Object.ContentType,
        };
        await s3.upload(uploadParams).promise();
        image.width = Number(width);
        image.height = Number(height);
        await image.save();
        res.status(200).json({ message: 'image resized successfully', image });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const rotateImage = async (req, res) => {
    try {
        const image = await Image.findById({ _id: req.params.id, user: req.user._id });
        if (!image) {
            return res.status(404).json({ error: 'image not found' });
        }
        const s3Params = {
            Bucket: process.env.AWS_BUCKET_NAME, // Reemplaza con el nombre de tu bucket
            Key: `images/${image.filename}`,
        };
        const { angle } = req.query;
        const s3Object = await s3.getObject(s3Params).promise();
        const buffer = s3Object.Body;
        const rotatedBuffer = await sharp(buffer).rotate(Number(angle)).toBuffer();
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `images/${image.filename}`,
            Body: rotatedBuffer,
            ContentType: s3Object.ContentType,
        };
        await s3.upload(uploadParams).promise();
        res.status(200).json({ message: 'image rotated successfully', image });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const flipImage = async (req, res) => {
    try{
        const image = await Image.findById({ _id: req.params.id, user: req.user._id });
        if(!image){
            return res.status(404).json({ error: 'image not found' });
        }
        const { flip } = req.query;
        const s3Params = {
            Bucket: process.env.AWS_BUCKET_NAME, // Reemplaza con el nombre de tu bucket
            Key: `images/${image.filename}`,
        };
        const s3Object = await s3.getObject(s3Params).promise();
        const buffer = s3Object.Body;
        let flippedBuffer;
        if(flip ==='horizontal'){
            flippedBuffer = await sharp(buffer).flip().toBuffer();
        }else if(flip === 'vertical'){
            flippedBuffer = await sharp(buffer).flop().toBuffer();
        }
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME, // Reemplaza con el nombre de tu bucket
            Key: `images/${image.filename}`,
            Body: flippedBuffer,
            ContentType: s3Object.ContentType,
        };
        await s3.upload(uploadParams).promise();
        res.status(200).json({ message: 'image flipped successfully', image });
    }catch(error){
        res.status(500).json({ error: error.message });
    }
}

export const changeFormatImage = async (req, res) => {
    try {
        const image = await Image.findById({ _id: req.params.id, user: req.user._id });
        if (!image) {
            return res.status(404).json({ error: 'image not found' });
        }

        const newFormat = req.query.format;
        if (!newFormat) {
            return res.status(400).json({ error: 'Format is required' });
        }

        const s3Params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `images/${image.filename}`,
        };
        const s3Object = await s3.getObject(s3Params).promise();
        const buffer = s3Object.Body;
        const newFilename = `${path.parse(image.filename).name}.${newFormat}`;
        const formattedBuffer = await sharp(buffer).toFormat(newFormat).toBuffer();
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `images/${newFilename}`,
            Body: formattedBuffer,
            ContentType: `image/${newFormat}`,
        };
        await s3.upload(uploadParams).promise();
        await s3.deleteObject(s3Params).promise();
        image.format = newFormat;
        image.filename = newFilename;
        await image.save();
        res.status(200).json({ message: 'image format changed successfully', image });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};