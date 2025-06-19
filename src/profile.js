import supabase from './utils/supabaseClient.js';
import { initMenu } from './utils/menu.js';


let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the side menu
  initMenu();

  // Load user data
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;

    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileLocation = document.getElementById('profile-location');
    const profileWebsite = document.getElementById('profile-website');
    const profileBio = document.getElementById('profile-bio');
    const profileImage = document.getElementById('profile-image');
    const profileDob = document.getElementById('profile-dob');

    profileEmail.textContent = session.user.email;
    profileName.textContent = session.user.user_metadata?.display_name || 'Anonymous User';

    // Handle Google profile picture automatically
    if (session.user.user_metadata?.avatar_url) {
      profileImage.src = session.user.user_metadata.avatar_url;
    } else if (session.user.user_metadata?.picture) {
      // Google OAuth sometimes stores picture in different field
      profileImage.src = session.user.user_metadata.picture;
    }

    // Load additional profile data
    if (session.user.user_metadata) {
      const { location, website, bio, date_of_birth } = session.user.user_metadata;

      // Handle location
      if (location) {
        profileLocation.querySelector('.meta-text').textContent = location;
      }

      // Handle website
      if (website) {
        const websiteLink = profileWebsite.querySelector('a');
        websiteLink.href = website;
        websiteLink.textContent = new URL(website).hostname;
      }

      // Handle bio
      if (bio) {
        profileBio.textContent = bio;
      }

      // Handle date of birth
      if (date_of_birth) {
        profileDob.style.display = 'flex';
        profileDob.querySelector('.meta-text').textContent = `Born: ${formatDate(date_of_birth)}`;
      }
    }

    // Load user's posts
    await loadUserPosts();

    // Avatar upload functionality
    setupAvatarUpload(session.user.id);

    // Setup tabs functionality
    setupTabs();

  } else {
    window.location.href = '/login.html';
  }
});

async function loadUserPosts() {
  try {
    // Load archive posts
    const { data: archivePosts, error: archiveError } = await supabase
      .from('archive_posts')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (archiveError) throw archiveError;

    // Load collab posts
    const { data: collabPosts, error: collabError } = await supabase
      .from('collab_posts')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (collabError) throw collabError;

    // Display archive posts
    displayArchivePosts(archivePosts || []);

    // Display collab posts
    displayCollabPosts(collabPosts || []);

  } catch (error) {
    console.error('Error loading posts:', error);
    document.getElementById('archive-posts').innerHTML = '<p class="empty-state">Error loading posts</p>';
    document.getElementById('collab-posts').innerHTML = '<p class="empty-state">Error loading posts</p>';
  }
}

