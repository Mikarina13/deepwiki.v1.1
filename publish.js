import { createClient } from '@supabase/supabase-js';
import { initMenu } from './src/utils/menu.js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Tag management arrays
let archiveTags = [];
let collabTags = [];

// Edit mode variables
let isEditMode = false;
let editPostId = null;
let editPostType = null;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the menu
  initMenu();
  
  // Detect current page context and edit mode
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer;
  const currentPath = window.location.pathname;
  
  // Check for edit mode
  editPostId = urlParams.get('edit');
  editPostType = urlParams.get('type');
  isEditMode = editPostId && editPostType;
  
  // Determine if we're coming from collab page or archive page
  const isFromCollab = referrer.includes('/collab.html') || 
                       editPostType === 'collab' ||
                       urlParams.get('type') === 'collab' ||
                       currentPath.includes('collab');
  
  const isFromArchive = referrer.includes('/index.html') || 
                        editPostType === 'archive' ||
                        urlParams.get('type') === 'archive' ||
                        (!isFromCollab && !referrer.includes('/collab.html'));
  
  // Get UI elements
  const publishContainer = document.getElementById('publish-container');
  const publishTitle = document.getElementById('publish-title');
  const publishTabs = document.getElementById('publish-tabs');
  const archiveTab = document.getElementById('archive-tab');
  const collabTab = document.getElementById('collab-tab');
  const tabButtons = document.querySelectorAll('.tab-button');
  const forms = document.querySelectorAll('.publish-form');
  const archiveForm = document.getElementById('archive-form');
  const collabForm = document.getElementById('collab-form');

  // Content choice buttons
  const choiceButtons = document.querySelectorAll('.choice-button');
  const contentSections = document.querySelectorAll('.content-section');

  // Configure UI based on context
  if (isFromCollab || editPostType === 'collab') {
    // Show only collab form
    publishTitle.textContent = isEditMode ? 'Edit Collaboration Post' : 'Publish Collaboration';
    publishContainer.classList.add('tabs-hidden');
    archiveForm.style.display = 'none';
    collabForm.style.display = 'block';
    collabForm.classList.add('active');
    archiveForm.classList.remove('active');
  } else {
    // Show only archive form (default)
    publishTitle.textContent = isEditMode ? 'Edit Archive Post' : 'Publish AI Insight';
    publishContainer.classList.add('tabs-hidden');
    collabForm.style.display = 'none';
    archiveForm.style.display = 'block';
    archiveForm.classList.add('active');
    collabForm.classList.remove('active');
  }

  // Hide tabs since we're showing context-specific forms
  publishTabs.style.display = 'none';

  // Content choice switching for archive form
  choiceButtons.forEach(button => {
    button.addEventListener('click', () => {
      choiceButtons.forEach(btn => btn.classList.remove('active'));
      contentSections.forEach(section => section.classList.remove('active'));
      button.classList.add('active');
      
      const choice = button.dataset.choice;
      if (choice === 'paste') {
        document.getElementById('paste-content').classList.add('active');
        // Make content required when paste is selected
        document.getElementById('archive-content').required = true;
        document.getElementById('archive-embed-url').required = false;
      } else {
        document.getElementById('link-content').classList.add('active');
        // Make embed URL required when link is selected
        document.getElementById('archive-embed-url').required = true;
        document.getElementById('archive-content').required = false;
      }
    });
  });

  // Initialize interactive tag systems
  initializeTagSystem('archive');
  initializeTagSystem('collab');

  // Initialize prompt privacy options
  initializePromptPrivacy();

  // Initialize form validation
  initializeFormValidation();

  // Load existing post data if in edit mode
  if (isEditMode) {
    loadPostForEditing();
  }

  // Check authentication status
  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    const forms = document.querySelectorAll('.publish-form');

    if (session) {
      forms.forEach(form => {
        form.style.opacity = '1';
        // Don't auto-enable submit buttons - they should be enabled based on validation
      });
    } else {
      forms.forEach(form => {
        form.style.opacity = '0.7';
        form.querySelector('.submit-button').disabled = true;
      });
      alert('Please sign in to publish content');
    }
  }

  // Handle archive form submission
  archiveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate tags
    if (archiveTags.length === 0) {
      showTagError('archive', 'Please add at least one tag');
      showTagsWarning('archive');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in to publish content');
        return;
      }

      const activeChoice = document.querySelector('.choice-button.active').dataset.choice;
      const title = document.getElementById('archive-title').value;
      const aiModel = document.getElementById('archive-model').value;
      const promptIsPublic = document.querySelector('input[name="prompt-privacy"]:checked').value === 'public';
      const generationDate = document.getElementById('archive-generation-date').value;

      // Handle prompt based on privacy setting
      let prompt;
      if (promptIsPublic) {
        prompt = document.getElementById('archive-prompt').value;
        if (!prompt.trim()) {
          alert('Please provide the original prompt');
          return;
        }
      } else {
        prompt = '[Prompt kept private by author]';
      }

      let formData;

      if (activeChoice === 'link') {
        const embedUrl = document.getElementById('archive-embed-url').value;
        
        if (!embedUrl) {
          alert('Please provide a shareable link');
          return;
        }

        formData = {
          title,
          ai_model: aiModel,
          prompt,
          content: 'Content available via embedded link',
          tags: archiveTags,
          embed_url: embedUrl,
          generation_date: generationDate || null,
          prompt_is_public: promptIsPublic,
          user_id: session.user.id
        };
      } else {
        const content = document.getElementById('archive-content').value;
        
        if (!content) {
          alert('Please provide the AI-generated content');
          return;
        }

        formData = {
          title,
          ai_model: aiModel,
          prompt,
          content,
          tags: archiveTags,
          embed_url: null,
          generation_date: generationDate || null,
          prompt_is_public: promptIsPublic,
          user_id: session.user.id
        };
      }

      if (isEditMode && editPostType === 'archive') {
        // Update existing post
        const { data, error } = await supabase
          .from('archive_posts')
          .update(formData)
          .eq('id', editPostId)
          .eq('user_id', session.user.id); // Ensure user can only edit their own posts

        if (error) throw error;
        alert('Archive post updated successfully!');
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('archive_posts')
          .insert([formData]);

        if (error) throw error;
        alert('Successfully published to Archive!');
      }

      // Reset form and redirect
      archiveForm.reset();
      archiveTags = [];
      updateTagsDisplay('archive');
      
      // Reset to default state (paste choice)
      choiceButtons.forEach(btn => btn.classList.remove('active'));
      contentSections.forEach(section => section.classList.remove('active'));
      choiceButtons[0].classList.add('active'); // First button is now paste
      document.getElementById('paste-content').classList.add('active');
      
      // Reset prompt privacy to default
      document.querySelector('input[name="prompt-privacy"][value="public"]').checked = true;
      updatePromptPrivacySelection();
      
      // Reset today's date
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('archive-generation-date').value = today;
      
      // Redirect back to profile or main page
      if (isEditMode) {
        window.location.href = '/profile.html';
      } else {
        window.location.href = '/index.html';
      }
    } catch (error) {
      alert(`Error ${isEditMode ? 'updating' : 'publishing'} content: ${error.message}`);
    }
  });

  // Handle collab form submission
  collabForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate tags
    if (collabTags.length === 0) {
      showTagError('collab', 'Please add at least one tag');
      showTagsWarning('collab');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in to publish content');
        return;
      }

      const formData = {
        type: document.getElementById('collab-type').value,
        title: document.getElementById('collab-title').value,
        description: document.getElementById('collab-description').value,
        tags: collabTags,
        contact_email: document.getElementById('collab-contact').value,
        user_id: session.user.id
      };

      if (isEditMode && editPostType === 'collab') {
        // Update existing post
        const { data, error } = await supabase
          .from('collab_posts')
          .update(formData)
          .eq('id', editPostId)
          .eq('user_id', session.user.id); // Ensure user can only edit their own posts

        if (error) throw error;
        alert('Collaboration post updated successfully!');
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('collab_posts')
          .insert([formData]);

        if (error) throw error;
        alert('Successfully posted to Collab!');
      }

      // Reset form and redirect
      collabForm.reset();
      collabTags = [];
      updateTagsDisplay('collab');
      
      // Redirect back to profile or main page
      if (isEditMode) {
        window.location.href = '/profile.html';
      } else {
        window.location.href = '/collab.html';
      }
    } catch (error) {
      alert(`Error ${isEditMode ? 'updating' : 'publishing'} content: ${error.message}`);
    }
  });

  // Auto-set today's date as default for generation date
  const generationDateInput = document.getElementById('archive-generation-date');
  if (generationDateInput && !isEditMode) {
    const today = new Date().toISOString().split('T')[0];
    generationDateInput.value = today;
  }

  // Initialize default state (paste choice active) - CHANGED FROM LINK
  if (!isFromCollab && !isEditMode) {
    document.getElementById('archive-content').required = true;
    document.getElementById('archive-embed-url').required = false;
  }

  // Check auth status when page loads
  checkAuth();
});

