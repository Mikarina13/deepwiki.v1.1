import { createClient } from '@supabase/supabase-js';
import { initMenu } from './src/utils/menu';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Function to get author name from user data
function getAuthorName(users) {
  if (!users) return 'Anonymous';
  
  // Try display_name first (from settings/profile)
  if (users.raw_user_meta_data?.display_name) {
    return users.raw_user_meta_data.display_name;
  }
  
  // Try full_name (from OAuth providers like Google)
  if (users.raw_user_meta_data?.full_name) {
    return users.raw_user_meta_data.full_name;
  }
  
  // Try name (alternative OAuth field)
  if (users.raw_user_meta_data?.name) {
    return users.raw_user_meta_data.name;
  }
  
  // Fall back to email username part
  if (users.email) {
    return users.email.split('@')[0];
  }
  
  return 'Anonymous User';
}

// Function to create archive card
function createArchiveCard(post) {
  const authorName = getAuthorName(post.users);
  
  return `
    <div class="knowledge-card archive-card" data-post-id="${post.id}">
      <div class="card-header">
        <div class="card-author">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="author-name">${authorName}</span>
        </div>
        <div class="card-views">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>${post.views || 0} views</span>
        </div>
      </div>
      <h3 class="card-title">${post.title}</h3>
      <div class="card-meta">
        <span class="ai-model">🤖 ${post.ai_model}</span>
        <span class="post-date">📅 ${new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      <div class="card-tags">
        ${post.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
        ${post.tags.length > 3 ? `<span class="tag-more">+${post.tags.length - 3}</span>` : ''}
      </div>
    </div>
  `;
}

// Function to create collab card
function createCollabCard(post) {
  const authorName = getAuthorName(post.users);
  const typeDisplay = post.type === 'request' ? 'Looking for Collaboration' : 'Offering to Collaborate';
  const typeIcon = post.type === 'request' ? '🔍' : '🎯';
  
  return `
    <div class="knowledge-card collab-card" data-post-id="${post.id}">
      <div class="card-header">
        <div class="card-author">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="author-name">${authorName}</span>
        </div>
        <div class="card-views">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>${post.views || 0} views</span>
        </div>
      </div>
      <h3 class="card-title">${post.title}</h3>
      <div class="card-meta">
        <span class="collab-type">${typeIcon} ${typeDisplay}</span>
        <span class="post-date">📅 ${new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      <div class="card-tags">
        ${post.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
        ${post.tags.length > 3 ? `<span class="tag-more">+${post.tags.length - 3}</span>` : ''}
      </div>
    </div>
  `;
}

// Global variables
let currentSlide = 0;
let isTransitioning = false;
let autoSlideInterval;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize menu
  initMenu();
  
  // Check authentication status
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user || null;
  
  // Load initial content
  await loadKnowledgeSpotlights();
  
  // Setup search functionality
  setupSearch();
  
  // Setup navigation
  setupNavigation();
  
  // Start auto-slide
  startAutoSlide();
});

// Load knowledge spotlights
async function loadKnowledgeSpotlights() {
  try {
    // Load recent archive posts
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

    // Load recent collab posts
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

    // Take first 8 posts for carousel
    const carouselPosts = allPosts.slice(0, 8);
    
    displayKnowledgeSpotlights(carouselPosts);
    
  } catch (error) {
    console.error('Error loading knowledge spotlights:', error);
    showErrorState();
  }
}

// Display knowledge spotlights
function displayKnowledgeSpotlights(posts) {
  const container = document.querySelector('.knowledge-carousel');
  if (!container) return;

  if (posts.length === 0) {
    container.innerHTML = `
      <div class="empty-spotlight">
        <h3>No content available yet</h3>
        <p>Be the first to share your AI insights!</p>
        <a href="/publish.html" class="cta-button">Share Your Insight</a>
      </div>
    `;
    return;
  }

  // Create slides
  const slides = [];
  for (let i = 0; i < posts.length; i += 2) {
    const slide = posts.slice(i, i + 2);
    slides.push(slide);
  }

  container.innerHTML = `
    <div class="carousel-container">
      <div class="carousel-slides" id="carousel-slides">
        ${slides.map((slide, index) => `
          <div class="carousel-slide ${index === 0 ? 'active' : ''}">
            <div class="slide-content">
              ${slide.map(post => 
                post.type === 'archive' 
                  ? createArchiveCard(post)
                  : createCollabCard(post)
              ).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="carousel-controls">
        <button class="carousel-btn prev-btn" id="prev-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        <div class="carousel-indicators">
          ${slides.map((_, index) => `
            <button class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>
          `).join('')}
        </div>
        <button class="carousel-btn next-btn" id="next-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Setup carousel controls
  setupCarouselControls(slides.length);
  
  // Add click handlers to cards
  setupCardClickHandlers();
}

// Setup carousel controls
function setupCarouselControls(totalSlides) {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const indicators = document.querySelectorAll('.indicator');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (!isTransitioning) {
        previousSlide(totalSlides);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!isTransitioning) {
        nextSlide(totalSlides);
      }
    });
  }

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      if (!isTransitioning && index !== currentSlide) {
        goToSlide(index, totalSlides);
      }
    });
  });
}

