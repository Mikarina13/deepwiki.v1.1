import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('profile-form');
  const preferencesForm = document.getElementById('preferences-form');
  const deleteAccountButton = document.getElementById('delete-account');

  // Check authentication status
  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    const signInLink = document.querySelector('.sign-in');
    const signUpLink = document.querySelector('.sign-up');
    const logoutLink = document.querySelector('.logout');
    const forms = document.querySelectorAll('.settings-form');

    if (session) {
      signInLink.style.display = 'none';
      signUpLink.style.display = 'none';
      logoutLink.style.display = 'flex';
      forms.forEach(form => form.style.display = 'block');
      
      // Load user data
      document.getElementById('email').value = session.user.email;
    } else {
      signInLink.style.display = 'flex';
      signUpLink.style.display = 'flex';
      logoutLink.style.display = 'none';
      forms.forEach(form => form.style.display = 'none');
      alert('Please sign in to access settings');
      window.location.href = '/login.html';
    }
  }

  // Handle logout
  document.querySelector('.logout').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/';
    } catch (error) {
      alert(error.message);
    }
  });

  // Handle profile form submission
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const displayName = document.getElementById('display-name').value;
      
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      alert(`Error updating profile: ${error.message}`);
    }
  });

  // Handle preferences form submission
  preferencesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const emailNotifications = document.getElementById('email-notifications').checked;
      const theme = document.getElementById('theme-select').value;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase.auth.updateUser({
        data: {
          preferences: {
            email_notifications: emailNotifications,
            theme: theme
          }
        }
      });

      if (error) throw error;
      alert('Preferences saved successfully!');
    } catch (error) {
      alert(`Error saving preferences: ${error.message}`);
    }
  });

  // Handle account deletion
  deleteAccountButton.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;

      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      alert(`Error deleting account: ${error.message}`);
    }
  });

  // Menu interaction
  const menuLogo = document.querySelector('.menu-logo');
  const menuOptions = document.querySelector('.menu-options');
  const menuOverlay = document.querySelector('.menu-overlay');

  menuLogo.addEventListener('click', () => {
    menuLogo.classList.add('spinning');
    menuOptions.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    
    menuLogo.addEventListener('animationend', () => {
      menuLogo.classList.remove('spinning');
    }, { once: true });
  });

  menuOverlay.addEventListener('click', () => {
    menuOptions.classList.remove('active');
    menuOverlay.classList.remove('active');
  });

  // Check auth status when page loads
  checkAuth();
});
