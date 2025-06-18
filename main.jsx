import { createClient } from '@supabase/supabase-js';
import { initMenu } from './src/utils/menu';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

document.querySelector('#app').innerHTML = `
  <div>
    <img 
      src="https://i.imgur.com/byFu3LE_d.png?maxwidth=520&shape=thumb&fidelity=high" 
      alt="Left Sliding Image" 
      class="sliding-image-left"
    >
    <img 
      src="https://i.imgur.com/zcLQ3gB.png" 
      alt="Middle Image" 
      class="middle-image"
    >
    <img 
      src="https://i.imgur.com/aMKDuRs.png" 
      alt="Right Sliding Image" 
      class="sliding-image-right"
    >
    <div class="menu-header">
      <img src="https://i.imgur.com/zcLQ3gB.png" alt="Menu Logo" class="menu-logo">
      <div class="nav-links">
        <div class="nav-container">
          <a href="/publish.html" class="nav-item publish-nav">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
            Publish
          </a>
          <a href="/collab.html" class="nav-item collab-nav">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            COLLAB
          </a>
          <a href="/index.html" class="nav-item archives-nav">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4v16a2 2 0 002 2h12a2 2 0 002-2V8.342a2 2 0 00-.602-1.43l-4.44-4.342A2 2 0 0013.56 2H6a2 2 0 00-2 2z"/>
              <path d="M14 2v4a2 2 0 002 2h4"/>
            </svg>
            ARCHIVES
          </a>
        </div>
      </div>
    </div>
    <div class="menu-overlay"></div>
    <div class="menu-options">
      <div class="menu-top">
      </div>
      <div class="auth-section">
        <a href="/login.html" class="sign-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Sign in
        </a>
        <a href="/login.html?tab=signup" class="sign-up">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Sign up
        </a>
        <a href="#" class="logout" style="display: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </a>
      </div>
      <div class="recent-searches">
        <h3>Recent Searches</h3>
        <div class="empty-state">Empty</div>
        <button class="show-more">
          Show more
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>
      <div class="menu-footer">
        <a href="/profile.html" class="menu-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="10" r="3"/>
            <path d="M12 13c-2.761 0-5 1.79-5 4v1h10v-1c0-2.21-2.239-4-5-4z"/>
          </svg>
          My Profile
        </a>
        <a href="/favorites.html" class="menu-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Favorites
        </a>
        <a href="/activity.html" class="menu-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Activity
        </a>
        <a href="/settings.html" class="menu-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
          </svg>
          Settings
        </a>
        <a href="/help.html" class="menu-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          Help
        </a>
      </div>
    </div>
    <img 
      src="https://i.imgur.com/MQYLMSS.png" 
      alt="Top Center Image" 
      class="top-center-image"
    >
    <div class="search-container">
      <div class="search-bar">
        <input type="text" placeholder="Search DeepWiki.io Open AI Archives" id="search-input">
        <img src="https://raw.githubusercontent.com/primer/octicons/main/icons/search-16.svg" alt="Search" class="search-icon">
      </div>
      <div class="search-buttons">
        <button class="search-button" id="search-archive-btn">Search</button>
        <button class="search-button" id="browse-button">Browse</button>
      </div>
    </div>

    <!-- Knowledge Spectrum Preview Carousel -->
    <div class="knowledge-carousel-container">
      <div class="carousel-header">
        <h2 id="carousel-title">Knowledge Spotlights</h2>
        <p id="carousel-subtitle" class="carousel-subtitle">Discover Popular Topics</p>
      </div>
      <div class="knowledge-carousel">
        <div class="carousel-track" id="carousel-track">
          <!-- Real posts will be loaded here dynamically -->
        </div>
      </div>
    </div>

    <!-- Carousel Navigation - Moved above footer and centered -->
    <div class="carousel-navigation-container">
      <div class="carousel-navigation">
        <button class="carousel-nav-btn" id="prev-btn">‹</button>
        <button class="carousel-nav-btn" id="next-btn">›</button>
      </div>
    </div>
    
    <!-- Archive Search Results Container with Visible Filters -->
    <div id="archive-results-container" class="archive-results-container">
      <div class="search-results-header">
        <h2>Search Results</h2>
        <button id="close-search" class="close-search-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- FILTERS SECTION - HIGHLY VISIBLE -->
      <div class="search-filters-section">
        <div class="filters-toggle">
          <button class="toggle-filters-btn" id="toggle-filters">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <span id="filters-toggle-text">Show Filters</span>
          </button>
        </div>
        
        <div class="search-filters collapsed" id="search-filters">
          <div class="filters-grid">
            <!-- AI Model Filter -->
            <div class="filter-group">
              <h4>🤖 AI Model</h4>
              <div class="filter-options">
                <label>
                  <input type="checkbox" name="ai-model" value="gpt-4">
                  GPT-4 & Variants
                </label>
                <label>
                  <input type="checkbox" name="ai-model" value="claude">
                  Claude Models
                </label>
                <label>
                  <input type="checkbox" name="ai-model" value="gemini">
                  Gemini/Bard
                </label>
                <label>
                  <input type="checkbox" name="ai-model" value="other">
                  Other Models
                </label>
              </div>
            </div>
            
            <!-- Content Type Filter -->
            <div class="filter-group">
              <h4>📄 Content Type</h4>
              <div class="filter-options">
                <label>
                  <input type="radio" name="content-type" value="all" checked>
                  All Content
                </label>
                <label>
                  <input type="radio" name="content-type" value="text">
                  Text Only
                </label>
                <label>
                  <input type="radio" name="content-type" value="embedded">
                  Embedded Links
                </label>
              </div>
            </div>
            
            <!-- Date Range Filter -->
            <div class="filter-group">
              <h4>📅 Date Range</h4>
              <div class="date-inputs">
                <input type="date" name="date-from" placeholder="From">
                <input type="date" name="date-to" placeholder="To">
              </div>
            </div>
            
            <!-- View Count Filter -->
            <div class="filter-group">
              <h4>👁️ View Count</h4>
              <div class="filter-range">
                <input type="number" name="views-min" placeholder="Min" min="0">
                <span>to</span>
                <input type="number" name="views-max" placeholder="Max" min="0">
              </div>
            </div>
          </div>
          
          <div class="filter-actions">
            <button class="clear-filters-btn" id="clear-search-filters">Clear Filters</button>
            <button class="apply-filters-btn" id="apply-search-filters">Apply Filters</button>
          </div>
        </div>
      </div>
      
      <div id="search-results" class="search-results">
        <p class="empty-state">Enter a search term to find posts</p>
      </div>
      <div id="search-loading" class="search-loading" style="display: none;">
        <p>Searching...</p>
      </div>
    </div>
  </div>
`;

