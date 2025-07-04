const express = require('express');
const app = express();
const PORT = 4000;
app.use(express.json());

const db = require('./firebase.cjs');

app.get('/api/auth/users', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => doc.data());
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const usersSnapshot = await db.collection('users')
      .where('username', '==', username)
      .where('password', '==', password)
      .get();

    if (!usersSnapshot.empty) {
      const user = usersSnapshot.docs[0].data();
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { username, password, role, name, department } = req.body;
  if (!department) {
    return res.status(400).json({ success: false, message: 'Department is required' });
  }
  try {
    // Check if username already exists
    const existingUserSnapshot = await db.collection('users').where('username', '==', username).get();
    if (!existingUserSnapshot.empty) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      role,
      name,
      department
    };
    await db.collection('users').doc(newUser.id).set(newUser);
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.params.id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await userRef.update(req.body);
    const updatedUser = (await userRef.get()).data();
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.params.id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (userDoc.data().role === 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete Super Admin user' });
    }
    await userRef.delete();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
});

app.get('/api/members', async (req, res) => {
  try {
    const membersSnapshot = await db.collection('members').get();
    const members = membersSnapshot.docs.map(doc => doc.data());
    res.json(members);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch members', error: error.message });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const newMember = { ...req.body, id: Date.now().toString() };
    await db.collection('members').doc(newMember.id).set(newMember);
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create member', error: error.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projectsSnapshot = await db.collection('projects').get();
    const projects = projectsSnapshot.docs.map(doc => doc.data());
    res.json(projects);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects', error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const newProject = { ...req.body, id: Date.now().toString() };
    await db.collection('projects').doc(newProject.id).set(newProject);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create project', error: error.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const projectRef = db.collection('projects').doc(req.params.id);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    await projectRef.update(req.body);
    const updatedProject = (await projectRef.get()).data();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update project', error: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const projectRef = db.collection('projects').doc(req.params.id);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    await projectRef.delete();
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete project', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});