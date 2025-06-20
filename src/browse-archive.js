console.log('browse-archive.js script started');

import { createClient } from '@supabase/supabase-js';
import { initMenu } from './utils/menu.js';
import { incrementDownloadsAndHandleContent } from './utils/download.js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

let currentUser = null;
let currentPage = 1;
let postsPerPage = 12;
let totalPosts = 0;
let isLoading = false;
let popularTags = [];
let selectedTags = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the menu
  initMenu();
  
  // Check authentication status
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user || null;
  
  // Initialize page
  await loadPopularTags();
  await loadPosts();
  setupEventListeners();
});

async function loadPopularTags() {
  try {
    const { data: posts, error } = await supabase
      .from('archive_posts')
      .select('tags');
    
    if (error) throw error;
    
    // Count tag frequencies
    const tagCounts = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    // Get top 10 most popular tags
    popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
    
    displayPopularTags();
  } catch (error) {
    console.error('Error loading popular tags:', error);
  }
}

function displayPopularTags() {
  const popularTagsContainer = document.getElementById('popular-tags');
  popularTagsContainer.innerHTML = popularTags.map(tag => 
    `<span class="tag-filter" data-tag="${tag}">${tag}</span>`
  ).join('');
}

async function loadPosts(page = 1, filters = {}) {
  if (isLoading) return;
  
  isLoading = true;
  showLoading();
  
  try {
    const allFilters = { ...filters, ...getTopFilters() };
    const { 
      searchTerm = '', 
      aiModel = '', 
      sortBy = 'newest',
      contentType = 'all',
      promptVisibility = 'all',
      dateFrom = '',
      dateTo = '',
      viewsMin = '',
      viewsMax = '',
      tags = []
    } = allFilters;
    
    // Build query
    let query = supabase
      .from('archive_posts')
      .select(`
        *,
        users:user_id (
          email,
          raw_user_meta_data
        )
      `, { count: 'exact' });
    
    // Apply search filter
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,prompt.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
    }
    
    // Apply AI model filter
    if (aiModel) {
      if (aiModel === 'gpt-4') {
        query = query.or('ai_model.ilike.%gpt-4%,ai_model.ilike.%gpt4%');
      } else if (aiModel === 'claude') {
        query = query.ilike('ai_model', '%claude%');
      } else if (aiModel === 'gemini') {
        query = query.or('ai_model.ilike.%gemini%,ai_model.ilike.%bard%');
      } else if (aiModel === 'other') {
        query = query.not('ai_model', 'ilike', '%gpt%')
                     .not('ai_model', 'ilike', '%claude%')
                     .not('ai_model', 'ilike', '%gemini%')
                     .not('ai_model', 'ilike', '%bard%');
      }
    }
    
    // Apply content type filter
    if (contentType === 'text') {
      query = query.is('embed_url', null);
    } else if (contentType === 'embedded') {
      query = query.not('embed_url', 'is', null);
    }
    
    // Apply prompt visibility filter
    if (promptVisibility === 'public') {
      query = query.eq('prompt_is_public', true);
    } else if (promptVisibility === 'private') {
      query = query.eq('prompt_is_public', false);
    }
    
    // Apply date range filter
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString().split('T')[0]);
    }
    
    // Apply view count filter
    if (viewsMin) {
      query = query.gte('views', parseInt(viewsMin));
    }
    if (viewsMax) {
      query = query.lte('views', parseInt(viewsMax));
    }
    
    // Apply tags filter
    if (tags.length > 0) {
      const tagConditions = tags.map(tag => `tags.cs.{${tag}}`).join(',');
      query = query.or(tagConditions);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'most-viewed':
        query = query.order('views', { ascending: false });
        break;
      case 'most-favorited':
        // We'll need to implement this with a join/count later
        query = query.order('created_at', { ascending: false });
        break;
      default: // newest
        query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    const startIndex = (page - 1) * postsPerPage;
    query = query.range(startIndex, startIndex + postsPerPage - 1);
    
    const { data: posts, error, count } = await query;
    
    if (error) throw error;
    
    // Get favorite counts for each post
    if (posts) {
      for (let post of posts) {
        const { data: favData } = await supabase
          .from('user_favorites')
          .select('id')
          .eq('post_id', post.id)
          .eq('post_type', 'archive');
        post.favorite_count = favData ? favData.length : 0;
      }
    }
    
    totalPosts = count || 0;
    currentPage = page;
    
    await displayPosts(posts || []);
    updateStats();
    updatePagination();
    
  } catch (error) {
    console.error('Error loading posts:', error);
    showError('Failed to load posts. Please try again.');
  } finally {
    isLoading = false;
  }
}

