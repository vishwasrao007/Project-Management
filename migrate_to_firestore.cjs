const admin = require('firebase-admin');
const fs = require('fs');

// Load your Firebase service account key
const serviceAccount = require('./firebaseServiceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Read users.json (object with 'users' array)
const usersData = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
const users = usersData.users || [];

// Read db.json (object with 'projects' and 'members' arrays)
const dbData = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
const projects = dbData.projects || [];
const members = dbData.members || [];

// Migrate users
async function migrateUsers() {
  for (const user of users) {
    await db.collection('users').doc(user.id ? String(user.id) : undefined).set(user);
  }
  console.log('Users migrated!');
}

// Migrate projects
async function migrateProjects() {
  for (const project of projects) {
    await db.collection('projects').doc(project.id ? String(project.id) : undefined).set(project);
  }
  console.log('Projects migrated!');
}

// Migrate members
async function migrateMembers() {
  for (const member of members) {
    await db.collection('members').doc(member.id ? String(member.id) : undefined).set(member);
  }
  console.log('Members migrated!');
}

async function main() {
  await migrateUsers();
  await migrateProjects();
  if (members.length > 0) {
    await migrateMembers();
  }
  console.log('Migration complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});