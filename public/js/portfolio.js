/**
 * Portfolio page logic for MAANG Interview Prep Tracker
 */

let problemsData = null;

/**
 * Initialize the portfolio page
 */
async function initPortfolio() {
  try {
    // Apply dark mode from settings
    const settings = storageManager.getSettings();
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
    }
    
    // Load problems data
    const response = await fetch('/api/problems');
    problemsData = await response.json();
    
    // Calculate and render all statistics
    renderOverallStats();
    renderCategoryStats();
    renderTopicStats();
    renderRecentActivity();
    renderDifficultyStats();
    renderTypeStats();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('Portfolio initialized successfully!');
  } catch (error) {
    console.error('Error initializing portfolio:', error);
    document.querySelector('.portfolio-container').innerHTML = `
      <div class="error-message">
        <h3>Error loading portfolio data</h3>
        <p>Please make sure the server is running and try refreshing the page.</p>
      </div>
    `;
  }
}

/**
 * Render overall statistics
 */
function renderOverallStats() {
  const allProblems = getAllProblems();
  const completedProblems = allProblems.filter(p => {
    const progress = storageManager.getProgress(p.id);
    return progress?.completed;
  });
  
  const totalCompleted = completedProblems.length;
  const totalProblems = allProblems.length;
  const percentage = totalProblems > 0 
    ? Math.round((totalCompleted / totalProblems) * 100) 
    : 0;
  
  // Calculate active days (unique dates with completions)
  const completionDates = new Set(
    completedProblems
      .map(p => storageManager.getProgress(p.id)?.completedAt)
      .filter(date => date)
      .map(date => new Date(date).toDateString())
  );
  
  document.getElementById('totalCompleted').textContent = totalCompleted;
  document.getElementById('totalProblems').textContent = totalProblems;
  document.getElementById('overallPercentage').textContent = `${percentage}%`;
  document.getElementById('streakDays').textContent = completionDates.size;
}

/**
 * Render category-wise statistics
 */
function renderCategoryStats() {
  const categoryStats = document.getElementById('categoryStats');
  let html = '';
  
  problemsData.categories.forEach(category => {
    const categoryProblems = getCategoryProblems(category);
    const completed = categoryProblems.filter(p => 
      storageManager.getProgress(p.id)?.completed
    ).length;
    const total = categoryProblems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    html += `
      <div class="category-stat-card">
        <div class="category-stat-header">
          <h3>${category.name}</h3>
          <span class="category-stat-count">${completed}/${total}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${percentage}%"></div>
        </div>
        <div class="category-stat-percentage">${percentage}%</div>
      </div>
    `;
  });
  
  categoryStats.innerHTML = html;
}

/**
 * Render topic-wise statistics
 */
function renderTopicStats() {
  const topicStats = document.getElementById('topicStats');
  let html = '';
  
  problemsData.categories.forEach(category => {
    category.topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        const completed = subtopic.problems.filter(p => 
          storageManager.getProgress(p.id)?.completed
        ).length;
        const total = subtopic.problems.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        html += `
          <div class="topic-stat-row">
            <div class="topic-stat-name">
              <span class="topic-stat-category">${category.name}</span>
              <span class="topic-stat-separator">›</span>
              <span class="topic-stat-topic">${topic.name}</span>
              <span class="topic-stat-separator">›</span>
              <span class="topic-stat-subtopic">${subtopic.name}</span>
            </div>
            <div class="topic-stat-progress">
              <div class="topic-stat-bar-container">
                <div class="topic-stat-bar" style="width: ${percentage}%"></div>
              </div>
              <span class="topic-stat-count">${completed}/${total}</span>
            </div>
          </div>
        `;
      });
    });
  });
  
  topicStats.innerHTML = html;
}

/**
 * Render recent activity
 */
