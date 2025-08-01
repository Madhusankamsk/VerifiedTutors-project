import React, { useState } from 'react';
import { Search, Filter, BookOpen, Clock, Users, Star, ChevronDown } from 'lucide-react';
import { useSubjects } from '../contexts/SubjectContext';
import SubjectBubbles from '../components/common/SubjectBubbles';
import CourseFilterBubbles from '../components/common/CourseFilterBubbles';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    image: string;
  };
  thumbnail: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const CoursesPage: React.FC = () => {
  const { subjects } = useSubjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  // Mock data - replace with actual data from your backend
  const courses: Course[] = [
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      description: 'Learn web development from scratch. HTML, CSS, JavaScript, React, Node.js and more!',
      instructor: {
        name: 'John Doe',
        image: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      duration: '12 weeks',
      students: 1234,
      rating: 4.8,
      price: 99.99,
      category: 'Web Development',
      level: 'Beginner'
    },
    {
      id: '2',
      title: 'Data Science & Machine Learning',
      description: 'Master data science and machine learning with Python, TensorFlow, and real-world projects.',
      instructor: {
        name: 'Sarah Smith',
        image: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      duration: '16 weeks',
      students: 856,
      rating: 4.9,
      price: 129.99,
      category: 'Data Science',
      level: 'Intermediate'
    },
    {
      id: '3',
      title: 'UI/UX Design Masterclass',
      description: 'Learn modern UI/UX design principles, tools, and techniques to create stunning interfaces.',
      instructor: {
        name: 'Mike Johnson',
        image: 'https://randomuser.me/api/portraits/men/3.jpg'
      },
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
      duration: '8 weeks',
      students: 567,
      rating: 4.7,
      price: 79.99,
      category: 'Design',
      level: 'Beginner'
    },
    {
      id: '4',
      title: 'Mobile App Development with Flutter',
      description: 'Build beautiful, natively compiled applications for mobile, web, and desktop from a single codebase.',
      instructor: {
        name: 'Emily Chen',
        image: 'https://randomuser.me/api/portraits/women/4.jpg'
      },
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c',
      duration: '10 weeks',
      students: 432,
      rating: 4.6,
      price: 89.99,
      category: 'Mobile Development',
      level: 'Intermediate'
    },
    {
      id: '5',
      title: 'Digital Marketing Strategy',
      description: 'Learn modern digital marketing strategies, SEO, social media marketing, and analytics.',
      instructor: {
        name: 'David Wilson',
        image: 'https://randomuser.me/api/portraits/men/5.jpg'
      },
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
      duration: '6 weeks',
      students: 789,
      rating: 4.5,
      price: 69.99,
      category: 'Business',
      level: 'Beginner'
    },
    {
      id: '6',
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns, performance optimization, and state management.',
      instructor: {
        name: 'Alex Brown',
        image: 'https://randomuser.me/api/portraits/men/6.jpg'
      },
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
      duration: '8 weeks',
      students: 345,
      rating: 4.9,
      price: 109.99,
      category: 'Web Development',
      level: 'Advanced'
    }
  ];

  const categories = ['All', 'Web Development', 'Data Science', 'Mobile Development', 'Design', 'Business'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Discover Your Next Learning Journey
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Explore our curated collection of courses taught by expert instructors
            </p>
            <div className="relative max-w-4xl mx-auto">
              {/* Search Bar Container */}
              <div className="relative group mb-6">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Main Search Bar */}
                <div className="relative bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
                  <div className="flex items-center p-2">
                    {/* Search Icon */}
                    <div className="pl-4 pr-3">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    {/* Search Input */}
                    <input
                      type="text"
                      placeholder="Search for courses, subjects, or instructors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 py-4 px-2 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-base font-medium min-w-0"
                    />
                    
                    {/* Clear Button */}
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Search Button */}
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ml-2 mr-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      <span className="hidden sm:inline">Search</span>
                      <Search className="h-5 w-5 sm:hidden" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Subject Filter Bubbles */}
              <div className="mt-4">
                <SubjectBubbles
                  onSubjectClick={(subjectName) => {
                    // Toggle behavior: if same subject is already in search, clear it
                    if (searchQuery === subjectName) {
                      setSearchQuery('');
                    } else {
                      setSearchQuery(subjectName);
                    }
                  }}
                  maxSubjects={0}
                  variant="hero"
                  className="mb-3"
                  showPopular={true}
                  popularSubjects={['Mathematics', 'Programming', 'Language', 'Science']}
                  selectedSubjectName={searchQuery}
                />
                <CourseFilterBubbles
                  onFilterClick={(filterType, value) => {
                    if (filterType === 'level') {
                      // Toggle behavior: if Beginner is already selected, clear it
                      if (selectedLevel === value) {
                        setSelectedLevel('All');
                      } else {
                        setSelectedLevel(value);
                      }
                    }
                  }}
                  selectedLevel={selectedLevel}
                  className="mt-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </div>

          <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-blue-600">
                  Rs. {course.price}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={course.instructor.image}
                    alt={course.instructor.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-sm text-gray-600">Instructor</p>
                    <p className="font-medium">{course.instructor.name}</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {course.students} students
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400" />
                    {course.rating}
                  </div>
                </div>

                <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage; 