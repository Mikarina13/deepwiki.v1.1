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