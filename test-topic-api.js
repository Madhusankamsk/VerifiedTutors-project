const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';
const TEST_TOKEN = 'your_test_token_here'; // Replace with actual admin token

async function testTopicAPI() {
  console.log('🧪 Testing Topic API Endpoints...\n');

  try {
    // Test 1: Get all topics (public)
    console.log('1. Testing GET /api/topics (public)...');
    const topicsResponse = await fetch(`${API_BASE}/topics`);
    console.log(`   Status: ${topicsResponse.status}`);
    if (topicsResponse.ok) {
      const topics = await topicsResponse.json();
      console.log(`   Found ${topics.length} topics`);
    } else {
      console.log(`   Error: ${await topicsResponse.text()}`);
    }

    // Test 2: Get topics by subject (public)
    console.log('\n2. Testing GET /api/topics/subject/:subjectId (public)...');
    const subjectTopicsResponse = await fetch(`${API_BASE}/topics/subject/64f8b2c1a2b3c4d5e6f7g8h9`);
    console.log(`   Status: ${subjectTopicsResponse.status}`);
    if (subjectTopicsResponse.ok) {
      const subjectTopics = await subjectTopicsResponse.json();
      console.log(`   Found ${subjectTopics.length} topics for subject`);
    } else {
      console.log(`   Error: ${await subjectTopicsResponse.text()}`);
    }

    // Test 3: Create topic (admin only)
    console.log('\n3. Testing POST /api/topics (admin only)...');
    const createResponse = await fetch(`${API_BASE}/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        name: 'Test Topic',
        description: 'This is a test topic',
        subject: '64f8b2c1a2b3c4d5e6f7g8h9'
      })
    });
    console.log(`   Status: ${createResponse.status}`);
    if (createResponse.ok) {
      const newTopic = await createResponse.json();
      console.log(`   Created topic: ${newTopic.name}`);
    } else {
      console.log(`   Error: ${await createResponse.text()}`);
    }

    // Test 4: Update topic (admin only)
    console.log('\n4. Testing PUT /api/topics/:id (admin only)...');
    const updateResponse = await fetch(`${API_BASE}/topics/64f8b2c1a2b3c4d5e6f7g8h9`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        name: 'Updated Test Topic',
        description: 'This is an updated test topic'
      })
    });
    console.log(`   Status: ${updateResponse.status}`);
    if (updateResponse.ok) {
      const updatedTopic = await updateResponse.json();
      console.log(`   Updated topic: ${updatedTopic.name}`);
    } else {
      console.log(`   Error: ${await updateResponse.text()}`);
    }

    // Test 5: Delete topic (admin only)
    console.log('\n5. Testing DELETE /api/topics/:id (admin only)...');
    const deleteResponse = await fetch(`${API_BASE}/topics/64f8b2c1a2b3c4d5e6f7g8h9`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    console.log(`   Status: ${deleteResponse.status}`);
    if (deleteResponse.ok) {
      console.log('   Topic deleted successfully');
    } else {
      console.log(`   Error: ${await deleteResponse.text()}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testTopicAPI(); 