import supabase from './src/utils/supabaseClient.js';
import { initMenu } from './src/utils/menu.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the menu
  initMenu();
  
  const tabButtons = document.querySelectorAll('.tab-button');
  const forms = document.querySelectorAll('.auth-form');
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');
  const forgotPasswordLink = document.querySelector('.forgot-password');
  const googleSigninButton = document.getElementById('google-signin');
  const googleSignupButton = document.getElementById('google-signup');
  
  // Add error message elements after forms load
  const signinErrorDisplay = document.createElement('div');
  signinErrorDisplay.className = 'error-message';
  signinErrorDisplay.style.color = 'red';
  signinErrorDisplay.style.marginTop = '10px';
  signinErrorDisplay.style.display = 'none';
  signinForm.appendChild(signinErrorDisplay);
  
  const signupErrorDisplay = document.createElement('div');
  signupErrorDisplay.className = 'error-message';
  signupErrorDisplay.style.color = 'red';
  signupErrorDisplay.style.marginTop = '10px';
  signupErrorDisplay.style.display = 'none';
  signupForm.appendChild(signupErrorDisplay);

  // Check URL parameters for initial tab
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tab') === 'signup') {
    tabButtons[1].click();
  }

  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      forms.forEach(form => form.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(`${button.dataset.tab}-form`).classList.add('active');
      
      // Clear error messages when switching tabs
      signinErrorDisplay.style.display = 'none';
      signupErrorDisplay.style.display = 'none';
    });
  });

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

  // Google Sign-in/Sign-up handlers
  googleSigninButton.addEventListener('click', async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        showError(signinErrorDisplay, `Google sign-in error: ${error.message}`);
      }
    } catch (error) {
      showError(signinErrorDisplay, `An unexpected error occurred: ${error.message}`);
    }
  });

  googleSignupButton.addEventListener('click', async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        showError(signupErrorDisplay, `Google sign-up error: ${error.message}`);
      }
    } catch (error) {
      showError(signupErrorDisplay, `An unexpected error occurred: ${error.message}`);
    }
  });

  // Forgot password handler
  forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    
    if (!email) {
      showError(signinErrorDisplay, 'Please enter your email address first');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html?type=recovery`,
      });

      if (error) {
        showError(signinErrorDisplay, `Error: ${error.message}`);
      } else {
        showError(signinErrorDisplay, 'Password reset instructions have been sent to your email', 'green');
      }
    } catch (error) {
      showError(signinErrorDisplay, `An unexpected error occurred: ${error.message}`);
    }
  });

  // Sign In form submission
  signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    
    // Clear previous error messages
    signinErrorDisplay.style.display = 'none';
    
    // Reset border colors
    document.getElementById('signin-email').style.borderColor = '';
    document.getElementById('signin-password').style.borderColor = '';

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.code === 'invalid_credentials') {
          showError(signinErrorDisplay, 'Invalid email or password. Please check your credentials and try again.\n\nIf you recently registered, please make sure you have confirmed your email address before trying to log in.');
          
          // Add visual indication to input fields
          document.getElementById('signin-email').style.borderColor = 'red';
          document.getElementById('signin-password').style.borderColor = 'red';
          
          // Focus on email field for re-entry
          document.getElementById('signin-email').focus();
        } else {
          showError(signinErrorDisplay, `Authentication error: ${error.message}`);
        }
        return;
      }

      // Successful login
      window.location.href = '/';
    } catch (error) {
      showError(signinErrorDisplay, `An unexpected error occurred: ${error.message}`);
    }
  });

  // Sign Up form submission
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Clear previous error messages
    signupErrorDisplay.style.display = 'none';
    
    // Reset border colors
    document.getElementById('signup-email').style.borderColor = '';
    document.getElementById('signup-password').style.borderColor = '';
    document.getElementById('signup-confirm-password').style.borderColor = '';

    if (password !== confirmPassword) {
      showError(signupErrorDisplay, "Passwords don't match");
      document.getElementById('signup-password').style.borderColor = 'red';
      document.getElementById('signup-confirm-password').style.borderColor = 'red';
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login.html`
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          showError(signupErrorDisplay, 'This email is already registered. Please try signing in instead.');
          document.getElementById('signup-email').style.borderColor = 'red';
        } else {
          showError(signupErrorDisplay, `Registration error: ${error.message}`);
        }
        return;
      }

      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        showError(signupErrorDisplay, 'This email is already registered. Please try signing in instead.');
        document.getElementById('signup-email').style.borderColor = 'red';
        return;
      }

      if (data?.user?.confirmed_at) {
        // Email already confirmed
        showError(signupErrorDisplay, 'Registration successful! You can now log in.', 'green');
      } else {
        // Email confirmation required - make this message more prominent
        showError(signupErrorDisplay, 'Registration successful! Please check your email (including spam folder) and click the confirmation link before attempting to log in.', 'green');
      }
      
      // Stay on the login page but switch to sign-in tab
      setTimeout(() => {
        tabButtons[0].click();
      }, 3000); // Increased time to allow user to read the message
    } catch (error) {
      showError(signupErrorDisplay, `An unexpected error occurred: ${error.message}`);
    }
  });
  
  // Helper function to display error messages
  function showError(element, message, color = 'red') {
    element.textContent = message;
    element.style.color = color;
    element.style.display = 'block';
  }
  
  // Clear red borders when user starts typing again
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      input.style.borderColor = '';
    });
  });
});