/**
 * Recent Activity Tracking Utility
 * Manages user's recent activities (viewed posts, searches, etc.) in localStorage
 */

const RECENT_ACTIVITIES_KEY = 'deepwiki_recent_activities';
const MAX_ACTIVITIES = 10;

/**
 * Activity types
 */
export const ACTIVITY_TYPES = {
  VIEW_POST: 'view_post',
  SEARCH: 'search',
  BROWSE: 'browse'
};

/**
 * Add a new activity to recent activities
 * @param {Object} activity - The activity object
 * @param {string} activity.type - Type of activity (view_post, search, browse)
 * @param {string} activity.title - Display title for the activity
 * @param {string} activity.url - URL to navigate to when clicked
 * @param {string} activity.postType - Type of post (archive/collab) if applicable
 * @param {string} activity.postId - Post ID if applicable
 * @param {Date} activity.timestamp - When the activity occurred
 */
export function addRecentActivity(activity) {
  try {
    const activities = getRecentActivities();
    
    // Create activity object with timestamp
    const newActivity = {
      ...activity,
      timestamp: activity.timestamp || new Date().toISOString(),
      id: generateActivityId(activity)
    };
    
    // Remove any existing activity with the same ID (to avoid duplicates)
    const filteredActivities = activities.filter(a => a.id !== newActivity.id);
    
    // Add new activity to the beginning
    filteredActivities.unshift(newActivity);
    
    // Keep only the most recent activities
    const limitedActivities = filteredActivities.slice(0, MAX_ACTIVITIES);
    
    // Save to localStorage
    localStorage.setItem(RECENT_ACTIVITIES_KEY, JSON.stringify(limitedActivities));
    
    // Trigger custom event to notify menu to update
    window.dispatchEvent(new CustomEvent('recentActivitiesUpdated'));
    
  } catch (error) {
    console.error('Error adding recent activity:', error);
  }
}

/**
 * Get all recent activities
 * @returns {Array} Array of recent activities
 */
export function getRecentActivities() {
  try {
    const stored = localStorage.getItem(RECENT_ACTIVITIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting recent activities:', error);
    return [];
  }
}

/**
 * Clear all recent activities
 */
export function clearRecentActivities() {
  try {
    localStorage.removeItem(RECENT_ACTIVITIES_KEY);
    window.dispatchEvent(new CustomEvent('recentActivitiesUpdated'));
  } catch (error) {
    console.error('Error clearing recent activities:', error);
  }
}

/**
 * Generate a unique ID for an activity to prevent duplicates
 * @param {Object} activity - The activity object
 * @returns {string} Unique ID
 */
function generateActivityId(activity) {
  if (activity.type === ACTIVITY_TYPES.VIEW_POST && activity.postId) {
    return `${activity.type}_${activity.postType}_${activity.postId}`;
  } else if (activity.type === ACTIVITY_TYPES.SEARCH) {
    return `${activity.type}_${activity.title.toLowerCase().replace(/\s+/g, '_')}`;
  } else {
    return `${activity.type}_${Date.now()}`;
  }
}

/**
 * Format activity for display
 * @param {Object} activity - The activity object
 * @returns {Object} Formatted activity with display properties
 */
export function formatActivityForDisplay(activity) {
  const timeAgo = getTimeAgo(new Date(activity.timestamp));
  
  let icon = '📄'; // Default icon
  let subtitle = timeAgo;
  
  switch (activity.type) {
    case ACTIVITY_TYPES.VIEW_POST:
      icon = activity.postType === 'archive' ? '📚' : '🤝';
      subtitle = `${activity.postType === 'archive' ? 'Archive' : 'Collab'} • ${timeAgo}`;
      break;
    case ACTIVITY_TYPES.SEARCH:
      icon = '🔍';
      subtitle = `Search • ${timeAgo}`;
      break;
    case ACTIVITY_TYPES.BROWSE:
      icon = '👀';
      subtitle = `Browse • ${timeAgo}`;
      break;
  }
  
  return {
    ...activity,
    icon,
    subtitle,
    timeAgo
  };
}

/**
 * Get human-readable time ago string
 * @param {Date} date - The date to compare
 * @returns {string} Time ago string
 */
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}