// Load post data for editing
async function loadPostForEditing() {
  try {
    let post;
    
    if (editPostType === 'archive') {
      const { data, error } = await supabase
        .from('archive_posts')
        .select('*')
        .eq('id', editPostId)
        .single();
      
      if (error) throw error;
      post = data;
      
      // Pre-fill archive form
      document.getElementById('archive-title').value = post.title || '';
      document.getElementById('archive-model').value = post.ai_model || '';
      document.getElementById('archive-prompt').value = post.prompt || '';
      document.getElementById('archive-generation-date').value = post.generation_date || '';
      
      // Set prompt privacy
      const promptIsPublic = post.prompt_is_public !== false;
      document.querySelector(`input[name="prompt-privacy"][value="${promptIsPublic ? 'public' : 'private'}"]`).checked = true;
      updatePromptPrivacySelection();
      
      // Handle content vs embed URL
      if (post.embed_url) {
        // Switch to link mode
        document.querySelector('.choice-button[data-choice="link"]').click();
        document.getElementById('archive-embed-url').value = post.embed_url;
      } else {
        // Switch to paste mode (default)
        document.querySelector('.choice-button[data-choice="paste"]').click();
        document.getElementById('archive-content').value = post.content || '';
      }
      
      // Set tags
      archiveTags = post.tags || [];
      updateTagsDisplay('archive');
      
    } else if (editPostType === 'collab') {
      const { data, error } = await supabase
        .from('collab_posts')
        .select('*')
        .eq('id', editPostId)
        .single();
      
      if (error) throw error;
      post = data;
      
      // Pre-fill collab form
      document.getElementById('collab-type').value = post.type || '';
      document.getElementById('collab-title').value = post.title || '';
      document.getElementById('collab-description').value = post.description || '';
      document.getElementById('collab-contact').value = post.contact_email || '';
      
      // Set tags
      collabTags = post.tags || [];
      updateTagsDisplay('collab');
    }
    
    // Update form validation after loading data
    setTimeout(() => {
      if (editPostType === 'archive') {
        document.getElementById('archive-title').dispatchEvent(new Event('input'));
      } else {
        document.getElementById('collab-title').dispatchEvent(new Event('input'));
      }
    }, 100);
    
  } catch (error) {
    console.error('Error loading post for editing:', error);
    alert('Error loading post data. Please try again.');
    window.location.href = '/profile.html';
  }
}

