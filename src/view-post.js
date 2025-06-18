import { createClient } from '@supabase/supabase-js';
import { initMenu } from './utils/menu.js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

let currentUser = null;
let currentPost = null;
let currentPostType = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the simplified menu for the spinning logo
  initSimplifiedMenu();
  
  // Check authentication status
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user || null;
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const postType = urlParams.get('type');
  
  const postContentContainer = document.getElementById('post-content');
  
  if (!postId || !postType) {
    showError('Invalid post parameters. Please try again.');
    return;
  }
  
  currentPostType = postType;
  
  // Setup close button
  setupCloseButton();
  
  try {
    await loadAndDisplayPost(postId, postType, postContentContainer);
  } catch (error) {
    console.error('Error loading post:', error);
    showError('Failed to load post. Please try again.');
  }
});

function initSimplifiedMenu() {
  const menuLogo = document.querySelector('.menu-logo');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuOptions = document.querySelector('.menu-options');
  const leftEdgeTrigger = document.querySelector('.left-edge-trigger');
  const hamburgerIcon = document.querySelector('.menu-hamburger-indicator');
  
  let isMenuLockedOpen = false;
  
  // Helper functions for opening and closing the menu
  function openMenu() {
    menuOptions.classList.add('active');
    menuOverlay.classList.add('active');
  }

  function closeMenu() {
    menuOptions.classList.remove('active');
    menuOverlay.classList.remove('active');
  }
  
  // Function to animate the menu icon
  function animateMenuIcon() {
    menuLogo.classList.add('spinning');
    menuLogo.addEventListener('animationend', () => {
      menuLogo.classList.remove('spinning');
    }, { once: true });
  }

  // Menu toggle functionality
  menuLogo.addEventListener('click', () => {
    animateMenuIcon();
    
    if (menuOptions.classList.contains('active')) {
      isMenuLockedOpen = false;
      closeMenu();
    } else {
      openMenu();
      isMenuLockedOpen = true;
    }
  });

  menuOverlay.addEventListener('click', () => {
    isMenuLockedOpen = false;
    closeMenu();
  });

  // Add hover functionality to left edge trigger
  leftEdgeTrigger.addEventListener('mouseenter', () => {
    if (!isMenuLockedOpen) {
      openMenu();
    }
  });

  // Make sure menu doesn't close when hovering over hamburger indicator
  hamburgerIcon.addEventListener('mouseenter', () => {
    if (!isMenuLockedOpen) {
      openMenu();
    }
  });

  // Handle mouse leaving the menu
  menuOptions.addEventListener('mouseleave', (e) => {
    if (e.relatedTarget !== leftEdgeTrigger && e.relatedTarget !== hamburgerIcon && !isMenuLockedOpen) {
      closeMenu();
    }
  });

  // Update auth section based on current user
  updateAuthSection();
}

async function updateAuthSection() {
  const { data: { session } } = await supabase.auth.getSession();
  const signInLink = document.querySelector('.sign-in');
  const signUpLink = document.querySelector('.sign-up');
  const logoutLink = document.querySelector('.logout');
  
  if (session) {
    if (signInLink) signInLink.style.display = 'none';
    if (signUpLink) signUpLink.style.display = 'none';
    if (logoutLink) {
      logoutLink.style.display = 'flex';
      logoutLink.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          window.location.href = '/';
        } catch (error) {
          alert(error.message);
        }
      });
    }
  } else {
    if (signInLink) signInLink.style.display = 'flex';
    if (signUpLink) signUpLink.style.display = 'flex';
    if (logoutLink) logoutLink.style.display = 'none';
  }
}

function setupCloseButton() {
  const closeBtn = document.getElementById('close-post-btn');
  closeBtn.addEventListener('click', () => {
    // Go back to previous page or home
    if (document.referrer && document.referrer !== window.location.href) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  });
}