function renderRecentActivity() {
  const activityTimeline = document.getElementById('activityTimeline');
  const allProblems = getAllProblems();
  
  // Get completed problems with dates
  const completedWithDates = allProblems
    .map(p => {
      const progress = storageManager.getProgress(p.id);
      if (progress?.completed && progress?.completedAt) {
        return {
          ...p,
          completedAt: new Date(progress.completedAt)
        };
      }
      return null;
    })
    .filter(p => p !== null)
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, 10); // Show last 10
  
  if (completedWithDates.length === 0) {
    activityTimeline.innerHTML = '<p class="empty-message">No completed problems yet. Start solving!</p>';
    return;
  }
  
  let html = '<div class="timeline">';
  
  completedWithDates.forEach(problem => {
    const date = problem.completedAt;
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
    
    html += `
      <div class="timeline-item">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-title">${problem.title}</div>
          <div class="timeline-meta">
            <span class="timeline-type type-${problem.type}">${formatType(problem.type)}</span>
            ${problem.difficulty ? 
              `<span class="timeline-difficulty difficulty-${problem.difficulty}">${problem.difficulty}</span>` 
              : ''}
          </div>
          <div class="timeline-date">${dateStr} at ${timeStr}</div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  activityTimeline.innerHTML = html;
}

/**
 * Render difficulty statistics
 */
function renderDifficultyStats() {
  const difficultyStats = document.getElementById('difficultyStats');
  const allProblems = getAllProblems();
  
  const difficulties = {
    easy: { completed: 0, total: 0 },
    medium: { completed: 0, total: 0 },
    hard: { completed: 0, total: 0 }
  };
  
  allProblems.forEach(p => {
    if (p.difficulty && difficulties[p.difficulty]) {
      difficulties[p.difficulty].total++;
      if (storageManager.getProgress(p.id)?.completed) {
        difficulties[p.difficulty].completed++;
      }
    }
  });
  
  let html = '<div class="difficulty-grid">';
  
  Object.entries(difficulties).forEach(([level, stats]) => {
    const percentage = stats.total > 0 
      ? Math.round((stats.completed / stats.total) * 100) 
      : 0;
    
    html += `
      <div class="difficulty-card difficulty-${level}">
        <h3>${level.charAt(0).toUpperCase() + level.slice(1)}</h3>
        <div class="difficulty-number">${stats.completed}/${stats.total}</div>
        <div class="difficulty-bar-container">
          <div class="difficulty-bar" style="width: ${percentage}%"></div>
        </div>
        <div class="difficulty-percentage">${percentage}%</div>
      </div>
    `;
  });
  
  html += '</div>';
  difficultyStats.innerHTML = html;
}

/**
 * Render problem type statistics
 */
function renderTypeStats() {
  const typeStats = document.getElementById('typeStats');
  const allProblems = getAllProblems();
  
  const types = {};
  
  allProblems.forEach(p => {
    if (!types[p.type]) {
      types[p.type] = { completed: 0, total: 0 };
    }
    types[p.type].total++;
    if (storageManager.getProgress(p.id)?.completed) {
      types[p.type].completed++;
    }
  });
  
  let html = '<div class="type-grid">';
  
  Object.entries(types).forEach(([type, stats]) => {
    const percentage = stats.total > 0 
      ? Math.round((stats.completed / stats.total) * 100) 
      : 0;
    
    html += `
      <div class="type-card">
        <div class="type-header">
          <h3>${formatType(type)}</h3>
          <span class="type-count">${stats.completed}/${stats.total}</span>
        </div>
        <div class="type-bar-container">
          <div class="type-bar" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  typeStats.innerHTML = html;
}

/**
 * Get all problems from all categories
 */
function getAllProblems() {
  const problems = [];
  
  problemsData.categories.forEach(category => {
    category.topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        problems.push(...subtopic.problems);
      });
    });
  });
  
  return problems;
}

/**
 * Get all problems from a specific category
 */
function getCategoryProblems(category) {
  const problems = [];
  
  category.topics.forEach(topic => {
    topic.subtopics.forEach(subtopic => {
      problems.push(...subtopic.problems);
    });
  });
  
  return problems;
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
 * Setup event listeners
 */
function setupEventListeners() {
  // Export portfolio as JSON
  document.getElementById('exportPortfolioBtn').addEventListener('click', () => {
    const portfolioData = generatePortfolioSummary();
    const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-summary-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  
  // Print portfolio
  document.getElementById('printPortfolioBtn').addEventListener('click', () => {
    generatePrintSummary();
    window.print();
  });
}

/**
 * Generate portfolio summary for export
 */
function generatePortfolioSummary() {
  const allProblems = getAllProblems();
  const completedProblems = allProblems.filter(p => 
    storageManager.getProgress(p.id)?.completed
  );
  
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalProblems: allProblems.length,
      completed: completedProblems.length,
      pending: allProblems.length - completedProblems.length,
      completionRate: allProblems.length > 0 
        ? Math.round((completedProblems.length / allProblems.length) * 100) 
        : 0
    },
    categoryBreakdown: problemsData.categories.map(category => {
      const categoryProblems = getCategoryProblems(category);
      const completed = categoryProblems.filter(p => 
        storageManager.getProgress(p.id)?.completed
      ).length;
      
      return {
        name: category.name,
        total: categoryProblems.length,
        completed,
        percentage: categoryProblems.length > 0 
          ? Math.round((completed / categoryProblems.length) * 100) 
          : 0
      };
    }),
    completedProblems: completedProblems.map(p => ({
      title: p.title,
      type: p.type,
      difficulty: p.difficulty,
      completedAt: storageManager.getProgress(p.id)?.completedAt
    }))
  };
}

/**
 * Generate summary for printing
 */
function generatePrintSummary() {
  const summary = generatePortfolioSummary();
  const printSummary = document.getElementById('printSummary');
  
  let html = `
    <div class="print-summary">
      <h3>MAANG Interview Preparation Progress</h3>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
      
      <div class="print-stats">
        <p><strong>Total Problems:</strong> ${summary.summary.totalProblems}</p>
        <p><strong>Completed:</strong> ${summary.summary.completed}</p>
        <p><strong>Completion Rate:</strong> ${summary.summary.completionRate}%</p>
      </div>
      
      <h4>Category Breakdown:</h4>
      <ul>
  `;
  
  summary.categoryBreakdown.forEach(cat => {
    html += `<li>${cat.name}: ${cat.completed}/${cat.total} (${cat.percentage}%)</li>`;
  });
  
  html += `
      </ul>
      
      <h4>Recently Completed Problems:</h4>
      <ul>
  `;
  
  summary.completedProblems.slice(0, 20).forEach(p => {
    html += `<li>${p.title} (${p.type}${p.difficulty ? `, ${p.difficulty}` : ''})</li>`;
  });
  
  html += `
      </ul>
    </div>
  `;
  
  printSummary.innerHTML = html;
}

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}