// Initialize all the interactive elements
const middleImage = document.querySelector('.middle-image');
const menuHeader = document.querySelector('.menu-header');
const topCenterImage = document.querySelector('.top-center-image');
const searchContainer = document.querySelector('.search-container');
const knowledgeCarousel = document.querySelector('.knowledge-carousel-container');
const carouselNavigationContainer = document.querySelector('.carousel-navigation-container');
const footer = document.querySelector('.footer');

// Search elements
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-archive-btn');
const browseButton = document.querySelector('#browse-button');
const archiveResultsContainer = document.querySelector('#archive-results-container');
const searchResults = document.querySelector('#search-results');
const searchLoading = document.querySelector('#search-loading');
const closeSearchBtn = document.querySelector('#close-search');

// Filter elements
const toggleFiltersBtn = document.querySelector('#toggle-filters');
const searchFilters = document.querySelector('#search-filters');
const filtersToggleText = document.querySelector('#filters-toggle-text');
const clearFiltersBtn = document.querySelector('#clear-search-filters');
const applyFiltersBtn = document.querySelector('#apply-search-filters');

// Global filter state
let currentFilters = {
  aiModel: [],
  contentType: 'all',
  dateFrom: '',
  dateTo: '',
  viewsMin: '',
  viewsMax: ''
};

