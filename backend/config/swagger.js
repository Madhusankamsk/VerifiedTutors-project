import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Verified Tutors API',
      version: '1.0.0',
      description: 'API documentation for Verified Tutors platform',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'User\'s full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User\'s password (min 6 characters)',
            },
            role: {
              type: 'string',
              enum: ['admin', 'tutor', 'student'],
              default: 'student',
              description: 'User\'s role in the system',
            },
            profileImage: {
              type: 'string',
              description: 'URL to user\'s profile image',
            },
          },
        },
        Tutor: {
          type: 'object',
          required: ['user', 'subjects'],
          properties: {
            user: {
              type: 'string',
              description: 'Reference to User model',
            },
            bio: {
              type: 'string',
              description: 'Tutor\'s biography',
            },
            subjects: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of subject IDs',
            },
            education: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  degree: { type: 'string' },
                  institution: { type: 'string' },
                  year: { type: 'number' },
                },
              },
            },
            experience: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  company: { type: 'string' },
                  duration: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
            hourlyRate: {
              type: 'number',
              description: 'Tutor\'s hourly rate',
            },
            availability: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: {
                    type: 'string',
                    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                  },
                  slots: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        start: { type: 'string' },
                        end: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
            rating: {
              type: 'number',
              description: 'Average rating (1-5)',
            },
            totalRatings: {
              type: 'number',
              description: 'Total number of ratings',
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether the tutor is verified',
            },
            documents: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of document URLs',
            },
          },
        },
        Subject: {
          type: 'object',
          required: ['name', 'category'],
          properties: {
            name: {
              type: 'string',
              description: 'Subject name',
            },
            category: {
              type: 'string',
              enum: ['Science', 'Mathematics', 'Languages', 'Arts', 'Computer Science', 'Business', 'Other'],
              description: 'Subject category',
            },
            description: {
              type: 'string',
              description: 'Subject description',
            },
            level: {
              type: 'string',
              enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
              default: 'All Levels',
              description: 'Subject difficulty level',
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Whether the subject is active',
            },
          },
        },
        Rating: {
          type: 'object',
          required: ['tutor', 'student', 'rating', 'review'],
          properties: {
            tutor: {
              type: 'string',
              description: 'Reference to Tutor model',
            },
            student: {
              type: 'string',
              description: 'Reference to User model',
            },
            rating: {
              type: 'number',
              minimum: 1,
              maximum: 5,
              description: 'Rating value (1-5)',
            },
            review: {
              type: 'string',
              description: 'Review text',
            },
            isVerified: {
              type: 'boolean',
              default: false,
              description: 'Whether the rating is verified',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

export const specs = swaggerJsdoc(options); 