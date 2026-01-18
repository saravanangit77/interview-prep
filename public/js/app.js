/**
 * Main application logic for MAANG Interview Prep Tracker
 */

// Global state
let problemsData = null;
let currentFilter = 'all';
let currentSubtopicId = null;
let currentSubtopicProblems = [];

/**
 * Initialize the application
 */
async function init() {
  try {
    // Load problems data from backend
    const response = await fetch('/api/problems');
    problemsData = await response.json();
    
    // Render sidebar navigation
    renderSidebar();
    
    // Setup event listeners
    setupEventListeners();
    
    // Apply saved settings
    applySettings();
    
    console.log('App initialized successfully!');
  } catch (error) {
    console.error('Error initializing app:', error);
    document.getElementById('problemList').innerHTML = `
      <div class="error-message">
        <h3>Error loading data</h3>
        <p>Please make sure the server is running and try refreshing the page.</p>
      </div>
    `;
  }
}

/**
 * Render sidebar navigation
 */
function renderSidebar() {
  const sidebarNav = document.getElementById('sidebarNav');
  
  if (!problemsData || !problemsData.categories) {
    sidebarNav.innerHTML = '<div class="error">Failed to load topics</div>';
    return;
  }

  let html = '';
  
  problemsData.categories.forEach(category => {
    html += `
      <div class="category-section">
        <div class="category-header">${category.name}</div>
        <div class="topics-list">
    `;
    
    category.topics.forEach(topic => {
      html += `
        <div class="topic-item">
          <div class="topic-name">${topic.name}</div>
          <div class="subtopics-list">
      `;
      
      topic.subtopics.forEach(subtopic => {
        const stats = getSubtopicStats(subtopic);
        const progressWidth = stats.total > 0 ? (stats.completed / stats.total * 100) : 0;
        
        html += `
          <div class="subtopic-item" data-subtopic-id="${subtopic.id}" data-category-id="${category.id}" data-topic-id="${topic.id}">
            <div class="subtopic-header">
              <span class="subtopic-name">${subtopic.name}</span>
              <span class="subtopic-count">${stats.completed}/${stats.total}</span>
            </div>
            <div class="subtopic-progress">
              <div class="subtopic-progress-bar" style="width: ${progressWidth}%"></div>
            </div>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  sidebarNav.innerHTML = html;
  
  // Add click listeners to subtopics
  document.querySelectorAll('.subtopic-item').forEach(item => {
    item.addEventListener('click', () => {
      const subtopicId = item.dataset.subtopicId;
      const categoryId = item.dataset.categoryId;
      const topicId = item.dataset.topicId;
      
      // Find and render the subtopic
      const subtopic = findSubtopic(categoryId, topicId, subtopicId);
      if (subtopic) {
        renderSubtopic(subtopic);
        
        // Update active state
        document.querySelectorAll('.subtopic-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });
}

/**
 * Find a subtopic by IDs
 */
function findSubtopic(categoryId, topicId, subtopicId) {
  const category = problemsData.categories.find(c => c.id === categoryId);
  if (!category) return null;
  
  const topic = category.topics.find(t => t.id === topicId);
  if (!topic) return null;
  
  return topic.subtopics.find(s => s.id === subtopicId);
}

/**
 * Get statistics for a subtopic
 */
function getSubtopicStats(subtopic) {
  const total = subtopic.problems.length;
  const completed = subtopic.problems.filter(p => {
    const progress = storageManager.getProgress(p.id);
    return progress?.completed;
  }).length;
  
  return { total, completed };
}

/**
 * Render a subtopic's problems
 */
function renderSubtopic(subtopic) {
  currentSubtopicId = subtopic.id;
  currentSubtopicProblems = subtopic.problems;
  
  // Update header
  document.getElementById('topicTitle').textContent = subtopic.name;
  
  // Show action buttons
  document.getElementById('addCustomProblemBtn').style.display = 'inline-block';
  document.getElementById('resetTopicBtn').style.display = 'inline-block';
  
  // Update stats
  const stats = getSubtopicStats(subtopic);
  document.getElementById('problemStats').style.display = 'flex';
  document.getElementById('totalProblems').textContent = stats.total;
  document.getElementById('completedProblems').textContent = stats.completed;
  document.getElementById('progressPercentage').textContent = 
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) + '%' : '0%';
  
  // Render problems
  renderProblemList(subtopic.problems);
}

/**
 * Render problem list
 */
function renderProblemList(problems) {
  const problemList = document.getElementById('problemList');
  const settings = storageManager.getSettings();
  
  // Filter problems based on current filter
  let filteredProblems = problems;
  if (currentFilter === 'completed') {
    filteredProblems = problems.filter(p => storageManager.getProgress(p.id)?.completed);
  } else if (currentFilter === 'pending') {
    filteredProblems = problems.filter(p => !storageManager.getProgress(p.id)?.completed);
  }
  
  if (filteredProblems.length === 0) {
    problemList.innerHTML = `
      <div class="empty-message">
        <p>No ${currentFilter} problems found.</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  filteredProblems.forEach(problem => {
    const progress = storageManager.getProgress(problem.id);
    const isCompleted = progress?.completed || false;
    const notes = progress?.notes || '';
    
    html += `
      <div class="problem-card ${isCompleted ? 'completed' : ''}" data-problem-id="${problem.id}">
        <div class="problem-header">
          <label class="checkbox-container">
            <input type="checkbox" class="problem-checkbox" ${isCompleted ? 'checked' : ''}>
            <span class="checkmark"></span>
          </label>
          <div class="problem-title-section">
            <h3 class="problem-title">${problem.title}</h3>
            <div class="problem-meta">
              <span class="problem-type type-${problem.type}">${formatType(problem.type)}</span>
              ${settings.showDifficulty && problem.difficulty ? 
                `<span class="problem-difficulty difficulty-${problem.difficulty}">${problem.difficulty}</span>` : ''}
              ${settings.showEstimatedTime && problem.estimatedTime ? 
                `<span class="problem-time">⏱️ ${problem.estimatedTime}min</span>` : ''}
            </div>
          </div>
          <button class="toggle-details-btn">▼</button>
        </div>
        
        <div class="problem-details" style="display: none;">
          <div class="problem-links">
            <strong>Problem Links:</strong>
            <ul>
              ${problem.links.map(link => 
                `<li><a href="${link.url}" target="_blank" rel="noopener">${link.platform} →</a></li>`
              ).join('')}
            </ul>
          </div>
          
          <div class="problem-notes">
            <label for="notes-${problem.id}"><strong>Notes:</strong></label>
            <textarea 
              id="notes-${problem.id}" 
              class="notes-textarea" 
              placeholder="Add your notes here..."
              rows="3"
            >${notes}</textarea>
            <button class="btn-save-notes" data-problem-id="${problem.id}">Save Notes</button>
          </div>
          
          ${problem.isCustom ? 
            `<button class="btn-delete-custom" data-problem-id="${problem.id}">🗑️ Delete Custom Problem</button>` : ''}
        </div>
      </div>
    `;
  });
  
  problemList.innerHTML = html;
  
  // Add event listeners
  addProblemEventListeners();
}

/**
 * Add event listeners to problem cards
 */
function addProblemEventListeners() {
  // Checkbox toggle
  document.querySelectorAll('.problem-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const problemCard = e.target.closest('.problem-card');
      const problemId = problemCard.dataset.problemId;
      
      const isCompleted = storageManager.toggleCompletion(problemId);
      
      // If we're filtering by completed/pending, re-render the entire list
      // so items appear/disappear based on the filter
      if (currentFilter !== 'all') {
        renderProblemList(currentSubtopicProblems);
      } else {
        // Just toggle the visual state for 'all' filter
        problemCard.classList.toggle('completed', isCompleted);
      }
      
      // Refresh sidebar and stats
      updateSubtopicStats();
      renderSidebar();
    });
  });
  
  // Toggle details
  document.querySelectorAll('.toggle-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const problemCard = e.target.closest('.problem-card');
      const details = problemCard.querySelector('.problem-details');
      const isVisible = details.style.display !== 'none';
      
      details.style.display = isVisible ? 'none' : 'block';
      btn.textContent = isVisible ? '▼' : '▲';
    });
  });
  
  // Save notes
  document.querySelectorAll('.btn-save-notes').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const problemId = e.target.dataset.problemId;
      const notes = document.getElementById(`notes-${problemId}`).value;
      
      storageManager.updateNotes(problemId, notes);
      
      // Show feedback
      btn.textContent = '✓ Saved';
      setTimeout(() => {
        btn.textContent = 'Save Notes';
      }, 2000);
    });
  });
  
  // Delete custom problems
  document.querySelectorAll('.btn-delete-custom').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const problemId = e.target.dataset.problemId;
      
      if (confirm('Are you sure you want to delete this custom problem?')) {
        storageManager.deleteCustomProblem(problemId);
        
        // Remove from current list and re-render
        currentSubtopicProblems = currentSubtopicProblems.filter(p => p.id !== problemId);
        renderProblemList(currentSubtopicProblems);
        updateSubtopicStats();
      }
    });
  });
}

