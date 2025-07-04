const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./firebaseServiceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Read users.json
let users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
if (!Array.isArray(users) && users.users) {
  users = users.users;
}

  {
    "users": [
      { "id": "1", "username": "admin", ... },
      { "id": "2", "username": "user", ... }
    ]
  } 