function displayArchivePosts(posts) {
  const archivePostsContainer = document.getElementById('archive-posts');

  if (posts.length === 0) {
    archivePostsContainer.innerHTML = `
      <div class="empty-posts">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#067273" stroke-width="1">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <h4>No archive posts yet</h4>
        <p>Share your AI insights with the community by creating your first archive post.</p>
        <a href="/publish.html?type=archive" class="create-post-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14"/>
            <path d="M5 12h14"/>
          </svg>
          Create Archive Post
        </a>
      </div>
    `;
    return;
  }

  archivePostsContainer.innerHTML = posts.map(post => {
    // Format dates
    const postDate = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const genDate = post.generation_date ?
      new Date(post.generation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
      postDate;

    // Truncate content for preview
    let contentPreview = '';
    if (post.embed_url) {
      const isGoogleDoc = isGoogleDocsUrl(post.embed_url);

      if (isGoogleDoc) {
        contentPreview = `
          <div class="post-embed">
            <div class="embed-blocked" style="text-align: center; padding: 20px 15px; background: rgba(6, 114, 115, 0.03); border-radius: 8px; border: 1px solid rgba(6, 114, 115, 0.1);">
              <div style="color: #067273; margin-bottom: 10px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#067273" stroke-width="1">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <h5 style="color: #067273; margin-bottom: 8px; font-size: 14px; font-weight: 600;">Document Link</h5>
              <a href="${post.embed_url}" target="_blank" rel="noopener noreferrer"
                 style="display: inline-flex; align-items: center; gap: 6px; background: #067273; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 12px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15,3 21,3 21,9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Open Document
              </a>
            </div>
          </div>
        `;
      } else {
        contentPreview = `
          <div class="post-embed">
            <iframe
              src="${post.embed_url}"
              width="100%"
              height="200"
              frameborder="0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              loading="lazy"
              style="border-radius: 8px; border: 1px solid rgba(6, 114, 115, 0.1);">
            </iframe>
          </div>
        `;
      }
    } else {
      contentPreview = `
        <div class="post-content">
          <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
            ${post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}
          </p>
        </div>
      `;
    }

    // Handle prompt display based on privacy setting
    const showPrompt = post.prompt_is_public !== false;
    const promptSection = showPrompt ? `
      <div class="post-prompt">
        <strong>Original Prompt:</strong>
        <p>${post.prompt.length > 150 ? post.prompt.substring(0, 150) + '...' : post.prompt}</p>
      </div>
    ` : `
      <div class="post-prompt">
        <strong>Original Prompt:</strong>
        <p style="font-style: italic; opacity: 0.7;">Kept private by author</p>
      </div>
    `;

    return `
      <div class="post-item">
        <div class="post-item-header">
          <h4>${post.title}</h4>
          <div class="post-actions">
            <button class="edit-post-btn" onclick="editArchivePost('${post.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <a href="/view-post.html?id=${post.id}&type=archive" class="view-post-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h6v6"/>
                <path d="M10 14L21 3"/>
                <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11"/>
              </svg>
              View
            </a>
          </div>
        </div>
        <div class="post-meta">
          <span>📅 Posted on ${postDate}</span>
          <span>•</span>
          <span>🤖 AI Model: ${post.ai_model}</span>
          ${post.generation_date ? `<span>•</span><span>⚡ Generated: ${genDate}</span>` : ''}
          <span>•</span>
          <span>👁️ ${post.views || 0} views</span>
        </div>
        ${contentPreview}
        ${promptSection}
        <div class="post-tags">
          ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function displayCollabPosts(posts) {
  const collabPostsContainer = document.getElementById('collab-posts');

  if (posts.length === 0) {
    collabPostsContainer.innerHTML = `
      <div class="empty-posts">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#067273" stroke-width="1">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
        <h4>No collaboration posts yet</h4>
        <p>Connect with the community by sharing collaboration opportunities or skills.</p>
        <a href="/publish.html?type=collab" class="create-post-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14"/>
            <path d="M5 12h14"/>
          </svg>
          Create Collab Post
        </a>
      </div>
    `;
    return;
  }

  collabPostsContainer.innerHTML = posts.map(post => {
    // Format date
    const postDate = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Format type
    const typeDisplay = post.type === 'request' ? 'Looking for Collaboration' : 'Offering to Collaborate';
    const typeIcon = post.type === 'request' ? '🔍' : '🎯';

    // Truncate description for preview
    const descriptionPreview = post.description ?
      (post.description.length > 200 ? post.description.substring(0, 200) + '...' : post.description) :
      'No description available';

    return `
      <div class="post-item">
        <div class="post-item-header">
          <h4>${post.title}</h4>
          <div class="post-actions">
            <button class="edit-post-btn" onclick="editCollabPost('${post.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <a href="/view-post.html?id=${post.id}&type=collab" class="view-post-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h6v6"/>
                <path d="M10 14L21 3"/>
                <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11"/>
              </svg>
              View
            </a>
          </div>
        </div>
        <div class="post-meta">
          <span class="collab-type-badge">
            ${typeIcon} ${typeDisplay}
          </span>
          <span>📅 Posted on ${postDate}</span>
          <span>•</span>
          <span>👁️ ${post.views || 0} views</span>
        </div>
        <div class="post-content">
          <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
            ${descriptionPreview}
          </p>
        </div>
        <div class="contact-info">
          <strong>Contact Information:</strong>
          <p>
            <a href="mailto:${post.contact_email}" style="color: #067273; text-decoration: none;">
              📧 ${post.contact_email}
            </a>
          </p>
        </div>
        <div class="post-tags">
          ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const postsSections = document.querySelectorAll('.posts-section');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and sections
      tabButtons.forEach(btn => btn.classList.remove('active'));
      postsSections.forEach(section => section.classList.remove('active'));

      // Add active class to clicked button
      button.classList.add('active');

      // Show corresponding section
      const tabName = button.dataset.tab;
      document.getElementById(`${tabName}-section`).classList.add('active');
    });
  });
}

// Global functions for edit functionality - NOW REDIRECTS TO PUBLISH FORMS
window.editArchivePost = function(postId) {
  // Redirect to publish page with edit parameters
  window.location.href = `/publish.html?type=archive&edit=${postId}`;
};

window.editCollabPost = function(postId) {
  // Redirect to publish page with edit parameters
  window.location.href = `/publish.html?type=collab&edit=${postId}`;
};

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function isGoogleDocsUrl(url) {
  return url.includes('docs.google.com') ||
         url.includes('drive.google.com') ||
         url.includes('sheets.google.com') ||
         url.includes('slides.google.com');
}

// Avatar upload setup
function setupAvatarUpload(userId) {
  const avatarContainer = document.getElementById('avatar-container');
  const editAvatarBtn = document.getElementById('edit-avatar-btn');
  const avatarUpload = document.getElementById('avatar-upload');
  const profileImage = document.getElementById('profile-image');
  const uploadProgress = document.getElementById('upload-progress');

  // Click handlers for avatar upload
  avatarContainer.addEventListener('click', () => {
    avatarUpload.click();
  });

  editAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarUpload.click();
  });

  // Handle file selection
  avatarUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    try {
      await uploadAvatar(file, userId);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    }
  });

  async function uploadAvatar(file, userId) {
    // Show upload progress
    avatarContainer.classList.add('avatar-uploading');
    uploadProgress.style.display = 'block';

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      // Update the profile image
      profileImage.src = publicUrl;

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.textContent = 'Avatar updated successfully!';
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(successMessage);

      setTimeout(() => {
        successMessage.remove();
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      // Hide upload progress
      avatarContainer.classList.remove('avatar-uploading');
      uploadProgress.style.display = 'none';
      avatarUpload.value = ''; // Reset input
    }
  }
}
