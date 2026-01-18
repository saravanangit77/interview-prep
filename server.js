const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes

// Get all problems
app.get('/api/problems', (req, res) => {
  try {
    const problemsData = fs.readFileSync(path.join(__dirname, 'data', 'problems.json'), 'utf-8');
    res.json(JSON.parse(problemsData));
  } catch (error) {
    console.error('Error reading problems.json:', error);
    res.status(500).json({ error: 'Failed to load problems' });
  }
});

// Get specific problem by ID
app.get('/api/problems/:id', (req, res) => {
  try {
    const problemsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'problems.json'), 'utf-8'));
    const problemId = req.params.id;
    
    // Search through all categories, topics, subtopics to find the problem
    for (const category of problemsData.categories) {
      for (const topic of category.topics) {
        for (const subtopic of topic.subtopics) {
          const problem = subtopic.problems.find(p => p.id === problemId);
          if (problem) {
            return res.json(problem);
          }
        }
      }
    }
    
    res.status(404).json({ error: 'Problem not found' });
  } catch (error) {
    console.error('Error reading problems.json:', error);
    res.status(500).json({ error: 'Failed to load problem' });
  }
});

// Get topics tree for sidebar
app.get('/api/topics', (req, res) => {
  try {
    const problemsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'problems.json'), 'utf-8'));
    
    // Build simplified topics tree
    const topicsTree = problemsData.categories.map(category => ({
      id: category.id,
      name: category.name,
      topics: category.topics.map(topic => ({
        id: topic.id,
        name: topic.name,
        subtopics: topic.subtopics.map(subtopic => ({
          id: subtopic.id,
          name: subtopic.name,
          problemCount: subtopic.problems.length
        }))
      }))
    }));
    
    res.json(topicsTree);
  } catch (error) {
    console.error('Error reading problems.json:', error);
    res.status(500).json({ error: 'Failed to load topics' });
  }
});

// Get user progress
app.get('/api/progress', (req, res) => {
  try {
    const progressPath = path.join(__dirname, 'data', 'user-progress.json');
    
    // Create file with default data if it doesn't exist
    if (!fs.existsSync(progressPath)) {
      const defaultData = {
        progress: {},
        settings: {
          darkMode: false,
          showDifficulty: false,
          showEstimatedTime: false
        },
        customProblems: [],
        lastUpdated: null
      };
      fs.writeFileSync(progressPath, JSON.stringify(defaultData, null, 2));
      return res.json(defaultData);
    }
    
    const progressData = fs.readFileSync(progressPath, 'utf-8');
    res.json(JSON.parse(progressData));
  } catch (error) {
    console.error('Error reading user-progress.json:', error);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

// Save user progress
app.post('/api/progress', (req, res) => {
  try {
    const progressPath = path.join(__dirname, 'data', 'user-progress.json');
    const userData = req.body;
    
    // Add lastUpdated timestamp
    userData.lastUpdated = new Date().toISOString();
    
    // Write to file
    fs.writeFileSync(progressPath, JSON.stringify(userData, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Progress saved successfully',
      lastUpdated: userData.lastUpdated
    });
  } catch (error) {
    console.error('Error writing user-progress.json:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 MAANG Interview Prep Tracker is running!`);
  console.log(`📍 Open your browser to: http://localhost:${PORT}`);
  console.log(`\n✨ Start tracking your interview preparation progress!\n`);
});