// Initialize form validation for submit buttons
function initializeFormValidation() {
  // Archive form validation
  const archiveSubmitBtn = document.getElementById('archive-submit-btn');
  const archiveInputs = [
    'archive-title',
    'archive-model',
    'archive-prompt'
  ];

  function validateArchiveForm() {
    const allFilled = archiveInputs.every(id => {
      const element = document.getElementById(id);
      return element && element.value.trim() !== '';
    });
    
    const hasContent = document.getElementById('archive-content').value.trim() !== '' || 
                      document.getElementById('archive-embed-url').value.trim() !== '';
    
    const hasTags = archiveTags.length > 0;
    
    const isValid = allFilled && hasContent && hasTags;
    archiveSubmitBtn.disabled = !isValid;
    
    // Update button text based on edit mode
    if (isEditMode && editPostType === 'archive') {
      archiveSubmitBtn.textContent = 'Update Archive Post';
    } else {
      archiveSubmitBtn.textContent = 'Publish to Archive';
    }
    
    // Show/hide warning
    const warning = document.getElementById('archive-tags-warning');
    if (!hasTags && (allFilled || hasContent)) {
      warning.classList.add('visible');
    } else {
      warning.classList.remove('visible');
    }
  }

  // Collab form validation
  const collabSubmitBtn = document.getElementById('collab-submit-btn');
  const collabInputs = [
    'collab-type',
    'collab-title',
    'collab-description',
    'collab-contact'
  ];

  function validateCollabForm() {
    const allFilled = collabInputs.every(id => {
      const element = document.getElementById(id);
      return element && element.value.trim() !== '';
    });
    
    const hasTags = collabTags.length > 0;
    const isValid = allFilled && hasTags;
    collabSubmitBtn.disabled = !isValid;
    
    // Update button text based on edit mode
    if (isEditMode && editPostType === 'collab') {
      collabSubmitBtn.textContent = 'Update Collab Post';
    } else {
      collabSubmitBtn.textContent = 'Post to Collab';
    }
    
    // Show/hide warning
    const warning = document.getElementById('collab-tags-warning');
    if (!hasTags && allFilled) {
      warning.classList.add('visible');
    } else {
      warning.classList.remove('visible');
    }
  }

  // Add event listeners to all form inputs
  archiveInputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', validateArchiveForm);
      element.addEventListener('change', validateArchiveForm);
    }
  });

  collabInputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', validateCollabForm);
      element.addEventListener('change', validateCollabForm);
    }
  });

  // Add listeners for content fields
  document.getElementById('archive-content').addEventListener('input', validateArchiveForm);
  document.getElementById('archive-embed-url').addEventListener('input', validateArchiveForm);

  // Initial validation
  validateArchiveForm();
  validateCollabForm();
}

