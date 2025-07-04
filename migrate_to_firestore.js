import { db } from './firebase.js';
import { setDoc, doc } from 'firebase/firestore';
import usersData from './users.json' assert { type: 'json' };
import dbData from './db.json' assert { type: 'json' };

async function importUsers() {
  const users = usersData.users;
  for (const user of users) {
    await setDoc(doc(db, 'users', user.id), user);
    console.log('Imported user:', user.username);
  }
}

async function importProjects() {
  const projects = dbData.projects;
  for (const project of projects) {
    // Use project.id as Firestore doc ID if available, else Firestore will auto-generate
    await setDoc(doc(db, 'projects', project.id), project);
    console.log('Imported project:', project.name);
  }
}

async function main() {
  await importUsers();
  await importProjects();
  console.log('All data imported!');
}

main().catch(console.error);