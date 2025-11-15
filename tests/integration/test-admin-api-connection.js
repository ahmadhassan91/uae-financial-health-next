/**
 * Test script to verify admin API connection and authentication
 */

const fetch = require('node-fetch');

async function testAdminAPIConnection() {
    console.log('🧪 Testing Admin API Connection...\n');
    
    const backendUrl = 'http://localhost:8000';
    
    // Step 1: Test admin login
    console.log('1. 🔐 Testing Admin Login');
    console.log('-'.repeat(40));
    
    const loginData = {
        username: 'admin',
        password: 'admin123'
    };
    
    let adminToken = null;
    
    try {
        const loginResponse = await fetch(`${backendUrl}/auth/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        console.log(`Login status: ${loginResponse.status}`);
        
        if (loginResponse.ok) {
            const loginResult = await loginResponse.json();
            adminToken = loginResult.access_token;
            console.log('✅ Admin login successful');
            console.log(`   Token: ${adminToken ? adminToken.substring(0, 20) + '...' : 'No token'}`);
        } else {
            const errorText = await loginResponse.text();
            console.log(`❌ Admin login failed: ${errorText}`);
            console.log('   Make sure admin user exists. Run: python backend/create_admin_user.py');
            return false;
        }
    } catch (error) {
        console.log(`❌ Login error: ${error.message}`);
        console.log('   Make sure backend server is running on port 8000');
        return false;
    }
    
    if (!adminToken) {
        console.log('❌ No admin token obtained');
        return false;
    }
    
    // Step 2: Test admin submissions endpoint
    console.log('\n2. 📊 Testing Admin Submissions Endpoint');
    console.log('-'.repeat(40));
    
    try {
        const submissionsResponse = await fetch(`${backendUrl}/api/admin/simple/survey-submissions?limit=10`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
            },
        });
        
        console.log(`Submissions endpoint status: ${submissionsResponse.status}`);
        
        if (submissionsResponse.ok) {
            const submissionsData = await submissionsResponse.json();
            console.log('✅ Admin submissions endpoint working');
            console.log(`   Total submissions: ${submissionsData.total}`);
            console.log(`   Retrieved: ${submissionsData.submissions.length}`);
            
            if (submissionsData.submissions.length > 0) {
                const sample = submissionsData.submissions[0];
                console.log(`   Sample submission:`);
                console.log(`     ID: ${sample.id}`);
                console.log(`     User Type: ${sample.user_type}`);
                console.log(`     Score: ${sample.overall_score}`);
                console.log(`     Created: ${sample.created_at}`);
            }
        } else {
            const errorText = await submissionsResponse.text();
            console.log(`❌ Submissions endpoint failed: ${errorText}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Submissions endpoint error: ${error.message}`);
        return false;
    }
    
    // Step 3: Test admin analytics endpoint
    console.log('\n3. 📈 Testing Admin Analytics Endpoint');
    console.log('-'.repeat(40));
    
    try {
        const analyticsResponse = await fetch(`${backendUrl}/api/admin/simple/survey-analytics`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
            },
        });
        
        console.log(`Analytics endpoint status: ${analyticsResponse.status}`);
        
        if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            console.log('✅ Admin analytics endpoint working');
            console.log(`   Total submissions: ${analyticsData.total_submissions}`);
            console.log(`   Guest submissions: ${analyticsData.guest_submissions}`);
            console.log(`   Auth submissions: ${analyticsData.authenticated_submissions}`);
            console.log(`   Recent (30d): ${analyticsData.recent_submissions_30d}`);
            
            const avgScores = analyticsData.average_scores;
            console.log(`   Average overall score: ${avgScores.overall.toFixed(1)}`);
        } else {
            const errorText = await analyticsResponse.text();
            console.log(`❌ Analytics endpoint failed: ${errorText}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Analytics endpoint error: ${error.message}`);
        return false;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL ADMIN API TESTS PASSED!');
    console.log('='.repeat(50));
    console.log('✅ Admin login working');
    console.log('✅ Admin submissions endpoint working');
    console.log('✅ Admin analytics endpoint working');
    console.log('✅ Authentication properly implemented');
    
    console.log('\n📋 Frontend should now work with these endpoints');
    console.log('   The admin dashboard should load submission data');
    
    return true;
}

async function testFrontendConnection() {
    console.log('\n🖥️  Testing Frontend Connection');
    console.log('-'.repeat(40));
    
    try {
        const frontendResponse = await fetch('http://localhost:3000/admin');
        console.log(`Frontend admin page status: ${frontendResponse.status}`);
        
        if (frontendResponse.ok) {
            console.log('✅ Frontend admin page accessible');
        } else {
            console.log('❌ Frontend admin page not accessible');
        }
    } catch (error) {
        console.log(`❌ Frontend connection error: ${error.message}`);
        console.log('   Make sure frontend server is running on port 3000');
    }
}

// Run the tests
if (require.main === module) {
    testAdminAPIConnection()
        .then(success => {
            if (success) {
                return testFrontendConnection();
            }
        })
        .then(() => {
            console.log('\n🎯 Next Steps:');
            console.log('1. Ensure both frontend (3000) and backend (8000) servers are running');
            console.log('2. Login to admin panel at http://localhost:3000/admin');
            console.log('3. Check browser console for any remaining errors');
            console.log('4. Verify submissions appear in the dashboard');
        })
        .catch(error => {
            console.error('Test failed:', error);
        });
}

module.exports = { testAdminAPIConnection };