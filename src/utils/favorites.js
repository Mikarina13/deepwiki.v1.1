import supabase from './supabaseClient.js';


let currentUser = null;

// Initialize favorites functionality
export async function initializeFavorites() {
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user || null;
}

// Add to favorites
export async function addToFavorites(postId, postType, postTitle, postData) {
  if (!currentUser) {
    alert('Please sign in to add favorites');
    return false;
  }

  try {
    const { error } = await supabase
      .from('user_favorites')
      .insert([{
        user_id: currentUser.id,
        post_id: postId,
        post_type: postType,
        post_title: postTitle,
        post_data: postData
      }]);

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('This post is already in your favorites');
      }
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}

// Remove from favorites
export async function removeFromFavorites(postId, postType) {
  if (!currentUser) return false;

  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('post_id', postId)
      .eq('post_type', postType);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

// Check if post is favorited
export async function isFavorite(postId, postType) {
  if (!currentUser) return false;

  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('post_id', postId)
      .eq('post_type', postType)
      .limit(1);

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}

// Create favorite button HTML
export function createFavoriteButton(postId, postType, isFaved = false) {
  return `
    <button class="favorite-btn ${isFaved ? 'favorited' : ''}"
            data-post-id="${postId}"
            data-post-type="${postType}"
            title="${isFaved ? 'Remove from favorites' : 'Add to favorites'}">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  `;
}

// Handle favorite button clicks
export async function handleFavoriteClick(button, postData = {}) {
  const postId = button.dataset.postId;
  const postType = button.dataset.postType;
  const isFaved = button.classList.contains('favorited');
  
  try {
    if (isFaved) {
      await removeFromFavorites(postId, postType);
      updateFavoriteButton(button, false);
      showNotification('Removed from favorites', 'success');
    } else {
      await addToFavorites(postId, postType, postData.title || 'Untitled', postData);
      updateFavoriteButton(button, true);
      showNotification('Added to favorites', 'success');
    }
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Update favorite button state
export function updateFavoriteButton(button, isFaved) {
  const svg = button.querySelector('svg');

  if (isFaved) {
    button.classList.add('favorited');
    svg.setAttribute('fill', 'currentColor');
    button.title = 'Remove from favorites';
  } else {
    button.classList.remove('favorited');
    svg.setAttribute('fill', 'none');
    button.title = 'Add to favorites';
  }
}

// Set current user (called from auth changes)
export function setCurrentUser(user) {
  currentUser = user;
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#dc3545' : '#067273'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Remove notification
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