// Initialize interactive tag system for a form type
function initializeTagSystem(formType) {
  const tagInput = document.getElementById(`${formType}-tag-input`);
  const addTagBtn = document.getElementById(`${formType}-add-tag`);
  const tagsDisplay = document.getElementById(`${formType}-tags-display`);
  const tagError = document.getElementById(`${formType}-tag-error`);
  
  // Add tag on button click
  addTagBtn.addEventListener('click', () => {
    addTag(formType);
  });
  
  // Add tag on Enter key press
  tagInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(formType);
    }
  });
  
  // Clear error on input
  tagInput.addEventListener('input', () => {
    hideTagError(formType);
    hideTagsWarning(formType);
  });
}

// Initialize prompt privacy options
function initializePromptPrivacy() {
  const privacyOptions = document.querySelectorAll('.privacy-option');
  const radioInputs = document.querySelectorAll('input[name="prompt-privacy"]');
  
  // Handle clicking on privacy option labels
  privacyOptions.forEach(option => {
    option.addEventListener('click', () => {
      const radio = option.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        updatePromptPrivacySelection();
      }
    });
  });
  
  // Handle radio button changes
  radioInputs.forEach(radio => {
    radio.addEventListener('change', updatePromptPrivacySelection);
  });
  
  // Initialize selection display
  updatePromptPrivacySelection();
}

