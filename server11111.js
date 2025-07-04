import express from 'express';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 4000;
const DB_FILE = './db.json';
const USERS_FILE = './users.json';

app.use(cors());
app.use(express.json());

// Helper functions
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ members: [], projects: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// --- AUTHENTICATION ENDPOINTS ---

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  
  const user = users.users.find(u => 
    u.username === username && u.password === password
  );
  
  if (user) {
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }
});

app.get('/api/auth/users', (req, res) => {
  const users = readUsers();
  res.json(users.users);
});

// --- USER MANAGEMENT ENDPOINTS (Super Admin Only) ---

app.post('/api/users', (req, res) => {
  const { username, password, role, name, department } = req.body;
  if (!department) {
    return res.status(400).json({ success: false, message: 'Department is required' });
  }
  const users = readUsers();
  
  // Check if username already exists
  const existingUser = users.users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Username already exists'
    });
  }
  
  const newUser = {
    id: Date.now().toString(),
    username,
    password,
    role,
    name,
    department
  };
  
  users.users.push(newUser);
  writeUsers(users);
  
  res.status(201).json({
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      name: newUser.name
    }
  });
});

app.put('/api/users/:id', (req, res) => {
  const { username, password, role, name, department } = req.body;
  if (!department) {
    return res.status(400).json({ success: false, message: 'Department is required' });
  }
  const users = readUsers();
  
  const userIndex = users.users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Check if username already exists (excluding current user)
  const existingUser = users.users.find(u => u.username === username && u.id !== req.params.id);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Username already exists'
    });
  }
  
  users.users[userIndex] = {
    ...users.users[userIndex],
    username: username || users.users[userIndex].username,
    password: password || users.users[userIndex].password,
    role: role || users.users[userIndex].role,
    name: name || users.users[userIndex].name,
    department: department || users.users[userIndex].department
  };
  
  writeUsers(users);
  
  res.json({
    success: true,
    user: {
      id: users.users[userIndex].id,
      username: users.users[userIndex].username,
      role: users.users[userIndex].role,
      name: users.users[userIndex].name
    }
  });
});

app.delete('/api/users/:id', (req, res) => {
  const users = readUsers();
  
  const userIndex = users.users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Prevent deleting super admin
  if (users.users[userIndex].role === 'Super Admin') {
    return res.status(403).json({
      success: false,
      message: 'Cannot delete Super Admin user'
    });
  }
  
  users.users.splice(userIndex, 1);
  writeUsers(users);
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// --- MEMBERS ENDPOINTS ---

app.get('/api/members', (req, res) => {
  const db = readDB();
  res.json(db.members);
});

app.post('/api/members', (req, res) => {
  const db = readDB();
  const newMember = { ...req.body, id: Date.now().toString() };
  db.members.push(newMember);
  writeDB(db);
  res.status(201).json(newMember);
});

app.put('/api/members/:id', (req, res) => {
  const db = readDB();
  const idx = db.members.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Member not found' });
  db.members[idx] = { ...db.members[idx], ...req.body };
  writeDB(db);
  res.json(db.members[idx]);
});

app.delete('/api/members/:id', (req, res) => {
  const db = readDB();
  db.members = db.members.filter(m => m.id !== req.params.id);
  writeDB(db);
  res.status(204).end();
});

// --- PROJECTS ENDPOINTS ---

app.get('/api/projects', (req, res) => {
  const db = readDB();
  res.json(db.projects);
});

app.post('/api/projects', (req, res) => {
  const db = readDB();
  const newProject = { ...req.body, id: Date.now().toString() };
  db.projects.push(newProject);
  writeDB(db);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', (req, res) => {
  const db = readDB();
  const idx = db.projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });
  db.projects[idx] = { ...db.projects[idx], ...req.body };
  writeDB(db);
  res.json(db.projects[idx]);
});

app.delete('/api/projects/:id', (req, res) => {
  const db = readDB();
  db.projects = db.projects.filter(p => p.id !== req.params.id);
  writeDB(db);
  res.status(204).end();
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`JSON API server running at http://localhost:${PORT}`);
}); 