// Carousel elements
const carouselTrack = document.querySelector('#carousel-track');
const carouselTitle = document.querySelector('#carousel-title');
const carouselSubtitle = document.querySelector('#carousel-subtitle');
const prevBtn = document.querySelector('#prev-btn');
const nextBtn = document.querySelector('#next-btn');

// Use the central menu initialization function
initMenu();

// Update the footer links
document.querySelector('.footer-links').innerHTML = `
  <a href="/info-hub.html">Contributor Guidelines</a>
  <a href="/info-hub.html#terms">Terms</a>
  <a href="/info-hub.html#privacy-policy">Privacy Policy</a>
  <a href="/info-hub.html#copyright-notice">Copyright Notice</a>
  <a href="/contact.html">Contact Us</a>
  <a href="/support.html">Support DeepWiki.io</a>
`;

// Add Bolt badge only on archive or collab pages - initially hidden
const pathname = window.location.pathname;
const isArchivePage = pathname === '/' || pathname === '/index.html';
const isCollabPage = pathname === '/collab.html';

let boltBadge = null;
if ((isArchivePage || isCollabPage) && !document.querySelector('.bolt-badge-fixed')) {
  boltBadge = document.createElement('a');
  boltBadge.href = 'https://bolt.new';
  boltBadge.className = 'bolt-badge-fixed';
  boltBadge.target = '_blank';
  boltBadge.rel = 'noopener noreferrer';
  boltBadge.innerHTML = '<img src="https://i.imgur.com/T1yHmKN.png" alt="Built with Bolt" />';
  boltBadge.style.opacity = '0'; // Initially hidden
  document.body.appendChild(boltBadge);
}

const navItems = document.querySelectorAll('.nav-item');

// Carousel State Management
let currentCarouselType = 'archive'; // 'archive' or 'collab'
let currentSlide = 2; // Start with the middle card (index 2) as active
let archivePosts = [];
let collabPosts = [];

// Filter Toggle Functionality
toggleFiltersBtn.addEventListener('click', () => {
  const isCollapsed = searchFilters.classList.contains('collapsed');
  
  if (isCollapsed) {
    searchFilters.classList.remove('collapsed');
    filtersToggleText.textContent = 'Hide Filters';
  } else {
    searchFilters.classList.add('collapsed');
    filtersToggleText.textContent = 'Show Filters';
  }
});

// Clear Filters
clearFiltersBtn.addEventListener('click', () => {
  // Reset all filter inputs
  document.querySelectorAll('input[name="ai-model"]').forEach(cb => cb.checked = false);
  document.querySelector('input[name="content-type"][value="all"]').checked = true;
  document.querySelector('input[name="date-from"]').value = '';
  document.querySelector('input[name="date-to"]').value = '';
  document.querySelector('input[name="views-min"]').value = '';
  document.querySelector('input[name="views-max"]').value = '';
  
  // Reset global filter state
  currentFilters = {
    aiModel: [],
    contentType: 'all',
    dateFrom: '',
    dateTo: '',
    viewsMin: '',
    viewsMax: ''
  };
  
  // Re-run search with cleared filters
  if (searchInput.value.trim()) {
    performSearch();
  }
});

// Apply Filters
applyFiltersBtn.addEventListener('click', () => {
  updateCurrentFilters();
  if (searchInput.value.trim()) {
    performSearch();
  }
});

// Update current filters from form inputs
function updateCurrentFilters() {
  // AI Model filters
  const aiModelCheckboxes = document.querySelectorAll('input[name="ai-model"]:checked');
  currentFilters.aiModel = Array.from(aiModelCheckboxes).map(cb => cb.value);
  
  // Content type
  const contentTypeRadio = document.querySelector('input[name="content-type"]:checked');
  currentFilters.contentType = contentTypeRadio ? contentTypeRadio.value : 'all';
  
  // Date range
  currentFilters.dateFrom = document.querySelector('input[name="date-from"]').value;
  currentFilters.dateTo = document.querySelector('input[name="date-to"]').value;
  
  // View count
  currentFilters.viewsMin = document.querySelector('input[name="views-min"]').value;
  currentFilters.viewsMax = document.querySelector('input[name="views-max"]').value;
}

