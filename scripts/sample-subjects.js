import mongoose from 'mongoose';
import Subject from '../backend/models/subject.model.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleSubjects = [
  {
    name: 'Mathematics',
    description: 'Core mathematical concepts and problem-solving skills',
    topics: [
      'Algebra',
      'Calculus',
      'Trigonometry',
      'Geometry',
      'Statistics',
      'Linear Algebra',
      'Differential Equations',
      'Number Theory',
      'Probability',
      'Discrete Mathematics'
    ],
    isActive: true
  },
  {
    name: 'Physics',
    description: 'Understanding the fundamental laws of nature',
    topics: [
      'Mechanics',
      'Thermodynamics',
      'Electromagnetism',
      'Optics',
      'Quantum Physics',
      'Relativity',
      'Wave Physics',
      'Nuclear Physics',
      'Astrophysics',
      'Particle Physics'
    ],
    isActive: true
  },
  {
    name: 'Chemistry',
    description: 'Study of matter and its transformations',
    topics: [
      'Organic Chemistry',
      'Inorganic Chemistry',
      'Physical Chemistry',
      'Analytical Chemistry',
      'Biochemistry',
      'Chemical Kinetics',
      'Thermochemistry',
      'Electrochemistry',
      'Polymer Chemistry',
      'Environmental Chemistry'
    ],
    isActive: true
  },
  {
    name: 'Biology',
    description: 'Study of living organisms and life processes',
    topics: [
      'Cell Biology',
      'Genetics',
      'Ecology',
      'Evolution',
      'Microbiology',
      'Anatomy',
      'Physiology',
      'Botany',
      'Zoology',
      'Molecular Biology'
    ],
    isActive: true
  },
  {
    name: 'English',
    description: 'Language arts and literature studies',
    topics: [
      'Grammar',
      'Literature',
      'Creative Writing',
      'Essay Writing',
      'Poetry',
      'Shakespeare',
      'Modern Literature',
      'Academic Writing',
      'Public Speaking',
      'Business English'
    ],
    isActive: true
  },
  {
    name: 'Computer Science',
    description: 'Programming and computational thinking',
    topics: [
      'Programming',
      'Data Structures',
      'Algorithms',
      'Web Development',
      'Database Design',
      'Machine Learning',
      'Artificial Intelligence',
      'Software Engineering',
      'Computer Networks',
      'Cybersecurity'
    ],
    isActive: true
  },
  {
    name: 'Economics',
    description: 'Study of production, distribution, and consumption',
    topics: [
      'Microeconomics',
      'Macroeconomics',
      'International Trade',
      'Development Economics',
      'Financial Economics',
      'Labor Economics',
      'Public Economics',
      'Behavioral Economics',
      'Game Theory',
      'Econometrics'
    ],
    isActive: true
  },
  {
    name: 'History',
    description: 'Study of past events and their impact',
    topics: [
      'Ancient History',
      'Medieval History',
      'Modern History',
      'World War I',
      'World War II',
      'American History',
      'European History',
      'Asian History',
      'African History',
      'Military History'
    ],
    isActive: true
  }
];

async function seedSubjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing subjects
    await Subject.deleteMany({});
    console.log('Cleared existing subjects');

    // Insert sample subjects
    const insertedSubjects = await Subject.insertMany(sampleSubjects);
    console.log(`Successfully inserted ${insertedSubjects.length} subjects`);

    // Display the inserted subjects
    insertedSubjects.forEach(subject => {
      console.log(`- ${subject.name}: ${subject.topics.length} topics`);
    });

    console.log('Sample subjects seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding subjects:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedSubjects(); 