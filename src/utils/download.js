import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Increment download count and handle content download
 * @param {Object} post - The post object
 * @param {string} postType - The type of post ('archive' or 'collab')
 */
export async function incrementDownloadsAndHandleContent(post, postType = 'archive') {
  try {
    // Only handle archive posts for downloads
    if (postType !== 'archive') {
      showNotification('Downloads are only available for archive posts', 'info');
      return;
    }

    // Increment download count in database
    const { data: currentPost, error: selectError } = await supabase
      .from('archive_posts')
      .select('downloads')
      .eq('id', post.id)
      .single();

    if (!selectError) {
      const newDownloadCount = (currentPost.downloads || 0) + 1;
      
      await supabase
        .from('archive_posts')
        .update({ downloads: newDownloadCount })
        .eq('id', post.id);
    }

    // Handle content download
    if (post.embed_url) {
      // If there's an embed URL, open it in a new tab
      window.open(post.embed_url, '_blank', 'noopener,noreferrer');
      showNotification('Opening content in new tab...', 'success');
    } else if (post.content) {
      // If there's content, create and download a text file
      downloadTextFile(post);
      showNotification('Download started!', 'success');
    } else {
      showNotification('No downloadable content available', 'error');
      return;
    }

    // Update the download count in the UI if the element exists
    updateDownloadCountInUI(post.id, (currentPost?.downloads || 0) + 1);

  } catch (error) {
    console.error('Error handling download:', error);
    showNotification('Failed to download content. Please try again.', 'error');
  }
}

/**
 * Create and download a text file from post content
 * @param {Object} post - The post object
 */
function downloadTextFile(post) {
  // Get author name
  const authorName = post.users?.raw_user_meta_data?.display_name || 
                    post.users?.raw_user_meta_data?.full_name || 
                    post.users?.email?.split('@')[0] || 
                    'Anonymous';
  
  // Create file content
  const fileContent = `${post.title}
${'='.repeat(post.title.length)}

Author: ${authorName}
AI Model: ${post.ai_model}
Generated: ${post.generation_date ? new Date(post.generation_date).toLocaleDateString() : 'Unknown'}
Tags: ${post.tags.join(', ')}

${post.prompt_is_public !== false ? `Original Prompt:
${'-'.repeat(16)}
${post.prompt}

` : ''}AI-Generated Content:
${'-'.repeat(21)}
${post.content}

---
Downloaded from DeepWiki.io
Post ID: ${post.id}
Downloaded on: ${new Date().toLocaleString()}
`;

  // Create blob and download
  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Create temporary download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(post.title)}.txt`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Sanitize filename for download
 * @param {string} filename - The original filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9\s\-_]/gi, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 100); // Limit length
}

/**
 * Update download count in the UI
 * @param {string} postId - The post ID
 * @param {number} newCount - The new download count
 */
function updateDownloadCountInUI(postId, newCount) {
  // Update in post cards (browse page)
  const postCard = document.querySelector(`[data-post-id="${postId}"]`);
  if (postCard) {
    const downloadCountElement = postCard.querySelector('.download-count');
    if (downloadCountElement) {
      downloadCountElement.textContent = `📥 ${newCount}`;
    }
  }

  // Update in full post view
  const fullPostDownloadCount = document.querySelector('.post-full-download-count');
  if (fullPostDownloadCount) {
    fullPostDownloadCount.textContent = `📥 ${newCount} downloads`;
  }
}

/**
 * Show notification to user
 * @param {string} message - The notification message
 * @param {string} type - The notification type ('success', 'error', 'info')
 */
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