/**
 * Update subtopic stats display
 */
function updateSubtopicStats() {
  if (!currentSubtopicProblems || !currentSubtopicProblems.length) return;
  
  // Get filtered problems based on current filter
  let displayedProblems = currentSubtopicProblems;
  if (currentFilter === 'completed') {
    displayedProblems = currentSubtopicProblems.filter(p => 
      storageManager.getProgress(p.id)?.completed
    );
  } else if (currentFilter === 'pending') {
    displayedProblems = currentSubtopicProblems.filter(p => 
      !storageManager.getProgress(p.id)?.completed
    );
  }
  
  const total = currentSubtopicProblems.length;
  const completed = currentSubtopicProblems.filter(p => 
    storageManager.getProgress(p.id)?.completed
  ).length;
  const displayed = displayedProblems.length;
  
  document.getElementById('totalProblems').textContent = total;
  document.getElementById('completedProblems').textContent = completed;
  document.getElementById('progressPercentage').textContent = 
    total > 0 ? Math.round((completed / total) * 100) + '%' : '0%';
}

/**
 * Format problem type for display
 */
function formatType(type) {
  const types = {
    'solve': 'Solve',
    'read': 'Read',
    'explain': 'Explain',
    'whiteboard': 'Whiteboard',
    'design': 'Design'
  };
  return types[type] || type;
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  console.log('Setting up filter buttons:', filterButtons.length);
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const filterValue = e.target.dataset.filter;
      console.log('Filter clicked:', filterValue);
      
      currentFilter = filterValue;
      
      // Update active state
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      // Re-render problem list if a topic is selected
      if (currentSubtopicProblems && currentSubtopicProblems.length > 0) {
        console.log('Re-rendering with filter:', currentFilter);
        renderProblemList(currentSubtopicProblems);
        updateSubtopicStats();
      } else {
        console.log('No topic selected yet');
      }
    });
  });
  
  // Reset topic progress
  const resetTopicBtn = document.getElementById('resetTopicBtn');
  if (resetTopicBtn) {
    resetTopicBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset progress for this topic? This cannot be undone.')) {
        const problemIds = currentSubtopicProblems.map(p => p.id);
        storageManager.resetTopicProgress(currentSubtopicId, problemIds);
        
        // Re-render
        renderProblemList(currentSubtopicProblems);
        updateSubtopicStats();
        renderSidebar();
      }
    });
  }
  
  // Add custom problem button
  const addCustomBtn = document.getElementById('addCustomProblemBtn');
  if (addCustomBtn) {
    addCustomBtn.addEventListener('click', () => {
      document.getElementById('addProblemModal').style.display = 'flex';
    });
  }
}

/**
 * Apply saved settings to UI
 */
function applySettings() {
  const settings = storageManager.getSettings();
  
  // Apply dark mode
  if (settings.darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  
  // Other settings are already checked in renderProblemList
}

/**
 * Initialize the app when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

