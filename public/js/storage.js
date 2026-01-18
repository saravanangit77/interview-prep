/**
 * StorageManager - Handles all LocalStorage operations for the app
 */
class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'maang_prep_tracker';
    this.initStorage();
  }

  /**
   * Initialize storage with default structure if not exists
   */
  initStorage() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const defaultData = {
        progress: {},
        settings: {
          darkMode: false,
          showDifficulty: false,
          showEstimatedTime: false
        },
        customProblems: []
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultData));
    }
  }

  /**
   * Get all data from storage
   */
  getData() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Save all data to storage
   */
  setData(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  }

  /**
   * Get progress for a specific problem
   * @param {string} problemId - The problem ID
   * @returns {object|null} Progress object or null
   */
  getProgress(problemId) {
    const data = this.getData();
    return data?.progress[problemId] || null;
  }

  /**
   * Set progress for a specific problem
   * @param {string} problemId - The problem ID
   * @param {object} progressData - Progress data (completed, notes, completedAt)
   */
  setProgress(problemId, progressData) {
    const data = this.getData();
    if (!data) return false;

    data.progress[problemId] = {
      ...data.progress[problemId],
      ...progressData,
      updatedAt: new Date().toISOString()
    };

    return this.setData(data);
  }

  /**
   * Toggle completion status for a problem
   * @param {string} problemId - The problem ID
   * @returns {boolean} New completion status
   */
  toggleCompletion(problemId) {
    const progress = this.getProgress(problemId);
    const newStatus = !progress?.completed;

    this.setProgress(problemId, {
      completed: newStatus,
      completedAt: newStatus ? new Date().toISOString() : null
    });

    return newStatus;
  }

  /**
   * Update notes for a problem
   * @param {string} problemId - The problem ID
   * @param {string} notes - Notes text
   */
  updateNotes(problemId, notes) {
    return this.setProgress(problemId, { notes });
  }

  /**
   * Get all settings
   */
  getSettings() {
    const data = this.getData();
    return data?.settings || {};
  }

  /**
   * Update a specific setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   */
  updateSetting(key, value) {
    const data = this.getData();
    if (!data) return false;

    data.settings[key] = value;
    return this.setData(data);
  }

  /**
   * Get all custom problems
   */
  getCustomProblems() {
    const data = this.getData();
    return data?.customProblems || [];
  }

  /**
   * Add a custom problem
   * @param {object} problem - Problem object
   */
  addCustomProblem(problem) {
    const data = this.getData();
    if (!data) return false;

    const problemWithId = {
      ...problem,
      id: `custom-${Date.now()}`,
      isCustom: true
    };

    data.customProblems.push(problemWithId);
    return this.setData(data) ? problemWithId : null;
  }

  /**
   * Delete a custom problem
   * @param {string} problemId - The problem ID
   */
  deleteCustomProblem(problemId) {
    const data = this.getData();
    if (!data) return false;

    data.customProblems = data.customProblems.filter(p => p.id !== problemId);
    
    // Also delete progress for this problem
    delete data.progress[problemId];
    
    return this.setData(data);
  }

  /**
   * Reset progress for a specific topic/subtopic
   * @param {string} subtopicId - The subtopic ID
   * @param {array} problemIds - Array of problem IDs in this subtopic
   */
  resetTopicProgress(subtopicId, problemIds) {
    const data = this.getData();
    if (!data) return false;

    problemIds.forEach(id => {
      delete data.progress[id];
    });

    return this.setData(data);
  }

  /**
   * Reset all progress
   */
  resetAllProgress() {
    const data = this.getData();
    if (!data) return false;

    data.progress = {};
    return this.setData(data);
  }

  /**
   * Export all data as JSON
   * @returns {string} JSON string of all data
   */
  exportData() {
    const data = this.getData();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON
   * @param {string} jsonString - JSON string to import
   */
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate data structure
      if (!data.progress || !data.settings) {
        throw new Error('Invalid data structure');
      }

      return this.setData(data);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Get statistics for all problems
   */
  getStatistics() {
    const data = this.getData();
    if (!data) return null;

    const progress = data.progress;
    const allProblemIds = Object.keys(progress);
    const completed = allProblemIds.filter(id => progress[id]?.completed).length;

    return {
      total: allProblemIds.length,
      completed,
      pending: allProblemIds.length - completed,
      percentage: allProblemIds.length > 0 
        ? Math.round((completed / allProblemIds.length) * 100) 
        : 0
    };
  }

  /**
   * Get problems completed within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  getCompletedInRange(startDate, endDate) {
    const data = this.getData();
    if (!data) return [];

    return Object.entries(data.progress)
      .filter(([_, p]) => {
        if (!p.completed || !p.completedAt) return false;
        const completedDate = new Date(p.completedAt);
        return completedDate >= startDate && completedDate <= endDate;
      })
      .map(([id, p]) => ({ id, ...p }));
  }
}

// Create global instance
const storageManager = new StorageManager();

