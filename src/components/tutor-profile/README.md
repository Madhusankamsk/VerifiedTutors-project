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

# EditTutorProfile Components

This directory contains the refactored components for the EditTutorProfile page. The original monolithic component has been broken down into smaller, reusable components with proper TypeScript interfaces.

## Components

### EditTutorProfileHeader
- **Purpose**: Header section with title and floating action bar for save/discard functionality
- **Props**: `hasChanges`, `onDiscard`, `onSave`, `isSubmitting`
- **Features**: 
  - Page title
  - Floating action bar with save/discard buttons
  - Visual indicator for unsaved changes
  - Responsive design

### EditTutorProfileBasicInfo
- **Purpose**: Basic information section including profile picture and personal details
- **Props**: `data`, `profileImage`, `isUploading`, `onDataChange`, `onProfileImageUpload`
- **Features**:
  - Profile picture upload with preview
  - Phone number and gender selection
  - Social media links (Instagram, YouTube, Facebook, LinkedIn)
  - Teaching mediums selection
  - Bio text area

### EditTutorProfileEducation
- **Purpose**: Education section with add/edit/remove functionality
- **Props**: `education`, `onEducationChange`
- **Features**:
  - Dynamic education entries
  - Degree, institution, and year fields
  - Add/remove education entries
  - Proper TypeScript interfaces

### EditTutorProfileExperience
- **Purpose**: Experience section with add/edit/remove functionality
- **Props**: `experience`, `onExperienceChange`
- **Features**:
  - Dynamic experience entries
  - Title, company, duration, and description fields
  - Add/remove experience entries
  - Proper TypeScript interfaces

### EditTutorProfileDocuments
- **Purpose**: Document upload and management section
- **Props**: `documents`, `selectedDocuments`, `uploading`, `onDocumentSelect`, `onDocumentUpload`, `onDeleteDocument`, `onRemoveSelectedDocument`
- **Features**:
  - File selection and preview
  - Document upload with progress
  - Existing document management
  - File size validation

### EditTutorProfileDiscardDialog
- **Purpose**: Confirmation dialog for discarding changes
- **Props**: `isOpen`, `onCancel`, `onConfirm`
- **Features**:
  - Modal dialog
  - Confirmation message
  - Cancel/confirm actions

## TypeScript Interfaces

### Education
```typescript
interface Education {
  degree: string;
  institution: string;
  year: number;
}
```

### Experience
```typescript
interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}
```

### Document
```typescript
interface Document {
  id: string;
  url: string;
}
```

### BasicInfoData
```typescript
interface BasicInfoData {
  phone: string;
  bio: string;
  gender: 'Male' | 'Female' | 'Other';
  socialMedia: {
    instagram: string;
    youtube: string;
    facebook: string;
    linkedin: string;
  };
  teachingMediums: string[];
}
```

## Usage

```typescript
import {
  EditTutorProfileHeader,
  EditTutorProfileBasicInfo,
  EditTutorProfileEducation,
  EditTutorProfileExperience,
  EditTutorProfileDocuments,
  EditTutorProfileDiscardDialog
} from '../components/tutor-profile';

// Use in your component
<EditTutorProfileHeader
  hasChanges={hasChanges}
  onDiscard={handleDiscard}
  onSave={handleSave}
  isSubmitting={isSubmitting}
/>
```

## Key Improvements

1. **Type Safety**: All components now have proper TypeScript interfaces
2. **Modularity**: Each section is now a separate, reusable component
3. **Maintainability**: Easier to maintain and update individual sections
4. **Reusability**: Components can be reused in other parts of the application
5. **Layout Fix**: Fixed footer overlap issue by adding proper bottom padding
6. **Performance**: Smaller components lead to better performance and easier testing

## Layout Fixes

- **Footer Overlap**: Added `pb-32` class to the main container to prevent footer overlap
- **Responsive Design**: All components are fully responsive
- **Accessibility**: Proper ARIA labels and keyboard navigation support 