// Carousel navigation functions
function nextSlide(totalSlides) {
  if (isTransitioning) return;
  
  isTransitioning = true;
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
  
  setTimeout(() => {
    isTransitioning = false;
  }, 500);
}

function previousSlide(totalSlides) {
  if (isTransitioning) return;
  
  isTransitioning = true;
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateCarousel();
  
  setTimeout(() => {
    isTransitioning = false;
  }, 500);
}

function goToSlide(slideIndex, totalSlides) {
  if (isTransitioning || slideIndex === currentSlide) return;
  
  isTransitioning = true;
  currentSlide = slideIndex;
  updateCarousel();
  
  setTimeout(() => {
    isTransitioning = false;
  }, 500);
}

function updateCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.indicator');

  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentSlide);
  });

  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentSlide);
  });
}

// Auto-slide functionality
function startAutoSlide() {
  autoSlideInterval = setInterval(() => {
    const totalSlides = document.querySelectorAll('.carousel-slide').length;
    if (totalSlides > 1 && !isTransitioning) {
      nextSlide(totalSlides);
    }
  }, 5000); // Change slide every 5 seconds
}

function stopAutoSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
}

// Setup card click handlers
function setupCardClickHandlers() {
  const cards = document.querySelectorAll('.knowledge-card');
  
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const postId = card.dataset.postId;
      const isArchive = card.classList.contains('archive-card');
      const postType = isArchive ? 'archive' : 'collab';
      
      // Increment view count and navigate
      incrementViewCount(postId, postType);
      window.location.href = `/view-post.html?id=${postId}&type=${postType}`;
    });
  });
}

// Increment view count
async function incrementViewCount(postId, postType) {
  try {
    const table = postType === 'archive' ? 'archive_posts' : 'collab_posts';
    
    const { data: currentPost, error: selectError } = await supabase
      .from(table)
      .select('views')
      .eq('id', postId)
      .single();
    
    if (!selectError) {
      const newViewCount = (currentPost.views || 0) + 1;
      await supabase
        .from(table)
        .update({ views: newViewCount })
        .eq('id', postId);
    }
  } catch (error) {
    console.error('Error updating view count:', error);
  }
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchButton = document.querySelector('.search-button');
  const browseButton = document.querySelector('.browse-button');
  const resultsContainer = document.getElementById('archive-results-container');
  const searchResults = document.getElementById('search-results');
  const searchLoading = document.getElementById('search-loading');
  const closeSearchBtn = document.getElementById('close-search');

  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }

  if (browseButton) {
    browseButton.addEventListener('click', () => {
      window.location.href = '/browse-archive.html';
    });
  }

  if (closeSearchBtn) {
    closeSearchBtn.addEventListener('click', () => {
      resultsContainer.style.display = 'none';
    });
  }

  async function performSearch() {
    const query = searchInput?.value?.trim();
    if (!query) return;

    // Show results container
    if (resultsContainer) {
      resultsContainer.style.display = 'block';
    }

    // Show loading
    if (searchLoading) {
      searchLoading.style.display = 'block';
    }
    if (searchResults) {
      searchResults.style.display = 'none';
    }

    try {
      const { data: posts, error } = await supabase
        .from('archive_posts')
        .select(`
          *,
          users:user_id (
            email,
            raw_user_meta_data
          )
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      displaySearchResults(posts || []);

    } catch (error) {
      console.error('Search error:', error);
      if (searchResults) {
        searchResults.innerHTML = '<p class="empty-state">Search failed. Please try again.</p>';
      }
    } finally {
      if (searchLoading) {
        searchLoading.style.display = 'none';
      }
      if (searchResults) {
        searchResults.style.display = 'block';
      }
    }
  }

  function displaySearchResults(posts) {
    if (!searchResults) return;

    if (posts.length === 0) {
      searchResults.innerHTML = '<p class="empty-state">No results found</p>';
      return;
    }

    searchResults.innerHTML = posts.map(post => {
      const authorName = getAuthorName(post.users);
      
      return `
        <div class="search-result-item" data-post-id="${post.id}">
          <h4>${post.title}</h4>
          <p class="result-meta">
            <span>👤 ${authorName}</span>
            <span>•</span>
            <span>🤖 ${post.ai_model}</span>
            <span>•</span>
            <span>📅 ${new Date(post.created_at).toLocaleDateString()}</span>
          </p>
          <p class="result-preview">
            ${post.content ? 
              (post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content) :
              'AI-generated content available via link'
            }
          </p>
          <div class="result-tags">
            ${post.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers to search results
    const resultItems = searchResults.querySelectorAll('.search-result-item');
    resultItems.forEach(item => {
      item.addEventListener('click', () => {
        const postId = item.dataset.postId;
        incrementViewCount(postId, 'archive');
        window.location.href = `/view-post.html?id=${postId}&type=archive`;
      });
    });
  }
}

// Setup navigation
function setupNavigation() {
  // Pause auto-slide when user interacts with carousel
  const carouselContainer = document.querySelector('.carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);
  }
}

// Show error state
function showErrorState() {
  const container = document.querySelector('.knowledge-carousel');
  if (container) {
    container.innerHTML = `
      <div class="error-state">
        <h3>Unable to load content</h3>
        <p>Please try refreshing the page</p>
        <button onclick="window.location.reload()" class="retry-button">Retry</button>
      </div>
    `;
  }
}