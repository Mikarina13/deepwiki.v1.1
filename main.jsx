import { createClient } from '@supabase/supabase-js';
import { initMenu } from './src/utils/menu.js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Global variables
let currentSlide = 0;
let slides = [];
let isTransitioning = false;
let autoSlideInterval;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication status
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user || null;
  
  await initializeApp();
  setupEventListeners();
  startAutoSlide();
});

async function initializeApp() {
  await loadRecentPosts();
  initMenu();
  setupSearch();
}

function setupSearch() {
  const searchInput = document.querySelector('#search-input');
  const searchResults = document.querySelector('#search-results');
  
  if (!searchInput) {
    console.warn('Search input element not found - search functionality disabled');
    return;
  }
  
  // Set up search functionality if elements exist
  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      if (searchResults) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
      }
      return;
    }
    
    // Debounce search
    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });
  
  // Hide results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && searchResults && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
}

async function performSearch(query) {
  const searchResults = document.querySelector('#search-results');
  if (!searchResults) return;
  
  try {
    // Search both archive and collab posts
    const { data: archivePosts, error: archiveError } = await supabase
      .from('archive_posts')
      .select(`
        *,
        users:user_id (
          email,
          raw_user_meta_data
        )
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
      .limit(5);

    const { data: collabPosts, error: collabError } = await supabase
      .from('collab_posts')
      .select(`
        *,
        users:user_id (
          email,
          raw_user_meta_data
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .limit(5);

    if (archiveError) console.error('Archive search error:', archiveError);
    if (collabError) console.error('Collab search error:', collabError);

    const allResults = [
      ...(archivePosts || []).map(post => ({ ...post, type: 'archive' })),
      ...(collabPosts || []).map(post => ({ ...post, type: 'collab' }))
    ];

    displaySearchResults(allResults, query);
  } catch (error) {
    console.error('Search error:', error);
    searchResults.innerHTML = '<div class="search-error">Search temporarily unavailable</div>';
    searchResults.style.display = 'block';
  }
}

function displaySearchResults(results, query) {
  const searchResults = document.querySelector('#search-results');
  if (!searchResults) return;
  
  if (results.length === 0) {
    searchResults.innerHTML = `<div class="no-results">No results found for "${query}"</div>`;
    searchResults.style.display = 'block';
    return;
  }
  
  const resultsHTML = results.map(post => {
    const authorName = post.users?.raw_user_meta_data?.display_name || 
                      post.users?.raw_user_meta_data?.full_name || 
                      post.users?.email?.split('@')[0] || 
                      'Anonymous';
    
    const isArchive = post.type === 'archive';
    const typeLabel = isArchive ? 'Archive' : 'Collab';
    
    return `
      <div class="search-result-item">
        <div class="search-result-header">
          <span class="search-result-type">${typeLabel}</span>
          <span class="search-result-author">${authorName}</span>
        </div>
        <h4 class="search-result-title">
          <a href="/view-post.html?id=${post.id}&type=${post.type}">${post.title}</a>
        </h4>
        <div class="search-result-preview">
          ${isArchive ? 
            (post.content ? post.content.substring(0, 100) + '...' : 'No preview available') :
            (post.description ? post.description.substring(0, 100) + '...' : 'No description available')
          }
        </div>
      </div>
    `;
  }).join('');
  
  searchResults.innerHTML = resultsHTML;
  searchResults.style.display = 'block';
}

async function loadRecentPosts() {
  try {
    // Fetch recent archive posts with user information
    const { data: archivePosts, error: archiveError } = await supabase
      .from('archive_posts')
      .select(`
        *,
        users:user_id (
          email,
          raw_user_meta_data
        )
      `)
      .order('created_at', { ascending: false })
      .limit(6);

    if (archiveError) throw archiveError;

    // Fetch recent collab posts with user information
    const { data: collabPosts, error: collabError } = await supabase
      .from('collab_posts')
      .select(`
        *,
        users:user_id (
          email,
          raw_user_meta_data
        )
      `)
      .order('created_at', { ascending: false })
      .limit(6);

    if (collabError) throw collabError;

    // Combine and shuffle posts
    const allPosts = [
      ...(archivePosts || []).map(post => ({ ...post, type: 'archive' })),
      ...(collabPosts || []).map(post => ({ ...post, type: 'collab' }))
    ];

    // Shuffle array
    for (let i = allPosts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPosts[i], allPosts[j]] = [allPosts[j], allPosts[i]];
    }

    slides = allPosts.slice(0, 8); // Take first 8 shuffled posts
    
    if (slides.length > 0) {
      createSlides();
      showSlide(0);
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    // Show fallback content
    createFallbackSlides();
  }
}

function showSlide(index) {
  if (isTransitioning || slides.length === 0) return;
  
  currentSlide = index;
  
  // Remove active class from all slides
  const allSlides = document.querySelectorAll('.slide');
  allSlides.forEach(slide => slide.classList.remove('active'));
  
  // Add active class to current slide
  const activeSlide = document.querySelector(`[data-slide="${index}"]`);
  if (activeSlide) {
    activeSlide.classList.add('active');
  }
  
  // Update slide indicators if they exist
  const indicators = document.querySelectorAll('.slide-indicator');
  indicators.forEach((indicator, i) => {
    indicator.classList.toggle('active', i === index);
  });
}

function createFallbackSlides() {
  const slidesContainer = document.querySelector('.slides-container');
  if (!slidesContainer) return;

  slidesContainer.innerHTML = `
    <div class="slide active" data-slide="0">
      <div class="slide-content">
        <div class="slide-header">
          <div class="slide-type">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
            NO POSTS AVAILABLE
          </div>
        </div>
        
        <h3 class="slide-title">Welcome to DeepWiki</h3>
        
        <div class="slide-preview">
          No posts are currently available. Be the first to share your AI insights or collaboration opportunities!
        </div>
        
        <div class="slide-actions">
          <a href="/publish.html" class="slide-view-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
            Create First Post
          </a>
        </div>
      </div>
    </div>
  `;
  
  slides = [{ id: 'fallback', title: 'Welcome to DeepWiki', type: 'fallback' }];
  currentSlide = 0;
}

function createSlides() {
  const slidesContainer = document.querySelector('.slides-container');
  if (!slidesContainer) return;

  slidesContainer.innerHTML = slides.map((post, index) => {
    // Get author name with proper fallback
    const authorName = post.users?.raw_user_meta_data?.display_name || 
                      post.users?.raw_user_meta_data?.full_name || 
                      post.users?.email?.split('@')[0] || 
                      'Anonymous';
    
    const isArchive = post.type === 'archive';
    const typeIcon = isArchive ? 
      '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>' :
      '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>';
    
    const typeLabel = isArchive ? 'ARCHIVE POST' : 'COLLAB POST';
    
    // Format content preview
    let contentPreview = '';
    if (isArchive) {
      if (post.embed_url) {
        contentPreview = 'AI-generated content available via embedded link';
      } else {
        contentPreview = post.content ? 
          (post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content) :
          'No content preview available';
      }
    } else {
      contentPreview = post.description ? 
        (post.description.length > 150 ? post.description.substring(0, 150) + '...' : post.description) :
        'No description available';
    }

    return `
      <div class="slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
        <div class="slide-content">
          <div class="slide-header">
            <div class="slide-type">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${typeIcon}
              </svg>
              ${typeLabel}
            </div>
            <div class="slide-meta">
              <span class="slide-author">👤 ${authorName}</span>
              <span class="slide-date">📅 ${new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <h3 class="slide-title">${post.title}</h3>
          
          <div class="slide-preview">
            ${contentPreview}
          </div>
          
          <div class="slide-tags">
            ${post.tags.slice(0, 3).map(tag => `<span class="slide-tag">${tag}</span>`).join('')}
            ${post.tags.length > 3 ? `<span class="slide-tag">+${post.tags.length - 3}</span>` : ''}
          </div>
          
          <div class="slide-actions">
            <a href="/view-post.html?id=${post.id}&type=${post.type}" class="slide-view-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h6v6"/>
                <path d="M10 14L21 3"/>
                <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11"/>
              </svg>
              View ${isArchive ? 'Insight' : 'Opportunity'}
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}