import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TutorProvider } from './contexts/TutorContext';
import { AdminProvider } from './contexts/AdminContext';
import { LocationProvider } from './contexts/LocationContext';
import { SubjectProvider } from './contexts/SubjectContext';
import { BlogProvider } from './contexts/BlogContext';
import { RatingProvider } from './contexts/RatingContext';
import { StudentProvider } from './contexts/StudentContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import RoleRoute from './components/common/RoleRoute';
import ScrollToTop from './components/common/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import TutorLayout from './layouts/TutorLayout';
import StudentLayout from './layouts/StudentLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import TutorListingPage from './pages/TutorListingPage';
import TutorProfilePage from './pages/TutorProfilePage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import NotFoundPage from './pages/NotFoundPage';
import CoursesPage from './pages/CoursesPage';
import AuthCallback from './pages/auth/AuthCallback';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTutors from './pages/admin/ManageTutors';
import ManageSubjects from './pages/admin/ManageSubjects';
import ManageLocations from './pages/admin/ManageLocations';
import ManageBookings from './pages/admin/ManageBookings';

// Tutor Pages
import TutorDashboard from './pages/tutor/TutorDashboard';
import EditTutorProfile from './pages/tutor/EditTutorProfile';
import ManageBlogs from './pages/tutor/ManageBlogs';
import CreateEditBlog from './pages/tutor/CreateEditBlog';
import TutorBookings from './pages/tutor/TutorBookings';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentBookings from './pages/student/StudentBookings';
import FavoriteTutors from './pages/student/FavoriteTutors';

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <AuthProvider>
        <LocationProvider>
          <SubjectProvider>
            <TutorProvider>
              <AdminProvider>
                <BlogProvider>
                  <RatingProvider>
                    <StudentProvider>
                      <Toaster position="top-right" />
                      <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                      />
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<MainLayout />}>
                          <Route index element={<HomePage />} />
                          <Route path="login" element={
                            <PublicRoute>
                              <LoginPage />
                            </PublicRoute>
                          } />
                          <Route path="register" element={
                            <PublicRoute>
                              <RegisterPage />
                            </PublicRoute>
                          } />
                          <Route path="tutors" element={<TutorListingPage />} />
                          <Route path="tutors/:id" element={<TutorProfilePage />} />
                          {/* <Route path="courses" element={<CoursesPage />} />
                          <Route path="blogs" element={<BlogListPage />} />
                          <Route path="blogs/:id" element={<BlogPostPage />} /> */}
                        </Route>

                        {/* Admin Routes */}
                        <Route 
                          path="/admin" 
                          element={
                            <RoleRoute role="admin">
                              <AdminLayout />
                            </RoleRoute>
                          }
                        >
                          <Route index element={<Navigate to="/admin/dashboard" replace />} />
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="tutors" element={<ManageTutors />} />
                          <Route path="subjects" element={<ManageSubjects />} />
                          <Route path="locations" element={<ManageLocations />} />
                          <Route path="bookings" element={<ManageBookings />} />
                        </Route>

                        {/* Tutor Routes */}
                        <Route 
                          path="/tutor" 
                          element={
                            <RoleRoute role="tutor">
                              <TutorLayout />
                            </RoleRoute>
                          }
                        >
                          <Route index element={<Navigate to="/tutor/dashboard" replace />} />
                          <Route path="dashboard" element={<TutorDashboard />} />
                          <Route path="profile" element={<EditTutorProfile />} />
                          <Route path="bookings" element={<TutorBookings />} />
                          <Route path="blogs" element={<ManageBlogs />} />
                          {/* <Route path="blogs/create" element={<CreateEditBlog />} />
                          <Route path="blogs/edit/:id" element={<CreateEditBlog />} /> */}
                        </Route>

                        {/* Student Routes */}
                        <Route 
                          path="/student" 
                          element={
                            <RoleRoute role="student">
                              <StudentLayout />
                            </RoleRoute>
                          }
                        >
                          <Route index element={<Navigate to="/student/dashboard" replace />} />
                          <Route path="dashboard" element={<StudentDashboard />} />
                          <Route path="bookings" element={<StudentBookings />} />
                          <Route path="favorites" element={<FavoriteTutors />} />
                        </Route>

                        {/* Auth Callback Route */}
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* 404 Route */}
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </StudentProvider>
                  </RatingProvider>
                </BlogProvider>
              </AdminProvider>
            </TutorProvider>
          </SubjectProvider>
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;