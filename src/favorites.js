import supabase from './utils/supabaseClient.js';
import { initMenu } from './utils/menu.js';


let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the side menu
  initMenu();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    showLoginPrompt();
    return;
  }
  
  currentUser = session.user;
  
  // Load and display favorites
  await loadFavorites();
  
  // Setup event listeners
  setupEventListeners();
});

async function loadFavorites() {
  try {
    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    displayFavorites(favorites || []);
  } catch (error) {
    console.error('Error loading favorites:', error);
    showError('Failed to load favorites. Please try again.');
  }
}

function setupEventListeners() {
  const filterButtons = document.querySelectorAll('.filter-button');
  
  // Handle filter button clicks
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Get the filter type and filter favorites
      const filterType = button.dataset.filter;
      filterFavorites(filterType);
    });
  });
  
  // Handle remove favorite buttons
  document.addEventListener('click', async (e) => {
    if (e.target.closest('.remove-favorite')) {
      const favoriteItem = e.target.closest('.favorite-item');
      const favoriteId = favoriteItem.dataset.favoriteId;
      await removeFavorite(favoriteId, favoriteItem);
    }
  });
}

function displayFavorites(favorites) {
  const favoritesContent = document.getElementById('favorites-content');
  const emptyFavorites = document.getElementById('empty-favorites');
  
  if (favorites.length === 0) {
    favoritesContent.style.display = 'none';
    emptyFavorites.style.display = 'block';
    return;
  }
  
  favoritesContent.style.display = 'block';
  emptyFavorites.style.display = 'none';
  
  const favoritesGrid = document.createElement('div');
  favoritesGrid.className = 'favorites-grid';
  
  favorites.forEach(favorite => {
    const favoriteElement = createFavoriteElement(favorite);
    favoritesGrid.appendChild(favoriteElement);
  });
  
  favoritesContent.innerHTML = '';
  favoritesContent.appendChild(favoritesGrid);
  
  // Apply current filter
  const activeFilter = document.querySelector('.filter-button.active').dataset.filter;
  filterFavorites(activeFilter);
}

function createFavoriteElement(favorite) {
  const div = document.createElement('div');
  div.className = 'favorite-item';
  div.dataset.type = favorite.post_type;
  div.dataset.favoriteId = favorite.id;
  
  const postData = favorite.post_data;
  const isArchive = favorite.post_type === 'archive';
  
  // Get appropriate icon and type label
  const typeIcon = isArchive 
    ? '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>'
    : '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>';
  
  const typeLabel = isArchive ? 'Archive Post' : 'Collab Post';
  
  // Format metadata
  let metaInfo = '';
  if (isArchive) {
    metaInfo = `
      <span>🤖 AI Model: ${postData.ai_model || 'Unknown'}</span>
      ${postData.generation_date ? `<span>•</span><span>⚡ Generated: ${new Date(postData.generation_date).toLocaleDateString()}</span>` : ''}
    `;
  } else {
    const typeDisplay = postData.type === 'request' ? 'Looking for collaboration' : 'Offering to collaborate';
    const typeIcon = postData.type === 'request' ? '🔍' : '🎯';
    metaInfo = `<span>${typeIcon} ${typeDisplay}</span>`;
  }
  
  // Create description
  let description = '';
  if (isArchive) {
    description = postData.content ? 
      (postData.content.length > 200 ? postData.content.substring(0, 200) + '...' : postData.content) :
      'AI-generated content available via link';
  } else {
    description = postData.description ? 
      (postData.description.length > 200 ? postData.description.substring(0, 200) + '...' : postData.description) :
      'Collaboration description';
  }
  
  div.innerHTML = `
    <div class="favorite-header">
      <div class="favorite-type">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${typeIcon}
        </svg>
        ${typeLabel}
      </div>
      <button class="remove-favorite" title="Remove from favorites">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <h4>${favorite.post_title}</h4>
    <div class="favorite-meta">
      <span>📅 Saved ${getTimeAgo(favorite.created_at)}</span>
      ${metaInfo ? `<span>•</span>${metaInfo}` : ''}
    </div>
    <div class="favorite-description">
      ${description}
    </div>
    <div class="favorite-tags">
      ${(postData.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
    <div class="favorite-actions">
      <a href="/view-post.html?id=${favorite.post_id}&type=${favorite.post_type}" class="view-favorite-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h6v6"/>
          <path d="M10 14L21 3"/>
          <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11"/>
        </svg>
        View Post
      </a>
      <span class="favorite-date">Added ${new Date(favorite.created_at).toLocaleDateString()}</span>
    </div>
  `;
  
  return div;
}

