// Simple test script to verify Firebase jobs integration
// Run with: node scripts/test-jobs.js

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: "https://devhatch-ca252-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function testJobsConnection() {
  try {
    console.log('🔥 Testing Firebase Jobs Integration...\n');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    
    // Test connection
    const jobsRef = ref(database, 'jobPostings');
    const snapshot = await get(jobsRef);
    
    if (snapshot.exists()) {
      const jobs = snapshot.val();
      const jobsArray = Object.values(jobs);
      
      console.log(`✅ Successfully connected to Firebase!`);
      console.log(`📊 Found ${jobsArray.length} job postings in database\n`);
      
      // Display job summaries
      jobsArray.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title}`);
        console.log(`   Project: ${job.project}`);
        console.log(`   Status: ${job.isActive ? 'Active' : 'Inactive'}`);
        console.log(`   Slots: ${job.filledSlots}/${job.availableSlots}`);
        console.log(`   Created: ${new Date(job.createdAt).toLocaleDateString()}\n`);
      });
      
    } else {
      console.log('⚠️  No job postings found in database');
      console.log('💡 You may need to run the seed script first');
    }
    
  } catch (error) {
    console.error('❌ Error testing Firebase connection:', error.message);
    
    if (error.code === 'PERMISSION_DENIED') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check your Firebase Realtime Database rules');
      console.log('2. Ensure your Firebase config is correct');
      console.log('3. Verify your environment variables are set');
    }
  }
}

// Run the test
testJobsConnection(); 