// Load real posts from database - Fixed to handle RLS policies properly
async function loadCarouselData() {
  try {
    // Load archive posts without joining users table to avoid RLS issues
    const { data: archiveData, error: archiveError } = await supabase
      .from('archive_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (archiveError) {
      console.error('Archive error:', archiveError);
      throw archiveError;
    }

    // Load collab posts without joining users table to avoid RLS issues
    const { data: collabData, error: collabError } = await supabase
      .from('collab_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (collabError) {
      console.error('Collab error:', collabError);
      throw collabError;
    }

    // Get favorite counts for each post (these queries should work with public access)
    if (archiveData) {
      for (let post of archiveData) {
        try {
          const { data: favData } = await supabase
            .from('user_favorites')
            .select('id')
            .eq('post_id', post.id)
            .eq('post_type', 'archive');
          post.favorite_count = favData ? favData.length : 0;
        } catch (favError) {
          console.warn('Could not load favorite count for archive post:', post.id, favError);
          post.favorite_count = 0;
        }
      }
    }

    if (collabData) {
      for (let post of collabData) {
        try {
          const { data: favData } = await supabase
            .from('user_favorites')
            .select('id')
            .eq('post_id', post.id)
            .eq('post_type', 'collab');
          post.favorite_count = favData ? favData.length : 0;
        } catch (favError) {
          console.warn('Could not load favorite count for collab post:', post.id, favError);
          post.favorite_count = 0;
        }
      }
    }

    archivePosts = archiveData || [];
    collabPosts = collabData || [];

    // Initialize carousel with real data
    updateCarouselContent();
  } catch (error) {
    console.error('Error loading carousel data:', error);
    // Fallback to empty carousel with helpful message
    archivePosts = [];
    collabPosts = [];
    updateCarouselContent();
  }
}

// Initialize carousel based on current page
function initializeCarousel() {
  const isCollab = document.querySelector('.collab-nav').classList.contains('active');
  currentCarouselType = isCollab ? 'collab' : 'archive';
  loadCarouselData();
}

// Update carousel content based on type
function updateCarouselContent() {
  const carouselTrack = document.querySelector('#carousel-track');
  
  if (currentCarouselType === 'archive') {
    carouselTitle.textContent = 'Knowledge Spotlights';
    carouselSubtitle.textContent = 'Discover Popular Topics';
    renderArchiveCards();
  } else {
    carouselTitle.textContent = 'Vibe Task Feed';
    carouselSubtitle.textContent = 'Discover latest Collab shared';
    renderCollabCards();
  }

  currentSlide = Math.min(2, getVisibleCards().length - 1); // Reset to middle card or last if fewer cards
  updateCarouselPosition();
}

