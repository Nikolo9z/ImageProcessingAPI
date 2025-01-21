export const imageSchema = {
  Image: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        description: 'The auto-generated id of the image',
      },
      filename: {
        type: 'string',
        description: 'Name of the file',
      },
      urls3: {
        type: 'string',
        description: 'URL of the image in the S3 bucket',
      },
      format: {
        type: 'string',
        description: 'Format of the image',
      },
      width: {
        type: 'number',
        description: 'Width of the image',
      },
      height: {
        type: 'number',
        description: 'Height of the image',
      },
      user: {
        type: 'string',
        description: 'The user id of the image',
      },
      uploadDate: {
        type: 'string',
        format: 'date-time',
        description: 'Date when the image was uploaded',
      },
    },
  },
};