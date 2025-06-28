# Tutor Profile Components

This directory contains the modular components that make up the Tutor Profile page. The original large component has been broken down into smaller, reusable components for better maintainability and cleaner code.

## Component Structure

### Core Components

1. **TutorProfileBackground** - Provides the background with decorative elements and grid pattern
2. **TutorProfileBreadcrumb** - Navigation breadcrumb for the page
3. **TutorProfileHeader** - Main profile header with image, name, rating, and basic info
4. **TutorProfileTabs** - Tab navigation with action buttons (Book Session, Write Review)

### Content Components

5. **TutorProfileAbout** - About section with bio, teaching mediums, locations, and social media
6. **TutorProfileSubjects** - Subjects and rates display
7. **TutorProfileEducation** - Education history section
8. **TutorProfileExperience** - Work experience section

### Sidebar Components

9. **TutorProfileSidebar** - Sidebar with contact info, quick stats, and verification status

### Modal Components

10. **TutorReviewForm** - Review submission modal

## Benefits of This Structure

1. **Maintainability** - Each component has a single responsibility
2. **Reusability** - Components can be reused in other parts of the application
3. **Testability** - Smaller components are easier to test individually
4. **Performance** - Components can be optimized independently
5. **Code Organization** - Clear separation of concerns
6. **Developer Experience** - Easier to understand and modify individual parts 