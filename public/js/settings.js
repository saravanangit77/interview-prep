/**
 * Settings modal and functionality
 */

// Initialize settings when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initSettings();
});

/**
 * Initialize settings UI and event listeners
 */
function initSettings() {
  const settingsBtn = document.getElementById('settingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  
  const darkModeToggle = document.getElementById('darkModeToggle');
  const showDifficultyToggle = document.getElementById('showDifficulty');
  const showEstimatedTimeToggle = document.getElementById('showEstimatedTime');
  
  const exportDataBtn = document.getElementById('exportDataBtn');
  const importDataBtn = document.getElementById('importDataBtn');
  const importFileInput = document.getElementById('importFileInput');
  const resetAllBtn = document.getElementById('resetAllBtn');
  
  // Load current settings
  loadSettings();
  
  // Open settings modal
  settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
    loadSettings(); // Refresh settings when opening
  });
  
  // Close settings modal
  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.style.display = 'none';
    }
  });
  
  // Toggle dark mode
  darkModeToggle.addEventListener('change', (e) => {
    const isDarkMode = e.target.checked;
    storageManager.updateSetting('darkMode', isDarkMode);
    applyDarkMode(isDarkMode);
  });
  
  // Toggle difficulty display
  showDifficultyToggle.addEventListener('change', (e) => {
    storageManager.updateSetting('showDifficulty', e.target.checked);
    
    // Re-render current problem list if visible
    if (window.currentSubtopicProblems && window.currentSubtopicProblems.length > 0) {
      renderProblemList(window.currentSubtopicProblems);
    }
  });
  
  // Toggle estimated time display
  showEstimatedTimeToggle.addEventListener('change', (e) => {
    storageManager.updateSetting('showEstimatedTime', e.target.checked);
    
    // Re-render current problem list if visible
    if (window.currentSubtopicProblems && window.currentSubtopicProblems.length > 0) {
      renderProblemList(window.currentSubtopicProblems);
    }
  });
  
  // Export data
  exportDataBtn.addEventListener('click', () => {
    const data = storageManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `maang-prep-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show feedback
    const originalText = exportDataBtn.textContent;
    exportDataBtn.textContent = '✓ Exported!';
    setTimeout(() => {
      exportDataBtn.textContent = originalText;
    }, 2000);
  });
  
  // Import data
  importDataBtn.addEventListener('click', () => {
    importFileInput.click();
  });
  
  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = storageManager.importData(event.target.result);
      
      if (success) {
        alert('Data imported successfully! Refreshing page...');
        window.location.reload();
      } else {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  });
  
  // Reset all progress
  resetAllBtn.addEventListener('click', () => {
    const confirmed = confirm(
      'Are you sure you want to reset ALL progress? This will delete all completed problems, notes, and custom problems. This action cannot be undone!'
    );
    
    if (confirmed) {
      const doubleConfirm = confirm('This is your last chance. Are you absolutely sure?');
      
      if (doubleConfirm) {
        storageManager.resetAllProgress();
        alert('All progress has been reset. Refreshing page...');
        window.location.reload();
      }
    }
  });
  
  // Initialize add custom problem modal
  initAddCustomProblemModal();
}

/**
 * Load settings into UI
 */
function loadSettings() {
  const settings = storageManager.getSettings();
  
  document.getElementById('darkModeToggle').checked = settings.darkMode || false;
  document.getElementById('showDifficulty').checked = settings.showDifficulty || false;
  document.getElementById('showEstimatedTime').checked = settings.showEstimatedTime || false;
  
  // Apply dark mode on load
  applyDarkMode(settings.darkMode || false);
}

/**
 * Apply dark mode to the page
 */
function applyDarkMode(isDarkMode) {
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

/**
 * Initialize add custom problem modal
 */
function initAddCustomProblemModal() {
  const addProblemModal = document.getElementById('addProblemModal');
  const closeAddProblemBtn = document.getElementById('closeAddProblemBtn');
  const cancelAddProblemBtn = document.getElementById('cancelAddProblemBtn');
  const addProblemForm = document.getElementById('addProblemForm');
  
  // Close modal
  const closeModal = () => {
    addProblemModal.style.display = 'none';
    addProblemForm.reset();
  };
  
  closeAddProblemBtn.addEventListener('click', closeModal);
  cancelAddProblemBtn.addEventListener('click', closeModal);
  
  // Close when clicking outside
  addProblemModal.addEventListener('click', (e) => {
    if (e.target === addProblemModal) {
      closeModal();
    }
  });
  
  // Handle form submission
  addProblemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('problemTitle').value.trim();
    const link = document.getElementById('problemLink').value.trim();
    const platform = document.getElementById('problemPlatform').value.trim() || 'Custom';
    const type = document.getElementById('problemType').value;
    const difficulty = document.getElementById('problemDifficulty').value;
    const time = document.getElementById('problemTime').value;
    
    // Create problem object
    const problem = {
      title,
      type,
      links: [
        {
          platform,
          url: link
        }
      ]
    };
    
    // Add optional fields
    if (difficulty) {
      problem.difficulty = difficulty;
    }
    
    if (time) {
      problem.estimatedTime = parseInt(time, 10);
    }
    
    // Add to storage
    const addedProblem = storageManager.addCustomProblem(problem);
    
    if (addedProblem) {
      // Add to current subtopic if one is selected
      if (window.currentSubtopicProblems) {
        window.currentSubtopicProblems.push(addedProblem);
        renderProblemList(window.currentSubtopicProblems);
        updateSubtopicStats();
      }
      
      closeModal();
      alert('Custom problem added successfully!');
    } else {
      alert('Failed to add custom problem. Please try again.');
    }
  });
}

