import { createClient } from '@supabase/supabase-js';
import { initMenu } from './utils/menu.js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the side menu
  initMenu();
  
  const profileForm = document.getElementById('profile-form');
  const notificationsForm = document.getElementById('notifications-form');
  const deleteAccountButton = document.getElementById('delete-account');
  const deleteConfirmationInput = document.getElementById('delete-confirmation');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = '/login.html';
    return;
  }

  // Load user data
  document.getElementById('email').value = session.user.email;
  
  // Load existing profile data
  if (session.user.user_metadata) {
    const metadata = session.user.user_metadata;
    document.getElementById('display-name').value = metadata.display_name || '';
    document.getElementById('date-of-birth').value = metadata.date_of_birth || '';
    document.getElementById('location').value = metadata.location || '';
    document.getElementById('bio').value = metadata.bio || '';
    
    // Load notification preferences
    const notifications = metadata.notifications || {};
    document.getElementById('email-notifications').checked = notifications.email_notifications || false;
    document.getElementById('collaboration-notifications').checked = notifications.collaboration_notifications || false;
    document.getElementById('weekly-digest').checked = notifications.weekly_digest || false;
  }

  // Handle profile form submission
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const displayName = document.getElementById('display-name').value;
      const dateOfBirth = document.getElementById('date-of-birth').value;
      const location = document.getElementById('location').value;
      const bio = document.getElementById('bio').value;
      
      const { error } = await supabase.auth.updateUser({
        data: { 
          display_name: displayName,
          date_of_birth: dateOfBirth,
          location: location,
          bio: bio
        }
      });
      
      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      alert(`Error updating profile: ${error.message}`);
    }
  });

  // Handle notifications form submission
  notificationsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const emailNotifications = document.getElementById('email-notifications').checked;
      const collaborationNotifications = document.getElementById('collaboration-notifications').checked;
      const weeklyDigest = document.getElementById('weekly-digest').checked;
      
      const { error } = await supabase.auth.updateUser({
        data: {
          notifications: {
            email_notifications: emailNotifications,
            collaboration_notifications: collaborationNotifications,
            weekly_digest: weeklyDigest
          }
        }
      });
      
      if (error) throw error;
      alert('Notification preferences saved successfully!');
    } catch (error) {
      alert(`Error saving preferences: ${error.message}`);
    }
  });

  // Handle delete confirmation input
  deleteConfirmationInput.addEventListener('input', (e) => {
    const confirmationText = e.target.value.trim();
    deleteAccountButton.disabled = confirmationText !== 'DELETE MY ACCOUNT';
  });

  // Handle account deletion
  deleteAccountButton.addEventListener('click', async () => {
    const confirmationText = deleteConfirmationInput.value.trim();
    
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" to confirm.');
      return;
    }

    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
      return;
    }

    try {
      // Note: In a real implementation, you'd want to create a Supabase function
      // to properly delete the user and all associated data
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;

      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      alert(`Error deleting account: ${error.message}`);
    }
  });
});