// Render archive cards with real data - Updated to not depend on user data
function renderArchiveCards() {
  const carouselTrack = document.querySelector('#carousel-track');
  
  if (archivePosts.length === 0) {
    carouselTrack.innerHTML = `
      <div class="knowledge-card archive-card" data-type="archive">
        <div class="card-header">
          <div class="card-author">
            <span class="author-name">DeepWiki Team</span>
          </div>
          <div class="card-metrics">
            <span class="view-count">0 views</span>
            <span class="favorite-count">❤️ 0</span>
          </div>
        </div>
        <div class="card-prompt">
          <strong>Prompt:</strong> Get started with DeepWiki.io
        </div>
        <h3>No Archive Posts Yet</h3>
        <div class="card-content-preview">
          Be the first to share your AI insights! Click "Publish" to add your content to the archive and help build our community knowledge base.
        </div>
        <div class="card-footer">
          <div class="card-tags">
            <span class="tag">getting started</span>
          </div>
          <div class="card-meta">
            <span class="post-date">📅 Today</span>
            <span class="ai-model">🤖 Community</span>
          </div>
        </div>
      </div>
    `;
    return;
  }

  carouselTrack.innerHTML = archivePosts.map(post => {
    // Format dates
    const postDate = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const genDate = post.generation_date ? 
      new Date(post.generation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
      postDate;
    
    // Use anonymous author since we can't safely access user data
    const authorName = post.users?.raw_user_meta_data?.display_name || 
                      post.users?.raw_user_meta_data?.full_name || 
                      (post.users?.email ? post.users.email.split('@')[0] : 'Anonymous');
    
    // Truncate content for preview (doubled size as requested)
    const contentPreview = post.content ? 
      (post.content.length > 300 ? post.content.substring(0, 300) + '...' : post.content) :
      'Content available via embedded link';

    // Truncate prompt for display
    const promptPreview = (post.prompt_is_public !== false && post.prompt) ? 
      (post.prompt.length > 100 ? post.prompt.substring(0, 100) + '...' : post.prompt) :
      null;

    return `
      <div class="knowledge-card archive-card" data-type="archive" data-post-id="${post.id}">
        <div class="card-header">
          <div class="card-author">
            <span class="author-name">👤 ${authorName}</span>
          </div>
          <div class="card-metrics">
            <span class="view-count">${post.views || 0} views</span>
            <span class="favorite-count">❤️ ${post.favorite_count || 0}</span>
          </div>
        </div>
        ${promptPreview ? `
          <div class="card-prompt">
            <strong>Prompt:</strong> ${promptPreview}
          </div>
        ` : ''}
        <h3>${post.title}</h3>
        <div class="card-content-preview">
          ${contentPreview}
        </div>
        <div class="card-footer">
          <div class="card-tags">
            ${post.tags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
            ${post.tags.length > 2 ? `<span class="tag">+${post.tags.length - 2}</span>` : ''}
          </div>
          <div class="card-meta">
            <span class="post-date">📅 ${genDate}</span>
            <span class="ai-model">🤖 ${post.ai_model}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render collab cards with real data - Updated to not depend on user data
function renderCollabCards() {
  const carouselTrack = document.querySelector('#carousel-track');
  
  if (collabPosts.length === 0) {
    carouselTrack.innerHTML = `
      <div class="knowledge-card collab-card" data-type="collab">
        <div class="card-header">
          <div class="card-author">
            <span class="author-name">DeepWiki Community</span>
          </div>
          <div class="card-metrics">
            <span class="view-count">0 views</span>
            <span class="favorite-count">❤️ 0</span>
          </div>
        </div>
        <h3>No Collaboration Posts Yet</h3>
        <div class="card-content-preview">
          Start connecting with the community! Share your collaboration ideas or skills to find like-minded people and build amazing projects together.
        </div>
        <div class="card-footer">
          <div class="card-tags">
            <span class="tag">networking</span>
          </div>
          <div class="card-meta">
            <span class="post-date">📅 Today</span>
            <span class="collab-type">🤝 Community</span>
          </div>
        </div>
      </div>
    `;
    return;
  }

  carouselTrack.innerHTML = collabPosts.map(post => {
    // Format date
    const postDate = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Use anonymous author since we can't safely access user data
    const authorName = post.users?.raw_user_meta_data?.display_name || 
                      post.users?.raw_user_meta_data?.full_name || 
                      (post.users?.email ? post.users.email.split('@')[0] : 'Anonymous');
    
    // Truncate description for preview
    const descriptionPreview = post.description ? 
      (post.description.length > 200 ? post.description.substring(0, 200) + '...' : post.description) :
      'No description available';

    return `
      <div class="knowledge-card collab-card" data-type="collab" data-post-id="${post.id}">
        <div class="card-header">
          <div class="card-author">
            <span class="author-name">👤 ${authorName}</span>
          </div>
          <div class="card-metrics">
            <span class="view-count">${post.views || 0} views</span>
            <span class="favorite-count">❤️ ${post.favorite_count || 0}</span>
          </div>
        </div>
        <h3>${post.title}</h3>
        <div class="card-content-preview">
          ${descriptionPreview}
        </div>
        <div class="card-footer">
          <div class="card-tags">
            ${post.tags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
            ${post.tags.length > 2 ? `<span class="tag">+${post.tags.length - 2}</span>` : ''}
          </div>
          <div class="card-meta">
            <span class="post-date">📅 ${postDate}</span>
            <span class="collab-type">🤝 ${post.type}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Get visible cards
function getVisibleCards() {
  return document.querySelectorAll('.knowledge-card');
}

// Update carousel position
function updateCarouselPosition() {
  const cards = getVisibleCards();
  if (cards.length === 0) return;

  cards.forEach((card, index) => {
    card.classList.remove('active', 'prev', 'next');
    
    if (index === currentSlide) {
      card.classList.add('active');
    } else if (index === currentSlide - 1) {
      card.classList.add('prev');
    } else if (index === currentSlide + 1) {
      card.classList.add('next');
    }
  });
}

// Carousel navigation
prevBtn.addEventListener('click', () => {
  const cards = getVisibleCards();
  if (cards.length === 0) return;
  
  currentSlide = currentSlide > 0 ? currentSlide - 1 : cards.length - 1;
  updateCarouselPosition();
});

nextBtn.addEventListener('click', () => {
  const cards = getVisibleCards();
  if (cards.length === 0) return;
  
  currentSlide = currentSlide < cards.length - 1 ? currentSlide + 1 : 0;
  updateCarouselPosition();
});

// Search functionality
async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  searchLoading.style.display = 'block';
  searchResults.innerHTML = '';
  archiveResultsContainer.style.display = 'block';

  try {
    let searchQuery = supabase
      .from('archive_posts')
      .select('*')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%, tags.cs.{${query}}`);

    // Apply filters
    if (currentFilters.aiModel.length > 0) {
      const aiModelFilter = currentFilters.aiModel.map(model => {
        if (model === 'gpt-4') return 'ai_model.ilike.%gpt-4%';
        if (model === 'claude') return 'ai_model.ilike.%claude%';
        if (model === 'gemini') return 'ai_model.ilike.%gemini%,ai_model.ilike.%bard%';
        return `ai_model.ilike.%${model}%`;
      }).join(',');
      searchQuery = searchQuery.or(aiModelFilter);
    }

    if (currentFilters.contentType === 'text') {
      searchQuery = searchQuery.is('embed_url', null);
    } else if (currentFilters.contentType === 'embedded') {
      searchQuery = searchQuery.not('embed_url', 'is', null);
    }

    if (currentFilters.dateFrom) {
      searchQuery = searchQuery.gte('generation_date', currentFilters.dateFrom);
    }
    if (currentFilters.dateTo) {
      searchQuery = searchQuery.lte('generation_date', currentFilters.dateTo);
    }

    if (currentFilters.viewsMin) {
      searchQuery = searchQuery.gte('views', parseInt(currentFilters.viewsMin));
    }
    if (currentFilters.viewsMax) {
      searchQuery = searchQuery.lte('views', parseInt(currentFilters.viewsMax));
    }

    const { data, error } = await searchQuery.order('created_at', { ascending: false });

    if (error) throw error;

    displaySearchResults(data || []);
  } catch (error) {
    console.error('Search error:', error);
    searchResults.innerHTML = '<p class="error">Search failed. Please try again.</p>';
  } finally {
    searchLoading.style.display = 'none';
  }
}

// Display search results
function displaySearchResults(posts) {
  if (posts.length === 0) {
    searchResults.innerHTML = '<p class="empty-state">No posts found matching your search.</p>';
    return;
  }

  searchResults.innerHTML = posts.map(post => {
    const postDate = new Date(post.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const contentPreview = post.content ? 
      (post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content) :
      'Content available via embedded link';

    return `
      <div class="search-result-item" data-post-id="${post.id}">
        <div class="result-header">
          <h3>${post.title}</h3>
          <div class="result-metrics">
            <span class="view-count">${post.views || 0} views</span>
          </div>
        </div>
        <div class="result-content">
          ${contentPreview}
        </div>
        <div class="result-footer">
          <div class="result-tags">
            ${post.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <div class="result-meta">
            <span class="post-date">📅 ${postDate}</span>
            <span class="ai-model">🤖 ${post.ai_model}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Event listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

closeSearchBtn.addEventListener('click', () => {
  archiveResultsContainer.style.display = 'none';
  searchInput.value = '';
});

browseButton.addEventListener('click', () => {
  window.location.href = '/browse-archive.html';
});

// Initialize carousel on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeCarousel();
});