async function loadAndDisplayPost(postId, postType, container) {
  try {
    let post;
    
    if (postType === 'archive') {
      const { data, error } = await supabase
        .from('archive_posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      if (error) throw error;
      post = data;
    } else if (postType === 'collab') {
      const { data, error } = await supabase
        .from('collab_posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      if (error) throw error;
      post = data;
    } else {
      throw new Error('Invalid post type');
    }
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    currentPost = post;
    
    // Increment view count
    await incrementViewCount(postId, postType);
    
    // Display the post
    if (postType === 'archive') {
      await displayArchivePost(post, container);
    } else {
      await displayCollabPost(post, container);
    }
    
  } catch (error) {
    console.error('Error fetching post:', error);
    showError('Post not found or no longer available.');
  }
}

async function incrementViewCount(postId, postType) {
  try {
    const table = postType === 'archive' ? 'archive_posts' : 'collab_posts';
    
    // Get current view count
    const { data: currentPost, error: selectError } = await supabase
      .from(table)
      .select('views')
      .eq('id', postId)
      .single();
    
    if (!selectError) {
      // Increment and update
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

async function displayArchivePost(post, container) {
  // Check if prompt should be displayed (backward compatibility: if prompt_is_public is null, default to true)
  const showPrompt = post.prompt_is_public !== false;
  
  const promptSection = showPrompt ? `
    <div class="post-full-content-section">
      <h2 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Original Prompt
      </h2>
      <div class="post-full-text">${post.prompt}</div>
    </div>
  ` : `
    <div class="post-full-content-section">
      <h2 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="m7 11 0-7a5 5 0 0 1 10 0v7"/>
        </svg>
        Original Prompt
      </h2>
      <div style="padding: 20px; background: rgba(6, 114, 115, 0.05); border-radius: 8px; border-left: 4px solid rgba(6, 114, 115, 0.3); text-align: center;">
        <div style="color: rgba(6, 114, 115, 0.7); margin-bottom: 10px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 10px;">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="m7 11 0-7a5 5 0 0 1 10 0v7"/>
          </svg>
        </div>
        <h4 style="color: #067273; margin-bottom: 8px; font-size: 16px;">Prompt kept private</h4>
        <p style="color: rgba(6, 114, 115, 0.8); margin: 0; font-size: 14px;">The author chose to keep their original prompt private.</p>
      </div>
    </div>
  `;

  // Always show favorite button - check if favorited if user is logged in
  let isFaved = false;
  if (currentUser) {
    isFaved = await checkIfFavorited(post.id, 'archive');
  }
  
  const favoriteButton = createFavoriteButton(post.id, 'archive', isFaved);

  const postHtml = `
    <div class="post-full-content">
      <div class="post-full-header">
        <div class="post-header-actions">
          <h1 class="post-full-title">${post.title}</h1>
          ${favoriteButton}
        </div>
        <div class="post-full-meta">
          <span class="post-type-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Archive Post
          </span>
          <span>📅 Posted ${new Date(post.created_at).toLocaleDateString()}</span>
          <span>🤖 AI Model: ${post.ai_model}</span>
          ${post.generation_date ? `<span>⚡ Generated: ${new Date(post.generation_date).toLocaleDateString()}</span>` : ''}
          <span>👁️ ${post.views || 0} views</span>
        </div>
      </div>

      ${promptSection}

      ${post.embed_url ? generateEmbedSection(post.embed_url) : generateContentSection(post.content)}

      <div class="post-full-content-section">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          Tags
        </h2>
        <div class="post-full-tags">
          ${post.tags.map(tag => `<span class="post-full-tag">${tag}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = postHtml;
  
  // Add event listener for favorite button
  setupFavoriteButton(post);
}

async function displayCollabPost(post, container) {
  const typeDisplay = post.type === 'request' ? 'Looking for Collaboration' : 'Offering to Collaborate';
  const typeIcon = post.type === 'request' ? '🔍' : '🎯';
  
  // Always show favorite button - check if favorited if user is logged in
  let isFaved = false;
  if (currentUser) {
    isFaved = await checkIfFavorited(post.id, 'collab');
  }
  
  const favoriteButton = createFavoriteButton(post.id, 'collab', isFaved);
  
  const postHtml = `
    <div class="post-full-content">
      <div class="post-full-header">
        <div class="post-header-actions">
          <h1 class="post-full-title">${post.title}</h1>
          ${favoriteButton}
        </div>
        <div class="post-full-meta">
          <span class="post-type-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Collab Post
          </span>
          <span>📅 Posted ${new Date(post.created_at).toLocaleDateString()}</span>
          <span>${typeIcon} ${typeDisplay}</span>
          <span>👁️ ${post.views || 0} views</span>
        </div>
      </div>

      <div class="post-full-content-section">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 9V5a3 3 0 0 0-6 0v4"/>
            <rect x="2" y="9" width="20" height="12" rx="2" ry="2"/>
          </svg>
          Project Description
        </h2>
        <div class="post-full-text">${post.description}</div>
      </div>

      <div class="contact-section">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Get in Touch
        </h2>
        <p style="color: #067273; margin-bottom: 16px; font-size: 16px;">
          Ready to collaborate? Reach out using the contact information below:
        </p>
        <a href="mailto:${post.contact_email}" class="contact-email">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          ${post.contact_email}
        </a>
      </div>

      <div class="post-full-content-section">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          Skills & Technologies
        </h2>
        <div class="post-full-tags">
          ${post.tags.map(tag => `<span class="post-full-tag">${tag}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = postHtml;
  
  // Add event listener for favorite button
  setupFavoriteButton(post);
}

function createFavoriteButton(postId, postType, isFaved = false) {
  return `
    <button class="favorite-btn ${isFaved ? 'favorited' : ''}" 
            data-post-id="${postId}" 
            data-post-type="${postType}"
            title="${isFaved ? 'Remove from favorites' : 'Add to favorites'}">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <span class="favorite-text">${isFaved ? 'Favorited' : 'Add to favorites'}</span>
    </button>
  `;
}

async function checkIfFavorited(postId, postType) {
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

function setupFavoriteButton(post) {
  const favoriteBtn = document.querySelector('.favorite-btn');
  if (!favoriteBtn) return;

  favoriteBtn.addEventListener('click', async () => {
    if (!currentUser) {
      // Show login prompt instead of alert
      showNotification('Please sign in to add favorites', 'info');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1500);
      return;
    }

    const postId = favoriteBtn.dataset.postId;
    const postType = favoriteBtn.dataset.postType;
    const isFaved = favoriteBtn.classList.contains('favorited');

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

        updateFavoriteButton(favoriteBtn, false);
        showNotification('Removed from favorites', 'success');
      } else {
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

        updateFavoriteButton(favoriteBtn, true);
        showNotification('Added to favorites', 'success');
      }
    } catch (error) {
      console.error('Error managing favorite:', error);
      showNotification(error.message, 'error');
    }
  });
}

function updateFavoriteButton(button, isFaved) {
  const svg = button.querySelector('svg');
  const text = button.querySelector('.favorite-text');
  
  if (isFaved) {
    button.classList.add('favorited');
    svg.setAttribute('fill', 'currentColor');
    text.textContent = 'Favorited';
    button.title = 'Remove from favorites';
  } else {
    button.classList.remove('favorited');
    svg.setAttribute('fill', 'none');
    text.textContent = 'Add to favorites';
    button.title = 'Add to favorites';
  }
}

function generateEmbedSection(embedUrl) {
  const isGoogleDoc = embedUrl.includes('docs.google.com') || 
                      embedUrl.includes('drive.google.com') ||
                      embedUrl.includes('sheets.google.com') ||
                      embedUrl.includes('slides.google.com');
  
  const isChatGPT = embedUrl.includes('chatgpt.com') || embedUrl.includes('chat.openai.com');
  
  if (isGoogleDoc) {
    return `
      <div class="post-full-content-section">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          ${isChatGPT ? 'ChatGPT Conversation' : 'Google Document'}
        </h2>
        <div style="text-align: center; padding: 60px 20px; background: rgba(6, 114, 115, 0.03); border-radius: 12px; border: 2px solid rgba(6, 114, 115, 0.1);">
          <div style="color: #067273; margin-bottom: 20px;">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#067273" stroke-width="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <h3 style="color: #067273; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
            ${isChatGPT ? 'ChatGPT Conversation Available' : 'Google Document Available'}
          </h3>
          <p style="color: #666; margin-bottom: 30px; font-size: 18px; line-height: 1.6;">
            This content cannot be embedded directly due to security restrictions, but you can access the full ${isChatGPT ? 'conversation' : 'document'} by clicking the button below.
          </p>
          <a href="${embedUrl}" target="_blank" rel="noopener noreferrer" 
             style="display: inline-flex; align-items: center; gap: 12px; background: #067273; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 18px; transition: all 0.2s ease;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            View ${isChatGPT ? 'Conversation' : 'Document'}
          </a>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="post-full-content-section">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          AI-Generated Content
        </h2>
        <div class="post-full-embed">
          <iframe 
            src="${embedUrl}" 
            width="100%" 
            height="600" 
            frameborder="0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
            style="border-radius: 12px;">
          </iframe>
        </div>
        <p style="text-align: center; margin-top: 16px;">
          <a href="${embedUrl}" target="_blank" rel="noopener noreferrer" 
             style="color: #067273; text-decoration: none; font-weight: 500;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Open in new tab
          </a>
        </p>
      </div>
    `;
  }
}

function generateContentSection(content) {
  return `
    <div class="post-full-content-section">
      <h2 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
        AI-Generated Content
      </h2>
      <div class="post-full-text">${content}</div>
    </div>
  `;
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 80px;
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

function showError(message) {
  const container = document.getElementById('post-content');
  container.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h2 style="color: #dc3545; margin-bottom: 16px; font-size: 24px;">Error Loading Post</h2>
      <p style="color: #666; font-size: 16px; margin-bottom: 24px;">${message}</p>
      <a href="javascript:history.back()" class="back-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
        </svg>
        Go Back
      </a>
    </div>
  `;
}