function filterFavorites(filterType) {
  const favoriteItems = document.querySelectorAll('.favorite-item');
  const favoritesContent = document.getElementById('favorites-content');
  const emptyFavorites = document.getElementById('empty-favorites');
  let visibleCount = 0;
  
  favoriteItems.forEach(item => {
    const itemType = item.dataset.type;
    
    if (filterType === 'all' || filterType === itemType) {
      item.style.display = 'block';
      visibleCount++;
    } else {
      item.style.display = 'none';
    }
  });
  
  // Show/hide empty state
  if (visibleCount === 0) {
    favoritesContent.style.display = 'none';
    emptyFavorites.style.display = 'block';
    
    // Update empty state message based on filter
    const emptyMessage = emptyFavorites.querySelector('p');
    if (filterType === 'all') {
      emptyMessage.textContent = 'Start adding posts to your favorites by clicking the heart icon on archive and collab posts you find interesting.';
    } else if (filterType === 'archive') {
      emptyMessage.textContent = 'No archive posts in your favorites yet. Browse the archive to find interesting AI insights to save.';
    } else if (filterType === 'collab') {
      emptyMessage.textContent = 'No collaboration posts in your favorites yet. Check out the collab section to find interesting projects.';
    }
  } else {
    favoritesContent.style.display = 'block';
    emptyFavorites.style.display = 'none';
  }
}

async function removeFavorite(favoriteId, favoriteItem) {
  if (!confirm('Remove this item from your favorites?')) {
    return;
  }
  
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('id', favoriteId)
      .eq('user_id', currentUser.id);

    if (error) throw error;

    // Add fade out animation
    favoriteItem.style.opacity = '0';
    favoriteItem.style.transform = 'translateY(-10px)';
    
    // Remove after animation completes
    setTimeout(() => {
      favoriteItem.remove();
      
      // Check if we need to show empty state
      const remainingItems = document.querySelectorAll('.favorite-item');
      const activeFilter = document.querySelector('.filter-button.active').dataset.filter;
      
      let visibleCount = 0;
      remainingItems.forEach(item => {
        const itemType = item.dataset.type;
        if (activeFilter === 'all' || activeFilter === itemType) {
          visibleCount++;
        }
      });
      
      if (visibleCount === 0) {
        document.getElementById('favorites-content').style.display = 'none';
        document.getElementById('empty-favorites').style.display = 'block';
      }
    }, 300);

  } catch (error) {
    console.error('Error removing favorite:', error);
    showError('Failed to remove favorite. Please try again.');
  }
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
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

function showLoginPrompt() {
  const favoritesContent = document.getElementById('favorites-content');
  const emptyFavorites = document.getElementById('empty-favorites');
  
  favoritesContent.style.display = 'none';
  emptyFavorites.style.display = 'block';
  
  emptyFavorites.innerHTML = `
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#067273" stroke-width="1">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
    <h3>Sign in to view favorites</h3>
    <p>Create an account or sign in to save your favorite posts and access them anytime.</p>
    <a href="/login.html" class="browse-content-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
        <polyline points="10 17 15 12 10 7"/>
        <line x1="15" y1="12" x2="3" y2="12"/>
      </svg>
      Sign In
    </a>
  `;
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Export for use in other files
window.favoritesAPI = {
  async addToFavorites(postId, postType, postTitle, postData) {
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
  },

  async removeFromFavorites(postId, postType) {
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
  },

  async isFavorite(postId, postType) {
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
  },

  setCurrentUser(user) {
    currentUser = user;
  }
};
