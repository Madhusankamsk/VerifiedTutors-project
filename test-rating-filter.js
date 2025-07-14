// Test script to check rating filter functionality
const API_URL = 'http://localhost:5000/api';

async function testRatingFilter() {
  try {
    console.log('Testing rating filter...');
    
    // Test 1: Get all tutors without rating filter
    console.log('\n1. Getting all tutors without rating filter...');
    const allTutorsResponse = await fetch(`${API_URL}/tutors?limit=10`);
    const allTutors = await allTutorsResponse.json();
    
    console.log(`Total tutors returned: ${allTutors.tutors.length}`);
    console.log('Tutor ratings:', allTutors.tutors.map(t => ({
      name: t.user?.name,
      rating: t.rating,
      totalReviews: t.totalReviews
    })));
    
    // Test 2: Get tutors with rating filter >= 4.0
    console.log('\n2. Getting tutors with rating >= 4.0...');
    const filteredResponse = await fetch(`${API_URL}/tutors?minRating=4.0&limit=10`);
    const filteredTutors = await filteredResponse.json();
    
    console.log(`Filtered tutors returned: ${filteredTutors.tutors.length}`);
    console.log('Filtered tutor ratings:', filteredTutors.tutors.map(t => ({
      name: t.user?.name,
      rating: t.rating,
      totalReviews: t.totalReviews
    })));
    
    // Test 3: Check if any tutors have ratings > 0
    const tutorsWithRatings = allTutors.tutors.filter(t => t.rating > 0);
    console.log(`\n3. Tutors with ratings > 0: ${tutorsWithRatings.length}`);
    
    if (tutorsWithRatings.length === 0) {
      console.log('❌ No tutors have ratings > 0. This is why the filter is not working.');
      console.log('💡 You need to add some ratings to tutors first.');
    } else {
      console.log('✅ Found tutors with ratings. Filter should work.');
    }
    
  } catch (error) {
    console.error('Error testing rating filter:', error);
  }
}

// Run the test
testRatingFilter(); 