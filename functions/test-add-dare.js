const admin = require('firebase-admin');

// Use project as demo-no-project for emulator
const app = admin.initializeApp({
  projectId: 'demo-no-project'
});

const db = app.firestore();

async function addDare() {
  try {
    const docRef = await db.collection('dares').add({
      title: "Do 20 push-ups",
      description: "Film yourself doing 20 clean push-ups",
      rewardStone: 20,
      creatorId: "mockUser",
      status: "active"
    });
    console.log('Added dare with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding dare: ', error);
  }
}

addDare();
