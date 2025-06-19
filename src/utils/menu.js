import supabase from './supabaseClient.js';

export async function initMenu() {
  // Select existing menu elements
  const menuLogo = document.querySelector('.menu-logo');
  let menuOptions = document.querySelector('.menu-options');
  let menuOverlay = document.querySelector('.menu-overlay');
  
  // Create menu overlay if it doesn't exist
  if (!menuOverlay) {
    menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    document.body.appendChild(menuOverlay);
  }
  
  // Check if menu container exists; if not, create it
  if (!menuOptions) {
    menuOptions = document.createElement('div');
    menuOptions.className = 'menu-options';
    document.body.appendChild(menuOptions);
  }

  // Add a close button to the menu if it doesn't exist
  if (!menuOptions.querySelector('.close-menu-btn')) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-menu-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.title = 'Close';
    closeBtn.addEventListener('click', () => {
      isMenuLockedOpen = false;
      closeMenu();
    });
    menuOptions.prepend(closeBtn);
  }
  
  // Get authentication status
  const { data: { session } } = await supabase.auth.getSession();
  
  // Track if menu is locked open (clicked open)
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

  // Generate common menu elements if they don't exist
  if (!menuOptions.querySelector('.auth-section')) {
    // Create auth section (top part)
    const menuTop = document.createElement('div');
    menuTop.className = 'menu-top';
    
    const authSection = document.createElement('div');
    authSection.className = 'auth-section';
    authSection.innerHTML = `
      <a href="/login.html" class="sign-in" ${session ? 'style="display: none;"' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        Sign in
      </a>
      <a href="/login.html?tab=signup" class="sign-up" ${session ? 'style="display: none;"' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        Sign up
      </a>
      <a href="#" class="logout" ${!session ? 'style="display: none;"' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Logout
      </a>
    `;
    
    menuTop.appendChild(authSection);
    
    // Check if we already have menu content (like info-nav in info-hub.html)
    const existingChildren = Array.from(menuOptions.children);
    
    if (existingChildren.length > 0) {
      // Insert at the beginning
      menuOptions.insertBefore(menuTop, existingChildren[0]);
    } else {
      menuOptions.appendChild(menuTop);
      
      // Add recent searches section if it doesn't exist and this isn't the info-hub page
      if (!document.querySelector('.info-nav')) {
        const recentSearches = document.createElement('div');
        recentSearches.className = 'recent-searches';
        recentSearches.innerHTML = `
          <h3>Recent Searches</h3>
          <div class="empty-state">Empty</div>
          <button class="show-more">
            Show more
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        `;
        menuOptions.appendChild(recentSearches);
      }
    }
    
    // Add menu footer if it doesn't exist
    if (!menuOptions.querySelector('.menu-footer')) {
      const menuFooter = document.createElement('div');
      menuFooter.className = 'menu-footer';
      menuFooter.innerHTML = `
        <a href="/profile.html" class="menu-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="10" r="3"/>
            <path d="M12 13c-2.761 0-5 1.79-5 4v1h10v-1c0-2.21-2.239-4-5-4z"/>
          </svg>
          My Profile
        </a>
        <a href="/favorites.html" class="menu-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Favorites
        </a>
        <a href="/activity.html" class="menu-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Activity
        </a>
        <a href="/settings.html" class="menu-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
          </svg>
          Settings
        </a>
        <a href="/help.html" class="menu-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          Help
        </a>
        <a href="/" class="menu-footer-item return-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
          </svg>
          Return to Home
        </a>
      `;
      menuOptions.appendChild(menuFooter);
    }
  } else {
    // Update auth section visibility based on session
    const signInLink = menuOptions.querySelector('.sign-in');
    const signUpLink = menuOptions.querySelector('.sign-up');
    const logoutLink = menuOptions.querySelector('.logout');
    
    if (session) {
      if (signInLink) signInLink.style.display = 'none';
      if (signUpLink) signUpLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'flex';
    } else {
      if (signInLink) signInLink.style.display = 'flex';
      if (signUpLink) signUpLink.style.display = 'flex';
      if (logoutLink) logoutLink.style.display = 'none';
    }
  }

  // Menu toggle functionality - now with locking
  menuLogo.addEventListener('click', () => {
    // Always animate the icon, regardless of whether opening or closing
    animateMenuIcon();
    
    if (menuOptions.classList.contains('active')) {
      // If already open, set isMenuLockedOpen to false and then close
      isMenuLockedOpen = false;
      closeMenu();
    } else {
      // If closed, open it and lock it open
      openMenu();
      isMenuLockedOpen = true;
    }
  });

  menuOverlay.addEventListener('click', () => {
    isMenuLockedOpen = false; // Clicking overlay always unlocks
    closeMenu();
  });

  // Handle logout
  const logoutLink = menuOptions.querySelector('.logout');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.reload();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  // Create left-edge trigger if it doesn't exist
  if (!document.querySelector('.left-edge-trigger')) {
    const leftEdgeTrigger = document.createElement('div');
    leftEdgeTrigger.className = 'left-edge-trigger';
    document.body.appendChild(leftEdgeTrigger);
  }

  // Create hamburger icon if it doesn't exist
  if (!document.querySelector('.menu-hamburger-indicator')) {
    const hamburgerIcon = document.createElement('div');
    hamburgerIcon.className = 'menu-hamburger-indicator';
    
    // Create three lines for the hamburger icon
    for (let i = 0; i < 3; i++) {
      const line = document.createElement('span');
      line.className = 'hamburger-line';
      hamburgerIcon.appendChild(line);
    }
    
    document.body.appendChild(hamburgerIcon);
  }

  // Add hover functionality to left edge trigger
  const leftEdgeTrigger = document.querySelector('.left-edge-trigger');
  leftEdgeTrigger.addEventListener('mouseenter', () => {
    if (!isMenuLockedOpen) {
      openMenu();
    }
  });

  // Make sure menu doesn't close when hovering over hamburger indicator
  const hamburgerIcon = document.querySelector('.menu-hamburger-indicator');
  hamburgerIcon.addEventListener('mouseenter', () => {
    if (!isMenuLockedOpen) {
      openMenu();
    }
  });

  // Handle mouse leaving the menu
  menuOptions.addEventListener('mouseleave', (e) => {
    // Don't close if moving to the left edge trigger or hamburger icon
    if (e.relatedTarget !== leftEdgeTrigger && e.relatedTarget !== hamburgerIcon && !isMenuLockedOpen) {
      closeMenu();
    }
  });
}
