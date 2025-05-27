import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Verified Tutors API',
      version: '1.0.0',
      description: 'API documentation for Verified Tutors platform',
      contact: {
        name: 'API Support',
        email: 'support@verifiedtutors.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.verifiedtutors.com',
        description: 'Production server',
      }
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
            _id: {
              type: 'string',
              description: 'The auto-generated id of the user'
            },
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
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            }
          },
        },
        Tutor: {
          type: 'object',
          required: ['user', 'subjects'],
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated id of the tutor'
            },
            user: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                profileImage: { type: 'string' }
              },
              description: 'User information'
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other'],
              description: 'Tutor\'s gender'
            },
            mobileNumber: {
              type: 'string',
              pattern: '^[0-9]{10}$',
              description: '10-digit mobile number'
            },
            bio: {
              type: 'string',
              description: 'Tutor\'s biography'
            },
            subjects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  category: { type: 'string' }
                }
              },
              description: 'Subjects taught by the tutor'
            },
            locations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' }
                }
              },
              description: 'Teaching locations'
            },
            education: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  degree: { type: 'string' },
                  institution: { type: 'string' },
                  year: { type: 'number' }
                }
              },
              description: 'Education history'
            },
            experience: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  company: { type: 'string' },
                  duration: { type: 'string' },
                  description: { type: 'string' }
                }
              },
              description: 'Work experience'
            },
            hourlyRate: {
              type: 'number',
              minimum: 0,
              description: 'Price per hour'
            },
            availability: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: {
                    type: 'string',
                    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                  },
                  slots: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        start: { type: 'string', format: 'time' },
                        end: { type: 'string', format: 'time' }
                      }
                    }
                  }
                }
              },
              description: 'Weekly availability schedule'
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'Average rating (0-5)'
            },
            totalRatings: {
              type: 'number',
              description: 'Total number of ratings'
            },
            isVerified: {
              type: 'boolean',
              default: false,
              description: 'Whether the tutor is verified'
            },
            documents: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of document URLs'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Profile creation timestamp'
            }
          }
        },
        Blog: {
          type: 'object',
          required: ['title', 'content', 'author'],
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated id of the blog'
            },
            title: {
              type: 'string',
              description: 'The blog post title'
            },
            content: {
              type: 'string',
              description: 'The blog post content'
            },
            author: {
              type: 'string',
              description: 'Reference to the Tutor model'
            },
            featuredImage: {
              type: 'string',
              description: 'URL to the featured image'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of tags for the blog post'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              description: 'The status of the blog post'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Blog creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Subject: {
          type: 'object',
          required: ['name', 'category'],
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated id of the subject'
            },
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
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Subject creation timestamp'
            }
          },
        },
        Rating: {
          type: 'object',
          required: ['tutor', 'student', 'rating', 'review'],
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated id of the rating'
            },
            tutor: {
              type: 'string',
              description: 'Reference to Tutor model',
            },
            student: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                profileImage: { type: 'string' }
              },
              description: 'Student information'
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
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Rating creation timestamp'
            }
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

export const specs = swaggerJsdoc(options); 