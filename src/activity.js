import { initMenu } from './utils/menu.js';

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  
  // Activity filter functionality
  const filterButtons = document.querySelectorAll('.filter-button');
  const activityFeed = document.getElementById('activity-feed');
  
  // Handle filter button clicks
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Get the filter type
      const filterType = button.dataset.filter;
      
      // Update the activity feed based on filter
      updateActivityFeed(filterType);
    });
  });
  
  function updateActivityFeed(filterType) {
    // This is where you would typically fetch and display filtered data
    // For now, we'll just update the display
    
    switch(filterType) {
      case 'all':
        activityFeed.innerHTML = '<p class="empty-state">No recent activity</p>';
        break;
      case 'archive':
        activityFeed.innerHTML = '<p class="empty-state">No archive posts yet</p>';
        break;
      case 'collab':
        activityFeed.innerHTML = '<p class="empty-state">No collab posts yet</p>';
        break;
      default:
        activityFeed.innerHTML = '<p class="empty-state">No recent activity</p>';
    }
  }
});