function getTopFilters() {
  const filters = {
    aiModel: [],
    contentType: document.querySelector('input[name="content-type"]:checked')?.value || 'all',
    promptVisibility: document.querySelector('input[name="prompt-visibility"]:checked')?.value || 'all',
    dateFrom: document.querySelector('input[name="date-from"]')?.value || '',
    dateTo: document.querySelector('input[name="date-to"]')?.value || '',
    viewsMin: document.querySelector('input[name="views-min"]')?.value || '',
    viewsMax: document.querySelector('input[name="views-max"]')?.value || '',
    tags: selectedTags
  };
  
  // Get selected AI models
  document.querySelectorAll('input[name="ai-model"]:checked').forEach(checkbox => {
    filters.aiModel.push(checkbox.value);
  });
  
  return filters;
}

async function displayPosts(posts) {
  const container = document.getElementById('posts-container');
  
  if (posts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#067273" stroke-width="1">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <h3>No archive posts found</h3>
        <p>Try adjusting your search or filter criteria, or be the first to share your AI insights!</p>
      </div>
    `;
    return;
  }
  
  const postsGrid = document.createElement('div');
  postsGrid.className = 'posts-grid';
  
  for (const post of posts) {
    const postCard = await createPostCard(post);
    postsGrid.appendChild(postCard);
  }
  
  container.innerHTML = '';
  container.appendChild(postsGrid);
}

async function createPostCard(post) {
  // Get author name
  const authorName = post.users?.raw_user_meta_data?.display_name || 
                    post.users?.raw_user_meta_data?.full_name || 
                    post.users?.email?.split('@')[0] || 
                    'Anonymous';
  
  // Format date
  const postDate = new Date(post.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  // Truncate content for preview
  let contentPreview = '';
  if (post.embed_url) {
    contentPreview = 'AI-generated content available via embedded link';
  } else {
    contentPreview = post.content ? 
      (post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content) :
      'No content preview available';
  }
  
  // Check if favorited by current user
  let isFavorited = false;
  if (currentUser) {
    const { data } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('post_id', post.id)
      .eq('post_type', 'archive')
      .limit(1);
    isFavorited = data && data.length > 0;
  }
  
  const card = document.createElement('div');
  card.className = 'post-card';
  card.dataset.postId = post.id;
  
  card.innerHTML = `
    <div class="post-card-header">
      <div class="post-type-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        Archive Post
      </div>
    </div>
    
    <h3 class="post-card-title">${post.title}</h3>
    
    <div class="post-card-meta">
      <span>👤 ${authorName}</span>
      <span>•</span>
      <span>🤖 ${post.ai_model}</span>
      <span>•</span>
      <span>👁️ ${post.views || 0} views</span>
      <span>•</span>
      <span>❤️ ${post.favorite_count || 0}</span>
      <span>•</span>
      <span class="download-count">📥 ${post.downloads || 0}</span>
    </div>
    
    <div class="post-card-content">
      ${contentPreview}
    </div>
    
    <div class="post-card-tags">
      ${post.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
      ${post.tags.length > 3 ? `<span class="tag">+${post.tags.length - 3}</span>` : ''}
    </div>
    
    <div class="post-card-footer">
      <span class="post-card-date">${postDate}</span>
      <div class="post-card-actions">
        <button class="download-btn" 
                data-post-id="${post.id}" 
                data-post-type="archive"
                title="Download content">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        ${currentUser ? `
          <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" 
                  data-post-id="${post.id}" 
                  data-post-type="archive"
                  title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFavorited ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        ` : ''}
        <a href="/view-post.html?id=${post.id}&type=archive" class="view-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h6v6"/>
            <path d="M10 14L21 3"/>
            <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11"/>
          </svg>
          View
        </a>
      </div>
    </div>
  `;
  
  // Add click handler for the entire card (except buttons)
  card.addEventListener('click', (e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest('.post-card-actions')) return;
    
    // Increment view count and navigate
    incrementViewCount(post.id);
    window.location.href = `/view-post.html?id=${post.id}&type=archive`;
  });
  
  return card;
}

async function incrementViewCount(postId) {
  try {
    const { data: currentPost, error: selectError } = await supabase
      .from('archive_posts')
      .select('views')
      .eq('id', postId)
      .single();
    
    if (!selectError) {
      const newViewCount = (currentPost.views || 0) + 1;
      await supabase
        .from('archive_posts')
        .update({ views: newViewCount })
        .eq('id', postId);
    }
  } catch (error) {
    console.error('Error updating view count:', error);
  }
}

function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  const sortFilter = document.getElementById('sort-filter');
  const tagSearchInput = document.getElementById('tag-search-input');
  const clearFiltersBtn = document.getElementById('clear-filters');
  
  // Debounced search
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);
  });
  
  // Filter changes
  sortFilter.addEventListener('change', performSearch);
  
  // Top filter changes
  document.addEventListener('change', (e) => {
    if (e.target.matches('input[name="ai-model"], input[name="content-type"], input[name="prompt-visibility"], input[name="date-from"], input[name="date-to"], input[name="views-min"], input[name="views-max"]')) {
      performSearch();
    }
  });
  
  // Tag search
  if (tagSearchInput) {
    tagSearchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const tagFilters = document.querySelectorAll('.tag-filter');
      
      tagFilters.forEach(tagFilter => {
        const tagText = tagFilter.textContent.toLowerCase();
        if (tagText.includes(searchTerm)) {
          tagFilter.style.display = 'inline-block';
        } else {
          tagFilter.style.display = 'none';
        }
      });
    });
  }
  
  // Tag filter clicks
  document.addEventListener('click', (e) => {
    if (e.target.matches('.tag-filter')) {
      const tag = e.target.dataset.tag;
      
      if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter(t => t !== tag);
        e.target.classList.remove('active');
      } else {
        selectedTags.push(tag);
        e.target.classList.add('active');
      }
      
      performSearch();
    }
  });
  
  // Clear filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      // Clear all form inputs
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      document.querySelectorAll('input[type="radio"][value="all"]').forEach(radio => radio.checked = true);
      document.querySelectorAll('input[type="date"], input[type="number"], input[type="text"]').forEach(input => input.value = '');
      
      // Clear selected tags
      selectedTags = [];
      document.querySelectorAll('.tag-filter.active').forEach(tag => tag.classList.remove('active'));
      
      // Clear search
      searchInput.value = '';
      
      // Reset to first page and reload
      performSearch();
    });
  }
  
  // Favorite button clicks
  document.addEventListener('click', async (e) => {
    if (e.target.closest('.favorite-btn')) {
      e.stopPropagation();
      await handleFavoriteClick(e.target.closest('.favorite-btn'));
    }
    
    // Download button clicks
    if (e.target.closest('.download-btn')) {
      e.stopPropagation();
      await handleDownloadClick(e.target.closest('.download-btn'));
    }
  });
}

async function performSearch() {
  const filters = {
    searchTerm: document.getElementById('search-input').value.trim(),
    sortBy: document.getElementById('sort-filter').value
  };
  
  await loadPosts(1, filters);
}

async function handleFavoriteClick(button) {
  if (!currentUser) {
    alert('Please sign in to add favorites');
    return;
  }

  const postId = button.dataset.postId;
  const postType = button.dataset.postType;
  const isFaved = button.classList.contains('favorited');

  try {
    if (isFaved) {
      // Remove from favorites
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('post_id', postId)
        .eq('post_type', postType);

      if (error) throw error;

      updateFavoriteButton(button, false);
      showNotification('Removed from favorites', 'success');
    } else {
      // Get post data for favorites
      const { data: post } = await supabase
        .from('archive_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (!post) throw new Error('Post not found');

      // Add to favorites
      const { error } = await supabase
        .from('user_favorites')
        .insert([{
          user_id: currentUser.id,
          post_id: postId,
          post_type: postType,
          post_title: post.title,
          post_data: post
        }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('This post is already in your favorites');
        }
        throw error;
      }

      updateFavoriteButton(button, true);
      showNotification('Added to favorites', 'success');
    }
  } catch (error) {
    console.error('Error managing favorite:', error);
    showNotification(error.message, 'error');
  }
}

async function handleDownloadClick(button) {
  const postId = button.dataset.postId;
  const postType = button.dataset.postType;

  try {
    // Get post data for download
    const { data: post } = await supabase
      .from('archive_posts')
      .select(`
        *,
        users:user_id (
          email,
          raw_user_meta_data
        )
      `)
      .eq('id', postId)
      .single();
  }
}
function updateFavoriteButton(button, isFaved) {
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

function updateStats() {
  const statsElement = document.getElementById('browse-stats');
  const startIndex = (currentPage - 1) * postsPerPage + 1;
  const endIndex = Math.min(currentPage * postsPerPage, totalPosts);
  
  if (totalPosts === 0) {
    statsElement.innerHTML = '<p>No posts found</p>';
  } else {
    statsElement.innerHTML = `<p>Showing ${startIndex}-${endIndex} of ${totalPosts} archive posts</p>`;
  }
}

function updatePagination() {
  const paginationContainer = document.getElementById('pagination-container');
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }
  
  const pagination = document.createElement('div');
  pagination.className = 'pagination';
  
  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`;
  prevBtn.textContent = 'Previous';
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      loadPosts(currentPage - 1, getCurrentFilters());
    }
  });
  pagination.appendChild(prevBtn);
  
  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      if (i !== currentPage) {
        loadPosts(i, getCurrentFilters());
      }
    });
    pagination.appendChild(pageBtn);
  }
  
  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = `pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`;
  nextBtn.textContent = 'Next';
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      loadPosts(currentPage + 1, getCurrentFilters());
    }
  });
  pagination.appendChild(nextBtn);
  
  paginationContainer.innerHTML = '';
  paginationContainer.appendChild(pagination);
}

function getCurrentFilters() {
  return {
    searchTerm: document.getElementById('search-input').value.trim(),
    sortBy: document.getElementById('sort-filter').value
  };
}

function showLoading() {
  const container = document.getElementById('posts-container');
  container.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading archive posts...</p>
    </div>
  `;
}

function showError(message) {
  const container = document.getElementById('posts-container');
  container.innerHTML = `
    <div class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="1">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h3>Error Loading Posts</h3>
      <p>${message}</p>
    </div>
  `;
}

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