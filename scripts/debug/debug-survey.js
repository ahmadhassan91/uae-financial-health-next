// Simple debug script to test survey submission
const API_BASE_URL = 'http://localhost:8000';

async function testSurveySubmission() {
  console.log('Testing survey submission...');
  
  // Test guest survey submission
  const guestData = {
    responses: {
      'Q1': 3,
      'Q2': 4,
      'Q3': 2,
      'Q4': 5,
      'Q5': 3
    },
    completion_time: 120
  };
  
  try {
    console.log('Testing guest survey endpoint...');
    const response = await fetch(`${API_BASE_URL}/surveys/submit-guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guestData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    } else {
      const result = await response.json();
      console.log('Success! Result keys:', Object.keys(result));
      console.log('Score breakdown:', result.score_breakdown);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
  }
}

testSurveySubmission();