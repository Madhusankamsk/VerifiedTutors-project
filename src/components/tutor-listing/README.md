# Tutor Listing Components

This directory contains the modular components that make up the Tutor Listing Page. Each component is designed to be reusable, maintainable, and follows best practices for React development.

## Component Structure

### Core Components

#### `BreadcrumbNav.tsx`
- **Purpose**: Navigation breadcrumb for the page
- **Props**: `currentPage`, `parentPage`, `parentPath`
- **Features**: Responsive design, accessible navigation

#### `PageHeader.tsx`
- **Purpose**: Page title, description, and search functionality
- **Props**: `title`, `description`, `searchQuery`, `onSearchChange`, `onSearchSubmit`, `onSearchClear`, `placeholder`
- **Features**: Responsive layout, search with clear functionality, keyboard support

#### `ResultsHeader.tsx`
- **Purpose**: Display results count and sorting options
- **Props**: `loading`, `tutorCount`, `activeFiltersCount`, `sortBy`, `sortOrder`, `onSortChange`
- **Features**: Dynamic count display, sort dropdown, filter count indicator

#### `TutorGrid.tsx`
- **Purpose**: Display tutors in a responsive grid layout
- **Props**: `tutors`, `loading`, `loadingMore`, `hasMore`, `onLoadMore`, `observerTarget`
- **Features**: Loading states, infinite scroll support, responsive grid

#### `EmptyState.tsx`
- **Purpose**: Display when no tutors are found
- **Props**: `title`, `description`, `onResetFilters`, `showResetButton`
- **Features**: Customizable messaging, reset functionality

#### `ErrorState.tsx`
- **Purpose**: Display error states with retry functionality
- **Props**: `error`, `onRetry`, `title`
- **Features**: Error messaging, retry button, consistent styling

#### `BackgroundDecorations.tsx`
- **Purpose**: Visual background effects and decorations
- **Props**: None
- **Features**: Animated background elements, grid pattern

## Usage

### Importing Components

```typescript
import {
  BreadcrumbNav,
  PageHeader,
  ResultsHeader,
  TutorGrid,
  EmptyState,
  ErrorState,
  BackgroundDecorations
} from '../components/tutor-listing';
```

### Example Implementation

```typescript
const TutorListingPage: React.FC = () => {
  // ... state and logic

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <BackgroundDecorations />
      <BreadcrumbNav currentPage="Tutors" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <PageHeader
          title="Find Your Perfect Tutor"
          description="Discover qualified tutors in your area or online"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
        />
        
        <ResultsHeader
          loading={loading}
          tutorCount={tutors.length}
          activeFiltersCount={activeFilters.length}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSortChange={handleSortChange}
        />
        
        {!loading && tutors.length === 0 ? (
          <EmptyState onResetFilters={resetFilters} />
        ) : (
          <TutorGrid
            tutors={transformedTutors}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            observerTarget={observerTarget}
          />
        )}
      </div>
    </div>
  );
};
```

## Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be used in other parts of the application
3. **Maintainability**: Easier to update and debug individual components
4. **Testability**: Each component can be tested in isolation
5. **Performance**: Components can be optimized individually
6. **Accessibility**: Each component can be made accessible independently

## Styling

All components use Tailwind CSS classes and follow the design system established in the project. The components are responsive and work well on all screen sizes.

## TypeScript

All components are written in TypeScript with proper type definitions for props and interfaces. This ensures type safety and better developer experience. 