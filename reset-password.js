import supabase from './src/utils/supabaseClient.js';
import { initMenu } from './src/utils/menu.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the menu
  initMenu();
  
  const resetPasswordForm = document.getElementById('reset-password-form');
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');

  // Password visibility toggle
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      button.classList.toggle('fa-eye');
      button.classList.toggle('fa-eye-slash');
    });
  });

  // Handle password reset form submission
  resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      // Get the access_token from the URL
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');

      if (!accessToken) {
        alert('Invalid or expired reset link. Please request a new password reset.');
        window.location.href = '/login.html';
        return;
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        alert(`Error updating password: ${error.message}`);
        return;
      }

      alert('Password updated successfully!');
      window.location.href = '/login.html';
    } catch (error) {
      alert(`An unexpected error occurred: ${error.message}`);
    }
  });
});