// Update prompt privacy visual selection and form behavior - FIXED TO DISABLE FIELD
function updatePromptPrivacySelection() {
  const privacyOptions = document.querySelectorAll('.privacy-option');
  const selectedValue = document.querySelector('input[name="prompt-privacy"]:checked').value;
  const promptTextarea = document.getElementById('archive-prompt');
  
  // Update visual selection
  privacyOptions.forEach(option => {
    const radio = option.querySelector('input[type="radio"]');
    if (radio.value === selectedValue) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
  
  // Update field behavior based on selection - DISABLE WHEN PRIVATE
  if (selectedValue === 'private') {
    // When private: disable the field completely
    promptTextarea.disabled = true;
    promptTextarea.required = false;
    // Visual indication that this is disabled/private
    promptTextarea.style.background = 'rgba(6, 114, 115, 0.05)';
    promptTextarea.style.cursor = 'not-allowed';
    promptTextarea.placeholder = 'Prompt will be kept private - field is disabled';
  } else {
    // When public: enable the field
    promptTextarea.disabled = false;
    promptTextarea.required = true;
    // Normal styling
    promptTextarea.style.background = '';
    promptTextarea.style.cursor = '';
    promptTextarea.placeholder = 'Share the prompt(s) you used';
  }
}

// Add a tag to the specified form
function addTag(formType) {
  const tagInput = document.getElementById(`${formType}-tag-input`);
  const tagValue = tagInput.value.trim().toLowerCase();
  
  // Get the appropriate tags array
  const tagsArray = formType === 'archive' ? archiveTags : collabTags;
  
  // Validate tag
  if (!tagValue) {
    showTagError(formType, 'Please enter a tag');
    return;
  }
  
  if (tagValue.length < 2) {
    showTagError(formType, 'Tag must be at least 2 characters long');
    return;
  }
  
  if (tagValue.length > 30) {
    showTagError(formType, 'Tag must be less than 30 characters');
    return;
  }
  
  if (tagsArray.includes(tagValue)) {
    showTagError(formType, 'Tag already added');
    return;
  }
  
  if (tagsArray.length >= 10) {
    showTagError(formType, 'Maximum 10 tags allowed');
    return;
  }
  
  // Add tag to array
  if (formType === 'archive') {
    archiveTags.push(tagValue);
  } else {
    collabTags.push(tagValue);
  }
  
  // Update display
  updateTagsDisplay(formType);
  
  // Clear input
  tagInput.value = '';
  
  // Hide error and warning
  hideTagError(formType);
  hideTagsWarning(formType);
  
  // Trigger form validation
  if (formType === 'archive') {
    document.getElementById('archive-title').dispatchEvent(new Event('input'));
  } else {
    document.getElementById('collab-title').dispatchEvent(new Event('input'));
  }
}

// Remove a tag
function removeTag(formType, tagValue) {
  if (formType === 'archive') {
    const index = archiveTags.indexOf(tagValue);
    if (index > -1) {
      archiveTags.splice(index, 1);
    }
  } else {
    const index = collabTags.indexOf(tagValue);
    if (index > -1) {
      collabTags.splice(index, 1);
    }
  }
  
  updateTagsDisplay(formType);
  
  // Trigger form validation
  if (formType === 'archive') {
    document.getElementById('archive-title').dispatchEvent(new Event('input'));
  } else {
    document.getElementById('collab-title').dispatchEvent(new Event('input'));
  }
}

// Update the tags display
function updateTagsDisplay(formType) {
  const tagsDisplay = document.getElementById(`${formType}-tags-display`);
  const tagCount = document.getElementById(`${formType}-tag-count`);
  const tagsArray = formType === 'archive' ? archiveTags : collabTags;
  
  if (tagsArray.length === 0) {
    tagsDisplay.className = 'tags-display empty';
    tagsDisplay.innerHTML = `Add at least one tag to categorize your ${formType === 'archive' ? 'content' : 'collaboration'} before ${formType === 'archive' ? 'publishing' : 'posting'}.`;
  } else {
    tagsDisplay.className = 'tags-display';
    tagsDisplay.innerHTML = tagsArray.map(tag => `
      <div class="tag-item">
        <span>${tag}</span>
        <button type="button" class="tag-remove" onclick="removeTag('${formType}', '${tag}')" title="Remove tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `).join('');
  }
  
  // Update count
  const count = tagsArray.length;
  tagCount.textContent = `${count} tag${count !== 1 ? 's' : ''} added${count >= 10 ? ' (maximum reached)' : ''}`;
  
  // Update add button state
  const addBtn = document.getElementById(`${formType}-add-tag`);
  addBtn.disabled = count >= 10;
}

// Show tag error
function showTagError(formType, message) {
  const tagError = document.getElementById(`${formType}-tag-error`);
  tagError.textContent = message;
  tagError.classList.add('visible');
}

// Hide tag error
function hideTagError(formType) {
  const tagError = document.getElementById(`${formType}-tag-error`);
  tagError.classList.remove('visible');
}

// Show tags warning
function showTagsWarning(formType) {
  const warning = document.getElementById(`${formType}-tags-warning`);
  warning.classList.add('visible');
}

// Hide tags warning
function hideTagsWarning(formType) {
  const warning = document.getElementById(`${formType}-tags-warning`);
  warning.classList.remove('visible');
}

// Make removeTag globally accessible
window.removeTag = removeTag;
