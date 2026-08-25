window.addEventListener('error', (event) => {
  alert('Page JS Error: ' + event.message + '\nFile: ' + event.filename + '\nLine: ' + event.lineno);
});

// Auto-forward OAuth hash to /auth/callback if landed on homepage
(function checkOAuthHashForward() {
  const hash = window.location.hash;
  if (hash && (hash.includes('access_token=') || hash.includes('error='))) {
    const search = window.location.search || '?source=app';
    window.location.href = window.location.origin + '/auth/callback/' + search + hash;
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // --- Supabase Client Initialization ---
  const SUPABASE_URL = "https://vvjnkgdrhyxilnderjdy.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_hCdzzszncTGjIBGZYuoTNg_LZSnuHAw";
  
  let supabaseClient = null;
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "supabase.auth.token"
      }
    });
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
  }

  // --- State Variables ---
  let currentUser = null;
  let currentUserProfile = null; // Stored from sync_user_session
  let currentUserProfiles = []; // Profiles array
  let activeProfileId = null; // ID of the currently selected profile
  let activeMyListTab = 'watching'; // active tab inside my list
  let selectedAdminTab = 'users-tab';
  let activeUsers = [];

  // --- High-Performance Scroll-driven Animation for Features ---
  const featureCards = document.querySelectorAll('.feature-card');
  
  function handleScrollAnimation() {
    const triggerBottom = window.innerHeight * 0.95;
    featureCards.forEach(card => {
      const cardTop = card.getBoundingClientRect().top;
      if (cardTop < triggerBottom) {
        // Calculate entrance ratio (completes animation within 250px from entering viewport)
        const distance = triggerBottom - cardTop;
        const range = 250; 
        const ratio = Math.min(Math.max(distance / range, 0), 1);
        card.style.setProperty('--scroll-ratio', ratio);
      } else {
        card.style.setProperty('--scroll-ratio', '0');
      }
    });
  }

  window.addEventListener('scroll', handleScrollAnimation);
  // Initial check on load
  setTimeout(handleScrollAnimation, 100);

  // --- Smart Latest Release Fetcher ---
  const repoOwner = 'amromotaw3';
  const repoName = 'MediaVault-Landing';

  async function updateDownloadLinks() {
    try {
      const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`);
      const data = await response.json();

      if (data.assets && data.assets.length > 0) {
        const winAsset = data.assets.find(asset => asset.name.endsWith('.exe'));
        const androidAsset = data.assets.find(asset => asset.name.endsWith('.apk'));

        if (winAsset) {
          document.getElementById('download-win').href = winAsset.browser_download_url;
        }
        if (androidAsset) {
          document.getElementById('download-android').href = androidAsset.browser_download_url;
        }
        
        const versionBadge = document.getElementById('app-version-badge');
        if (versionBadge && data.tag_name) {
          versionBadge.innerText = `MEEM ${data.tag_name.toUpperCase()} IS HERE`;
        }
      }
    } catch (error) {
      console.error('Error fetching latest release:', error);
    }
  }

  updateDownloadLinks();

  // --- Router & Smooth Anchor Scrolling ---
  let currentView = 'home';

  function switchView(viewName) {
    const hero = document.getElementById('hero');
    const features = document.getElementById('features');
    const addons = document.getElementById('addons-section');
    const mylist = document.getElementById('mylist-section');
    const admin = document.getElementById('admin-panel-section');

    currentView = viewName;

    // Remove active class from all header links
    document.querySelectorAll('#nav-links a').forEach(link => link.classList.remove('active'));

    if (viewName === 'home') {
      hero.style.display = 'block';
      features.style.display = 'block';
      addons.style.display = 'none';
      mylist.style.display = 'none';
      admin.style.display = 'none';
      const homeLink = document.querySelector('#nav-links a[href="#hero"]');
      if (homeLink) homeLink.classList.add('active');
    } else if (viewName === 'addons') {
      hero.style.display = 'none';
      features.style.display = 'none';
      addons.style.display = 'block';
      mylist.style.display = 'none';
      admin.style.display = 'none';
      const addonsLink = document.getElementById('nav-addons-link');
      if (addonsLink) addonsLink.classList.add('active');
      loadAddons();
    } else if (viewName === 'mylist') {
      hero.style.display = 'none';
      features.style.display = 'none';
      addons.style.display = 'none';
      mylist.style.display = 'block';
      admin.style.display = 'none';
      const mylistLink = document.getElementById('nav-mylist-link');
      if (mylistLink) mylistLink.classList.add('active');
      loadMyList();
    } else if (viewName === 'admin') {
      hero.style.display = 'none';
      features.style.display = 'none';
      addons.style.display = 'none';
      mylist.style.display = 'none';
      admin.style.display = 'block';
      const adminLink = document.getElementById('nav-admin-link');
      if (adminLink) adminLink.classList.add('active');
      loadAdminPanel();
    }
  }

  // Brand click
  const navBrand = document.getElementById('nav-brand');
  if (navBrand) {
    navBrand.addEventListener('click', () => {
      switchView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Document click listener to close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const badge = document.getElementById('nav-profile-badge');
    const dropdown = document.getElementById('nav-dropdown');
    if (badge && dropdown && !badge.contains(e.target)) {
      badge.classList.remove('active');
      dropdown.classList.remove('active');
    }
  });

  document.querySelectorAll('#nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (href === '#') return;

      if (href === '#hero' || href === '#features') {
        switchView('home');
        const target = document.querySelector(href);
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      } else if (href === '#addons-section') {
        switchView('addons');
      } else if (href === '#mylist-section') {
        switchView('mylist');
      } else if (href === '#admin-panel-section') {
        switchView('admin');
      }
    });
  });

  // ==========================================
  // --- Toast Notification System ---
  // ==========================================
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">
        <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'}"></i>
      </span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // ==========================================
  // --- Auth State Management ---
  // ==========================================
  const authModal = document.getElementById('auth-modal');
  const btnLoginNav = document.getElementById('btn-login-nav');
  const authCloseBtn = document.getElementById('auth-close-btn');
  const authTabs = document.getElementById('auth-tabs');
  const authForm = document.getElementById('auth-form');
  const authOtpForm = document.getElementById('auth-otp-form');
  const authMsg = document.getElementById('auth-msg');
  const authUsernameField = document.getElementById('auth-username-field');
  const authModalTitle = document.getElementById('auth-modal-title');
  const authModalSubtitle = document.getElementById('auth-modal-subtitle');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const oauthDiscordBtn = document.getElementById('oauth-discord');
  const oauthGoogleBtn = document.getElementById('oauth-google');

  let authMode = 'login'; // 'login' or 'register'

  // Handle Discord OAuth Login
  if (oauthDiscordBtn) {
    oauthDiscordBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!supabaseClient) {
        showToast('Supabase client not loaded.', 'error');
        return;
      }
      try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'discord',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
      } catch (err) {
        showToast('Discord login failed: ' + err.message, 'error');
      }
    });
  }

  // Handle Google OAuth Login
  if (oauthGoogleBtn) {
    oauthGoogleBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!supabaseClient) {
        showToast('Supabase client not loaded.', 'error');
        return;
      }
      try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
      } catch (err) {
        showToast('Google login failed: ' + err.message, 'error');
      }
    });
  }



  // Close Modal
  if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuthModal();
  });
  // Open Modal - Event Delegation
  document.addEventListener('click', (e) => {
    try {
      const target = e.target.closest('#btn-login-nav');
      if (target) {
        e.preventDefault();
        openAuthModal();
      }
    } catch (err) {
      alert("Click Handler Error: " + err.message);
    }
  });

  const btnAuthBack = document.getElementById('btn-auth-back');
  if (btnAuthBack) {
    btnAuthBack.addEventListener('click', closeAuthModal);
  }

  function openAuthModal() {
    try {
      if (!authModal) {
        alert("Error: authModal element (id 'auth-modal') was not found in the DOM!");
        return;
      }
      authModal.style.display = 'flex';
      document.body.classList.add('auth-modal-open');
      document.body.style.overflow = 'hidden';
      setAuthMode('login');
    } catch (err) {
      alert("openAuthModal Error: " + err.message);
    }
  }

  function closeAuthModal() {
    authModal.style.display = 'none';
    document.body.classList.remove('auth-modal-open');
    document.body.style.overflow = '';
    clearAuthForm();
  }

  function clearAuthForm() {
    authForm.reset();
    authOtpForm.reset();
    authForm.style.display = 'block';
    authOtpForm.style.display = 'none';
    authTabs.style.display = 'flex';
    authMsg.className = 'auth-msg';
    authMsg.style.display = 'none';
    authMsg.innerText = '';
  }

  // Toggle Login/Register Tabs
  authTabs.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setAuthMode(tab.dataset.mode);
    });
  });

  function setAuthMode(mode) {
    try {
      authMode = mode;
      if (authTabs) {
        authTabs.querySelectorAll('.auth-tab').forEach(t => {
          t.classList.toggle('active', t.dataset.mode === mode);
        });
      }

      if (mode === 'register') {
        if (authModalTitle) authModalTitle.innerText = 'Create an Account';
        if (authModalSubtitle) authModalSubtitle.innerText = 'Sign up to sync your library and addons across devices.';
        if (authUsernameField) authUsernameField.style.display = 'block';
        if (authSubmitBtn) authSubmitBtn.innerText = 'Create Account';
      } else {
        if (authModalTitle) authModalTitle.innerText = 'Welcome back';
        if (authModalSubtitle) authModalSubtitle.innerText = 'Sign in to access your dashboard and MEEM addons.';
        if (authUsernameField) authUsernameField.style.display = 'none';
        if (authSubmitBtn) authSubmitBtn.innerText = 'Sign In';
      }
      if (authMsg) authMsg.style.display = 'none';
    } catch (err) {
      alert("setAuthMode Error: " + err.message);
    }
  }

  // Handle Login and Signup Forms
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!supabaseClient) {
      showAuthMsg('Supabase client not loaded.', 'error');
      return;
    }

    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const username = document.getElementById('auth-username').value.trim();

    authMsg.style.display = 'none';
    setSubmitLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        showAuthMsg('Successfully signed in. Syncing session...', 'success');
        await syncAndInitialize(data.user);
      } else {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: { data: { username } }
        });
        if (error) throw error;

        if (data.session) {
          showAuthMsg('Account created successfully! Logging you in...', 'success');
          await syncAndInitialize(data.user);
        } else {
          // OTP verification needed
          showAuthMsg('Verification code sent! Check your email.', 'success');
          authForm.style.display = 'none';
          authTabs.style.display = 'none';
          authOtpForm.style.display = 'block';
        }
      }
    } catch (err) {
      showAuthMsg(err.message || 'Authentication failed.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  });

  // Handle OTP Form Submission
  authOtpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const token = document.getElementById('auth-otp-code').value.trim();

    authMsg.style.display = 'none';
    const otpSubmitBtn = document.getElementById('auth-otp-submit-btn');
    otpSubmitBtn.disabled = true;

    try {
      const { data, error } = await supabaseClient.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });
      if (error) throw error;

      showAuthMsg('Email verified! Initializing session...', 'success');
      await syncAndInitialize(data.user);
    } catch (err) {
      showAuthMsg(err.message || 'OTP verification failed.', 'error');
      otpSubmitBtn.disabled = false;
    }
  });

  function showAuthMsg(message, type = 'success') {
    authMsg.innerText = message;
    authMsg.className = `auth-msg visible ${type}`;
    authMsg.style.display = 'block';
  }

  function setSubmitLoading(loading) {
    authSubmitBtn.disabled = loading;
    if (loading) {
      authSubmitBtn.innerHTML = '<span class="auth-spinner"></span> Please wait...';
    } else {
      authSubmitBtn.innerText = authMode === 'register' ? 'Create Account' : 'Sign In';
    }
  }

  // ==========================================
  // --- Session Sync & Setup ---
  // ==========================================
  async function syncAndInitialize(user) {
    if (!user) return;
    try {
      // Execute the sync RPC to ensure public.users_accounts has the user record
      const { data: syncData, error: syncError } = await supabaseClient.rpc('sync_user_session', {
        p_user_id: user.id,
        p_email: user.email,
        p_username: user.user_metadata?.username || '',
        p_hardware_id: null // Web clients don't use hardware limits
      });

      if (syncError) throw syncError;

      currentUser = user;
      currentUserProfile = syncData.user;
      currentUserProfiles = syncData.profiles || [];
      if (currentUserProfiles.length > 0) {
        activeProfileId = currentUserProfiles[0].id;
      }
      
      showToast('Logged in successfully!');
      closeAuthModal();
      updateNavbarUI();
      initializeSections();
    } catch (err) {
      console.error('Sync session failed:', err);
      showAuthMsg('Sync failed: ' + err.message, 'error');
    }
  }

  async function handleLogout() {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      
      currentUser = null;
      currentUserProfile = null;
      showToast('Logged out successfully.');
      updateNavbarUI();
      initializeSections();
    } catch (err) {
      showToast('Logout failed: ' + err.message, 'error');
    }
  }

  function updateNavbarUI() {
    const navAuthContainer = document.getElementById('nav-auth-container');
    const navMylistLink = document.getElementById('nav-mylist-link');
    const navAddonsLink = document.getElementById('nav-addons-link');
    const navAdminLink = document.getElementById('nav-admin-link');

    if (currentUser) {
      const email = currentUser.email;
      const isAdmin = currentUserProfile?.role === 'admin';
      
      // Use the application's default profile name and avatar if available!
      const defaultProfile = currentUserProfiles && currentUserProfiles.length > 0 ? currentUserProfiles[0] : null;
      
      let userName = defaultProfile ? defaultProfile.name : (currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.user_metadata?.username || email.split('@')[0]);
      let avatarUrl = '';
      
      if (defaultProfile && defaultProfile.avatar) {
        if (defaultProfile.avatar.startsWith('http')) {
          avatarUrl = defaultProfile.avatar;
        } else {
          // Resolve relative path to github raw content
          avatarUrl = 'https://raw.githubusercontent.com/amromotaw3/MediaVault/main/src/renderer/' + defaultProfile.avatar;
        }
      } else {
        avatarUrl = currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=8b5cf6&color=fff`;
      }

      navAuthContainer.innerHTML = `
        <div class="nav-profile-badge" id="nav-profile-badge">
          <img src="${avatarUrl}" alt="Avatar" class="nav-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=8b5cf6&color=fff'">
          <span class="nav-username">${userName}</span>
          <i class="fa-solid fa-chevron-down nav-dropdown-icon"></i>
          
          <div class="nav-dropdown" id="nav-dropdown">
            <div class="dropdown-header">
              <span class="dropdown-name">${userName}</span>
              <span class="dropdown-email">${email}</span>
            </div>
            <div class="dropdown-divider"></div>
            <a href="#hero" class="dropdown-item" id="dropdown-home-link"><i class="fa-solid fa-house"></i> Home</a>
            <a href="#mylist-section" class="dropdown-item" id="dropdown-mylist-link"><i class="fa-solid fa-star"></i> My List</a>
            <a href="#addons-section" class="dropdown-item" id="dropdown-addons-link"><i class="fa-solid fa-puzzle-piece"></i> Addons</a>
            <a href="#admin-panel-section" class="dropdown-item" id="dropdown-admin-link" style="display: none;"><i class="fa-solid fa-user-shield"></i> Admin Panel</a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item logout-btn" id="btn-logout-dropdown"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button>
          </div>
        </div>
      `;

      // Set up click toggle for dropdown
      const badge = document.getElementById('nav-profile-badge');
      const dropdown = document.getElementById('nav-dropdown');
      
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        badge.classList.toggle('active');
        dropdown.classList.toggle('active');
      });

      // Handle logout click
      document.getElementById('btn-logout-dropdown').addEventListener('click', (e) => {
        e.stopPropagation();
        handleLogout();
      });

      // Handle dropdown link clicks
      document.getElementById('dropdown-home-link').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        badge.classList.remove('active');
        dropdown.classList.remove('active');
        switchView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      const dropMylist = document.getElementById('dropdown-mylist-link');
      const dropAddons = document.getElementById('dropdown-addons-link');
      const dropAdmin = document.getElementById('dropdown-admin-link');

      // Show/hide navigation and dropdown links
      if (navMylistLink) navMylistLink.style.display = 'inline-block';
      navAddonsLink.style.display = 'inline-block';
      
      if (dropMylist) {
        dropMylist.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          badge.classList.remove('active');
          dropdown.classList.remove('active');
          switchView('mylist');
        });
      }

      dropAddons.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        badge.classList.remove('active');
        dropdown.classList.remove('active');
        switchView('addons');
      });

      if (isAdmin) {
        navAdminLink.style.display = 'inline-block';
        dropAdmin.style.display = 'flex';
        
        dropAdmin.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          badge.classList.remove('active');
          dropdown.classList.remove('active');
          switchView('admin');
        });
      } else {
        navAdminLink.style.display = 'none';
        dropAdmin.style.display = 'none';
      }
    } else {
      navAuthContainer.innerHTML = `<button class="btn-nav-primary" id="btn-login-nav">Sign In</button>`;

      if (navMylistLink) navMylistLink.style.display = 'none';
      navAddonsLink.style.display = 'none';
      navAdminLink.style.display = 'none';
    }
  }

  function initializeSections() {
    if (currentUser) {
      const email = currentUser.email;
      const isAdmin = currentUserProfile?.role === 'admin';
      
      const hash = window.location.hash;
      if (hash === '#addons-section') {
        switchView('addons');
      } else if (hash === '#mylist-section') {
        switchView('mylist');
      } else if (hash === '#admin-panel-section' && isAdmin) {
        switchView('admin');
      } else {
        if (currentView === 'addons') {
          switchView('addons');
        } else if (currentView === 'mylist') {
          switchView('mylist');
        } else if (currentView === 'admin' && isAdmin) {
          switchView('admin');
        } else {
          switchView('home');
        }
      }
    } else {
      switchView('home');
    }
  }

  // Get initial session and update navbar state before setting up event listeners
  if (supabaseClient) {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        currentUser = session.user;

        // Clean URL hash so it doesn't try to parse it on refresh and break session
        if (window.location.hash && (window.location.hash.includes('access_token=') || window.location.hash.includes('id_token='))) {
          window.history.replaceState(null, null, window.location.pathname + window.location.search);
        }

        // Fetch profiles or other syncing logic can trigger synchronously here
        syncAndInitialize(session.user).then(() => {
          updateNavbarUI();
          initializeSections();
        });
      } else {
        updateNavbarUI();
        initializeSections();
      }
    }).catch(err => {
      console.error('Failed to get initial session:', err);
      updateNavbarUI();
      initializeSections();
    });
  } else {
    updateNavbarUI();
    initializeSections();
  }

  // Set up auth state change listener to handle OAuth redirects and initial loads automatically
  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth State Change] Event: ${event}, User: ${session?.user?.email}`);
      if (session && session.user) {
        // Clean URL hash so it doesn't try to parse it on refresh and break session
        if (window.location.hash && (window.location.hash.includes('access_token=') || window.location.hash.includes('id_token='))) {
          window.history.replaceState(null, null, window.location.pathname + window.location.search);
        }

        // Prevent duplicate loads by checking user id
        if (!currentUser || currentUser.id !== session.user.id) {
          await syncAndInitialize(session.user);
        }
      } else {
        currentUser = null;
        currentUserProfile = null;
        currentUserProfiles = [];
        activeProfileId = null;
        updateNavbarUI();
        initializeSections();
      }
    });
  }


  // ==========================================
  // --- Addons Listing Logic ---
  // ==========================================
  const addonsGrid = document.getElementById('addons-grid');

  async function loadAddons() {
    if (!supabaseClient) return;
    addonsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> Loading Addons...</div>';
    
    try {
      const { data: addons, error } = await supabaseClient
        .from('stremio_addons')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (!addons || addons.length === 0) {
        addonsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;"><i class="fa-solid fa-circle-info" style="font-size: 24px; margin-bottom: 15px; color: var(--accent);"></i><br>No addons supported yet. Check back later!</div>';
        return;
      }

      addonsGrid.innerHTML = '';
      addons.forEach(addon => {
        const card = document.createElement('div');
        card.className = 'addon-card';
        
        // Convert http:// or https:// to mediavault:// for direct installation in MediaVault app
        const installUrl = addon.manifest_url.replace(/^https?:\/\//i, 'mediavault://');

        card.innerHTML = `
          <div class="addon-header">
            <img src="${addon.icon || 'imgs/appicon.png'}" alt="${addon.name}" class="addon-logo" onerror="this.src='imgs/appicon.png'">
            <div class="addon-title-wrap">
              <h3 class="addon-name">${addon.name}</h3>
              <span class="addon-badge">MEEM Addon</span>
            </div>
          </div>
          <p class="addon-desc">${addon.description || 'No description provided.'}</p>
          <div class="addon-actions">
            <a href="${installUrl}" class="addon-btn addon-btn-primary"><i class="fa-solid fa-download"></i> Install Addon</a>
            <button class="addon-btn addon-btn-secondary btn-copy-url" data-url="${addon.manifest_url}"><i class="fa-solid fa-copy"></i> Copy Link</button>
          </div>
        `;

        // Add install button click event with security warning
        card.querySelector('.addon-btn-primary').addEventListener('click', function(e) {
          const confirmInstall = confirm(`Addon Security Warning:\n\nYou are about to install external addon "${addon.name}". Addons run third-party code and communicate with external web servers.\n\nDo you want to proceed and open MEEM?`);
          if (!confirmInstall) {
            e.preventDefault();
          }
        });

        // Add copy button event
        card.querySelector('.btn-copy-url').addEventListener('click', function() {
          const url = this.getAttribute('data-url');
          navigator.clipboard.writeText(url).then(() => {
            showToast('Addon manifest link copied!');
          }).catch(err => {
            showToast('Failed to copy link.', 'error');
          });
        });

        addonsGrid.appendChild(card);
      });
    } catch (err) {
      console.error('Failed to load addons:', err);
      addonsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #f87171;">Failed to load addons: ${err.message}</div>`;
    }
  }

  // ==========================================
  // --- Admin Panel Logic ---
  // ==========================================
  const adminSidebar = document.querySelector('.admin-sidebar');
  const adminTabContents = document.querySelectorAll('.admin-tab-content');

  // Sidebar Tab Switching
  adminSidebar.querySelectorAll('.admin-nav-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      adminSidebar.querySelectorAll('.admin-nav-btn[data-tab]').forEach(b => b.classList.remove('active'));
      adminTabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      document.getElementById(tabId).classList.add('active');
      selectedAdminTab = tabId;

      if (tabId === 'users-tab') loadAdminUsers();
      else if (tabId === 'addons-tab') loadAdminAddonsTab();
    });
  });

  // Copy Callback Link Button
  const btnCopyCallback = document.getElementById('btn-copy-callback');
  if (btnCopyCallback) {
    btnCopyCallback.addEventListener('click', () => {
      const callbackUrl = 'https://mediavault-five.vercel.app/auth/callback';
      navigator.clipboard.writeText(callbackUrl).then(() => {
        showToast('Callback URL copied to clipboard!');
        
        // Premium visual feedback
        btnCopyCallback.classList.add('copied');
        btnCopyCallback.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        
        setTimeout(() => {
          btnCopyCallback.classList.remove('copied');
          btnCopyCallback.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Callback Link';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy callback URL:', err);
        showToast('Failed to copy link', 'error');
      });
    });
  }

  function loadAdminPanel() {
    if (selectedAdminTab === 'users-tab') {
      loadAdminUsers();
    } else {
      loadAdminAddonsTab();
    }
  }

  // --- Admin: Users & Subscriptions ---
  const usersTableBody = document.getElementById('users-table-body');
  const userCountBadge = document.getElementById('user-count');

  async function loadAdminUsers() {
    if (!supabaseClient) return;
    usersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> Fetching users list...</td></tr>';

    try {
      const { data: users, error } = await supabaseClient
        .from('users_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      activeUsers = users || [];
      userCountBadge.innerText = `${activeUsers.length} Users`;
      usersTableBody.innerHTML = '';

      if (activeUsers.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No registered users found.</td></tr>';
        return;
      }

      activeUsers.forEach(user => {
        const tr = document.createElement('tr');
        
        // Determine status
        let statusBadge = '<span class="badge-status active">Active</span>';
        if (user.is_banned) {
          statusBadge = '<span class="badge-status banned">Banned</span>';
        } else if (user.subscription_expires_at) {
          const expiryDate = new Date(user.subscription_expires_at);
          if (expiryDate <= new Date()) {
            statusBadge = '<span class="badge-status expired">Expired</span>';
          }
        }

        // Format subscription expiry date
        let expiryText = 'No active sub';
        if (user.subscription_expires_at) {
          const date = new Date(user.subscription_expires_at);
          expiryText = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        tr.innerHTML = `
          <td style="font-weight: 600; color: #fff;">${user.email}</td>
          <td><span style="text-transform: capitalize;">${user.role || 'user'}</span></td>
          <td>${user.max_devices || 3}</td>
          <td style="font-size: 13px; color: var(--text-secondary);">${expiryText}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn-table-action btn-edit-user" data-id="${user.id}"><i class="fa-solid fa-edit"></i> Edit</button>
            <button class="btn-table-action ban-btn btn-ban-user" data-id="${user.id}" data-banned="${user.is_banned}">
              <i class="fa-solid ${user.is_banned ? 'fa-unlock' : 'fa-ban'}"></i> ${user.is_banned ? 'Unban' : 'Ban'}
            </button>
          </td>
        `;

        // Attach event listeners
        tr.querySelector('.btn-edit-user').addEventListener('click', () => openEditUserModal(user));
        tr.querySelector('.btn-ban-user').addEventListener('click', function() {
          const userId = this.getAttribute('data-id');
          const isBanned = this.getAttribute('data-banned') === 'true';
          toggleBanUser(userId, isBanned);
        });

        usersTableBody.appendChild(tr);
      });

    } catch (err) {
      console.error('Failed to load admin users:', err);
      usersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #f87171;">Failed to fetch users: ${err.message}</td></tr>`;
    }
  }

  // Ban Modal DOM Elements
  const banModal = document.getElementById('ban-modal');
  const banCloseBtn = document.getElementById('ban-close-btn');
  const banDevicesForm = document.getElementById('ban-devices-form');
  const banUserEmailSpan = document.getElementById('ban-user-email');
  const banDevicesList = document.getElementById('ban-devices-list');
  const banReasonInput = document.getElementById('ban-reason');
  const banTargetUserIdInput = document.getElementById('ban-target-user-id');
  const btnBanSelectAll = document.getElementById('btn-ban-select-all');
  const btnBanSelectNone = document.getElementById('btn-ban-select-none');

  function closeBanModal() {
    banModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  if (banCloseBtn) {
    banCloseBtn.addEventListener('click', closeBanModal);
  }
  if (banModal) {
    banModal.addEventListener('click', (e) => {
      if (e.target === banModal) closeBanModal();
    });
  }

  if (btnBanSelectAll) {
    btnBanSelectAll.addEventListener('click', () => {
      document.querySelectorAll('.ban-device-checkbox').forEach(cb => cb.checked = true);
    });
  }
  if (btnBanSelectNone) {
    btnBanSelectNone.addEventListener('click', () => {
      document.querySelectorAll('.ban-device-checkbox').forEach(cb => cb.checked = false);
    });
  }

  // Handle Ban Devices Form Submission
  if (banDevicesForm) {
    banDevicesForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!supabaseClient) return;

      const userId = banTargetUserIdInput.value;
      const reason = banReasonInput.value.trim() || 'Banned by Administrator';
      
      const checkedBoxes = document.querySelectorAll('.ban-device-checkbox:checked');
      const hardwareIdsToBlacklist = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-hwid'));

      try {
        // 1. Ban the account
        const { error: banError } = await supabaseClient
          .from('users_accounts')
          .update({ is_banned: true })
          .eq('id', userId);

        if (banError) throw banError;

        // 2. Blacklist selected hardware IDs
        if (hardwareIdsToBlacklist.length > 0) {
          const blacklistData = hardwareIdsToBlacklist.map(hwId => ({
            hardware_id: hwId,
            reason: reason,
            is_banned: true,
            banned_at: new Date().toISOString()
          }));

          const { error: blacklistError } = await supabaseClient
            .from('hardware_blacklist')
            .upsert(blacklistData);

          if (blacklistError) throw blacklistError;

          // 3. Delete binding/session for these devices
          const { error: deleteBindingsError } = await supabaseClient
            .from('user_devices')
            .delete()
            .in('hardware_id', hardwareIdsToBlacklist);

          if (deleteBindingsError) throw deleteBindingsError;
        }

        showToast('Successfully banned user account and blacklisted selected devices.');
        closeBanModal();
        loadAdminUsers();
      } catch (err) {
        console.error('Failed to execute hardware/account ban:', err);
        showToast('Ban failed: ' + err.message, 'error');
      }
    });
  }

  // Toggle Ban Status (Bans account & optionally blacklists hardware IDs)
  async function toggleBanUser(userId, currentBanStatus) {
    if (!supabaseClient) return;

    // Fetch user details first for email display
    const targetUser = activeUsers.find(u => u.id === userId);
    const userEmail = targetUser ? targetUser.email : 'Unknown User';

    if (currentBanStatus) {
      // Unbanning: clean, straightforward
      try {
        // 1. Unban user
        const { error: unbanError } = await supabaseClient
          .from('users_accounts')
          .update({ is_banned: false })
          .eq('id', userId);

        if (unbanError) throw unbanError;

        // 2. Automatically remove their hardware IDs from blacklist so they can log in again
        const { data: devices } = await supabaseClient
          .from('user_devices')
          .select('hardware_id')
          .eq('user_id', userId);

        if (devices && devices.length > 0) {
          const hwIds = devices.map(d => d.hardware_id);
          await supabaseClient
            .from('hardware_blacklist')
            .delete()
            .in('hardware_id', hwIds);
        }

        showToast('Successfully unbanned user account and associated hardware.');
        loadAdminUsers();
      } catch (err) {
        console.error('Failed to unban user:', err);
        showToast('Unban failed: ' + err.message, 'error');
      }
    } else {
      // Banning: Fetch registered devices to let admin select which to blacklist
      try {
        const { data: devices, error: deviceErr } = await supabaseClient
          .from('user_devices')
          .select('*')
          .eq('user_id', userId);

        if (deviceErr) throw deviceErr;

        if (!devices || devices.length === 0) {
          // No devices bound, ban account directly
          const { error: directBanError } = await supabaseClient
            .from('users_accounts')
            .update({ is_banned: true })
            .eq('id', userId);

          if (directBanError) throw directBanError;

          showToast('Successfully banned user account (no devices found).');
          loadAdminUsers();
        } else {
          // Open selector modal
          banTargetUserIdInput.value = userId;
          banUserEmailSpan.innerText = userEmail;
          banReasonInput.value = '';
          banDevicesList.innerHTML = '';

          devices.forEach(dev => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '12px';
            item.style.padding = '10px';
            item.style.background = 'rgba(255,255,255,0.02)';
            item.style.border = '1px solid rgba(255,255,255,0.05)';
            item.style.borderRadius = '8px';

            item.innerHTML = `
              <input type="checkbox" id="chk-dev-${dev.hardware_id}" class="ban-device-checkbox" data-hwid="${dev.hardware_id}" checked style="width: 18px; height: 18px; accent-color: #ef4444; cursor: pointer;">
              <label for="chk-dev-${dev.hardware_id}" style="color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; flex: 1; text-align: left;">
                ${dev.device_name || 'Unnamed Device'} <br>
                <span style="color: var(--text-secondary); font-size: 11px; font-family: monospace; font-weight: 400;">HWID: ${dev.hardware_id}</span>
              </label>
            `;
            banDevicesList.appendChild(item);
          });

          banModal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      } catch (err) {
        console.error('Failed to open device selector ban modal:', err);
        showToast('Action failed: ' + err.message, 'error');
      }
    }
  }

  // --- Edit User Modal Logic ---
  const editUserModal = document.getElementById('edit-user-modal');
  const editUserCloseBtn = document.getElementById('edit-user-close-btn');
  const editUserForm = document.getElementById('edit-user-form');
  const editUserEmail = document.getElementById('edit-user-email');
  const editUserIdInput = document.getElementById('edit-user-id');
  const editUserRole = document.getElementById('edit-user-role');
  const editUserMaxDevices = document.getElementById('edit-user-max-devices');
  const editUserExpiry = document.getElementById('edit-user-expiry');

  function openEditUserModal(user) {
    editUserModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    editUserIdInput.value = user.id;
    editUserEmail.innerText = user.email;
    editUserRole.value = user.role || 'user';
    editUserMaxDevices.value = user.max_devices || 3;

    // Set Expiry input datetime
    if (user.subscription_expires_at) {
      const date = new Date(user.subscription_expires_at);
      // Format to yyyy-MM-ddThh:mm in local time
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
      editUserExpiry.value = localISOTime;
    } else {
      editUserExpiry.value = '';
    }
  }

  editUserCloseBtn.addEventListener('click', closeEditUserModal);
  editUserModal.addEventListener('click', (e) => {
    if (e.target === editUserModal) closeEditUserModal();
  });

  function closeEditUserModal() {
    editUserModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Quick Date presets inside Edit User Modal
  editUserForm.querySelectorAll('.btn-quick-date').forEach(btn => {
    btn.addEventListener('click', () => {
      const days = parseInt(btn.dataset.days);
      const expiryInput = document.getElementById('edit-user-expiry');
      
      if (days === 0) {
        // Expire immediately (set to now)
        const now = new Date();
        expiryInput.value = now.toISOString().slice(0, 16);
      } else {
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiryInput.value = date.toISOString().slice(0, 16);
      }
    });
  });

  // Submit User Edit Form
  editUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;

    const userId = editUserIdInput.value;
    const role = editUserRole.value;
    const maxDevices = parseInt(editUserMaxDevices.value);
    const expiry = editUserExpiry.value;

    const updateObj = {
      role: role,
      max_devices: maxDevices,
      subscription_expires_at: expiry ? new Date(expiry).toISOString() : null
    };

    try {
      const { error } = await supabaseClient
        .from('users_accounts')
        .update(updateObj)
        .eq('id', userId);

      if (error) throw error;

      showToast('User account updated successfully!');
      closeEditUserModal();
      loadAdminUsers();
    } catch (err) {
      showToast('Failed to update user: ' + err.message, 'error');
    }
  });

  // --- Admin: Manage Addons Tab ---
  const addAddonForm = document.getElementById('add-addon-form');
  const btnFetchAddon = document.getElementById('btn-fetch-addon');
  const adminAddonsList = document.getElementById('admin-addons-list');

  async function loadAdminAddonsTab() {
    loadAdminAddonsList();
  }

  async function loadAdminAddonsList() {
    if (!supabaseClient) return;
    adminAddonsList.innerHTML = '<div style="text-align: center; color: var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';

    try {
      const { data: addons, error } = await supabaseClient
        .from('stremio_addons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      adminAddonsList.innerHTML = '';
      if (!addons || addons.length === 0) {
        adminAddonsList.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No addons configured.</div>';
        return;
      }

      addons.forEach(addon => {
        const item = document.createElement('div');
        item.className = 'admin-addons-item';
        item.innerHTML = `
          <img src="${addon.icon || 'imgs/appicon.png'}" onerror="this.src='imgs/appicon.png'">
          <div class="admin-addons-info">
            <div class="admin-addons-name">${addon.name}</div>
            <div class="admin-addons-url">${addon.manifest_url}</div>
          </div>
          <button class="admin-addons-delete" data-id="${addon.id}"><i class="fa-solid fa-trash"></i></button>
        `;

        item.querySelector('.admin-addons-delete').addEventListener('click', () => deleteAddon(addon.id));
        adminAddonsList.appendChild(item);
      });
    } catch (err) {
      console.error('Failed to load admin addons list:', err);
      adminAddonsList.innerHTML = `<div style="color: #f87171;">Failed to load addons: ${err.message}</div>`;
    }
  }

  // Fetch manifest JSON metadata automatically
  btnFetchAddon.addEventListener('click', async () => {
    const manifestUrl = document.getElementById('addon-manifest-url').value.trim();
    if (!manifestUrl) {
      showToast('Please enter a Manifest URL first.', 'error');
      return;
    }

    btnFetchAddon.disabled = true;
    btnFetchAddon.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) throw new Error('Failed to fetch the URL');
      const manifest = await response.json();

      if (manifest.name) document.getElementById('addon-name').value = manifest.name;
      if (manifest.description) document.getElementById('addon-description').value = manifest.description;
      
      const logoUrl = manifest.logo || manifest.icon || '';
      if (logoUrl) document.getElementById('addon-logo-url').value = logoUrl;

      showToast('Addon details fetched successfully!');
    } catch (err) {
      console.warn('CORS or fetch error:', err);
      showToast('CORS block or invalid JSON. Please fill details manually.', 'error');
    } finally {
      btnFetchAddon.disabled = false;
      btnFetchAddon.innerHTML = 'Fetch';
    }
  });

  // Add Addon submission
  addAddonForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;

    const manifestUrl = document.getElementById('addon-manifest-url').value.trim();
    const name = document.getElementById('addon-name').value.trim();
    const description = document.getElementById('addon-description').value.trim();
    const icon = document.getElementById('addon-logo-url').value.trim();

    try {
      const { error } = await supabaseClient
        .from('stremio_addons')
        .insert({
          name: name,
          description: description,
          icon: icon || null,
          manifest_url: manifestUrl
        });

      if (error) throw error;

      showToast('Addon added successfully!');
      addAddonForm.reset();
      loadAdminAddonsList();
      loadAddons(); // Refresh the client view as well
    } catch (err) {
      showToast('Failed to save addon: ' + err.message, 'error');
    }
  });

  // Delete Addon
  async function deleteAddon(addonId) {
    if (!supabaseClient) return;
    if (!confirm('Are you sure you want to delete this addon?')) return;

    try {
      const { error } = await supabaseClient
        .from('stremio_addons')
        .delete()
        .eq('id', addonId);

      if (error) throw error;

      showToast('Addon deleted successfully.');
      loadAdminAddonsList();
      loadAddons(); // Refresh the client view as well
    } catch (err) {
      showToast('Failed to delete addon: ' + err.message, 'error');
    }
  }

  // --- Showcase Panels Interaction Logic ---
  const panels = document.querySelectorAll('.floating-panel');
  const viewDesktop = document.getElementById('view-desktop');
  const viewMobile = document.getElementById('view-mobile');
  const appScreenshot = document.getElementById('app-screenshot');
  const showcaseScreen = document.getElementById('showcase-screen');

  let currentSubtitleImg = 'imgs/subtitles_showcase.png';

  if (panels.length > 0 && viewDesktop && viewMobile && appScreenshot) {
    panels.forEach(panel => {
      panel.addEventListener('click', () => {
        const view = panel.dataset.view;
        const wasActive = panel.classList.contains('active');

        // Deactivate all panels
        panels.forEach(p => p.classList.remove('active'));
        // Activate clicked panel
        panel.classList.add('active');

        // Reset showcase screen styles
        if (showcaseScreen) showcaseScreen.classList.remove('phone-view-active');

        if (view === 'mobile') {
          viewDesktop.style.display = 'none';
          viewMobile.style.display = 'block';
          if (showcaseScreen) showcaseScreen.classList.add('phone-view-active');
        } else {
          viewDesktop.style.display = 'block';
          viewMobile.style.display = 'none';

          if (view === 'addons') {
            appScreenshot.src = 'imgs/addon_showcase.png';
          } else if (view === 'subtitles') {
            if (wasActive) {
              currentSubtitleImg = currentSubtitleImg.includes('subtitles_showcase2') 
                ? 'imgs/subtitles_showcase.png' 
                : 'imgs/subtitles_showcase2.png';
            }
            appScreenshot.src = currentSubtitleImg;
          } else if (view === 'accounts') {
            appScreenshot.src = 'imgs/accounts_showcase.png';
          } else if (view === 'downloads') {
            appScreenshot.src = 'imgs/downloads_showcase.png';
          } else if (view === 'profiles') {
            appScreenshot.src = 'imgs/profiles_showcase.png';
          }
        }
      });
    });
  }

  // --- CTA Slideshow Logic removed ---

  // ==========================================
  // --- My List & Library Logic ---
  // ==========================================
  async function loadMyList() {
    if (!supabaseClient || !currentUser) return;
    
    // Set up profile selector if it hasn't been set up yet
    setupMyListProfileSelector();
    
    // Bind My List tab buttons
    setupMyListTabs();
    
    // Render current active tab content
    renderActiveMyListTab();
  }

  function setupMyListProfileSelector() {
    const wrapper = document.getElementById('mylist-profile-selector-wrap');
    const select = document.getElementById('mylist-profile-select');
    if (!select || !wrapper) return;

    if (currentUserProfiles.length > 0) {
      wrapper.style.display = 'block';
      // If no active profile selected yet, select the first one
      if (!activeProfileId) {
        activeProfileId = currentUserProfiles[0].id;
      }
      
      // Populate select options if count changed or empty
      if (select.children.length !== currentUserProfiles.length) {
        select.innerHTML = '';
        currentUserProfiles.forEach(prof => {
          const opt = document.createElement('option');
          opt.value = prof.id;
          opt.textContent = prof.name;
          if (prof.id === activeProfileId) opt.selected = true;
          select.appendChild(opt);
        });

        // Add change listener
        select.onchange = (e) => {
          activeProfileId = e.target.value;
          renderActiveMyListTab();
        };
      }
    } else {
      wrapper.style.display = 'none';
    }
  }

  function setupMyListTabs() {
    const tabs = document.querySelectorAll('.mylist-tab-btn');
    tabs.forEach(btn => {
      // Remove any existing click listeners to avoid duplication
      btn.onclick = (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        
        const tabName = btn.getAttribute('data-tab');
        activeMyListTab = tabName;
        
        // Update visibility of panes
        document.querySelectorAll('.mylist-tab-pane').forEach(p => p.classList.remove('active'));
        const activePane = document.getElementById(`pane-${tabName}`);
        if (activePane) activePane.classList.add('active');
        
        renderActiveMyListTab();
      };
      
      // Keep selected tab in sync
      if (btn.getAttribute('data-tab') === activeMyListTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.mylist-tab-pane').forEach(p => {
      if (p.id === `pane-${activeMyListTab}`) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }

  const cinemetaCache = {};
  async function fetchItemDetails(mediaId, type = 'movie') {
    const baseId = mediaId.split(':')[0];
    if (cinemetaCache[baseId]) return cinemetaCache[baseId];

    try {
      const isImdb = baseId.startsWith('tt');
      const resolvedType = mediaId.includes(':') ? 'series' : type;
      if (isImdb) {
        const resp = await fetch(`https://v3-cinemeta.strem.io/meta/${resolvedType}/${baseId}.json`);
        const data = await resp.json();
        const meta = data?.meta;
        if (meta) {
          cinemetaCache[baseId] = {
            title: meta.name || meta.title || 'Untitled',
            poster: meta.poster || 'imgs/img1.png',
            backdrop: meta.background || ''
          };
          return cinemetaCache[baseId];
        }
      }
    } catch (e) {
      console.warn('Cinemeta fetch failed for', baseId, e);
    }
    return { title: 'Imported Item', poster: 'imgs/img1.png', backdrop: '' };
  }

  async function renderActiveMyListTab() {
    if (!activeProfileId) return;

    if (activeMyListTab === 'watching') {
      await renderWatchingTab();
    } else if (activeMyListTab === 'watchlist') {
      await renderWatchlistTab();
    } else if (activeMyListTab === 'watched') {
      await renderWatchedTab();
    } else if (activeMyListTab === 'collections') {
      await renderCollectionsTab();
    }
  }

  async function renderWatchingTab() {
    const grid = document.getElementById('grid-watching');
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> Loading watch progress...</div>';

    try {
      // 1. Fetch playback history
      const { data: playback, error } = await supabaseClient
        .from('playback_history')
        .select('*')
        .eq('profile_id', activeProfileId)
        .eq('watched', false)
        .gt('progress', 0)
        .order('last_watched_at', { ascending: false });

      if (error) throw error;

      if (!playback || playback.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;"><i class="fa-solid fa-circle-info" style="font-size: 24px; margin-bottom: 15px; color: var(--accent);"></i><br>No in-progress shows or movies. Start watching inside MEEM!</div>';
        return;
      }

      // 2. Fetch watchlist items for resolving titles
      const { data: watchlist } = await supabaseClient
        .from('watchlist_items')
        .select('*')
        .eq('profile_id', activeProfileId);

      grid.innerHTML = '';
      
      for (const row of playback) {
        // Resolve metadata
        const baseId = row.media_id.split(':')[0];
        let meta = watchlist?.find(item => item.media_id === baseId);
        
        let title = meta?.title;
        let poster = meta?.poster_path;
        
        if (!title || !poster) {
          const fallback = await fetchItemDetails(row.media_id, 'movie');
          title = title || fallback.title;
          poster = poster || fallback.poster;
        }

        // Calculate progress percentage
        const progressPercent = row.duration ? Math.min((row.progress / row.duration) * 100, 100) : 0;
        
        // Subtext if it is an episode (e.g. S1:E2)
        let subtext = 'Movie';
        if (row.media_id.includes(':')) {
          const parts = row.media_id.split(':');
          subtext = `Season ${parts[1]} — Episode ${parts[2]}`;
        }

        const card = document.createElement('div');
        card.className = 'mylist-poster-card';
        card.innerHTML = `
          <img src="${poster}" alt="${title}" class="mylist-poster-img" onerror="this.src='imgs/img1.png'">
          <div class="mylist-progress-container">
            <div class="mylist-progress-bar" style="width: ${progressPercent}%"></div>
          </div>
          <div class="mylist-poster-overlay">
            <span class="mylist-poster-title">${title}</span>
            <span class="mylist-poster-meta">${subtext}</span>
          </div>
        `;
        grid.appendChild(card);
      }
    } catch (err) {
      console.error('Failed to load watching tab:', err);
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ef4444;">Failed to load data.</div>';
    }
  }

  async function renderWatchlistTab() {
    const grid = document.getElementById('grid-watchlist');
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> Loading watchlist...</div>';

    try {
      const { data: watchlist, error } = await supabaseClient
        .from('watchlist_items')
        .select('*')
        .eq('profile_id', activeProfileId)
        .order('added_at', { ascending: false });

      if (error) throw error;

      if (!watchlist || watchlist.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;"><i class="fa-solid fa-circle-info" style="font-size: 24px; margin-bottom: 15px; color: var(--accent);"></i><br>Your watchlist is empty. Add movies or shows to your watchlist!</div>';
        return;
      }

      grid.innerHTML = '';
      
      watchlist.forEach(row => {
        const title = row.title || 'Untitled';
        const poster = row.poster_path || 'imgs/img1.png';
        const subtext = row.type === 'series' ? 'TV Show' : 'Movie';

        const card = document.createElement('div');
        card.className = 'mylist-poster-card';
        card.innerHTML = `
          <img src="${poster}" alt="${title}" class="mylist-poster-img" onerror="this.src='imgs/img1.png'">
          <div class="mylist-poster-overlay">
            <span class="mylist-poster-title">${title}</span>
            <span class="mylist-poster-meta">${subtext}</span>
          </div>
        `;
        grid.appendChild(card);
      });
    } catch (err) {
      console.error('Failed to load watchlist:', err);
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ef4444;">Failed to load watchlist.</div>';
    }
  }

  async function renderWatchedTab() {
    const grid = document.getElementById('grid-watched');
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> Loading watched history...</div>';

    try {
      // 1. Fetch watched items
      const { data: playback, error } = await supabaseClient
        .from('playback_history')
        .select('*')
        .eq('profile_id', activeProfileId)
        .eq('watched', true)
        .order('last_watched_at', { ascending: false });

      if (error) throw error;

      if (!playback || playback.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;"><i class="fa-solid fa-circle-info" style="font-size: 24px; margin-bottom: 15px; color: var(--accent);"></i><br>You haven\'t fully watched any media yet!</div>';
        return;
      }

      // 2. Fetch watchlist items for resolving titles
      const { data: watchlist } = await supabaseClient
        .from('watchlist_items')
        .select('*')
        .eq('profile_id', activeProfileId);

      grid.innerHTML = '';
      
      for (const row of playback) {
        // Resolve metadata
        const baseId = row.media_id.split(':')[0];
        let meta = watchlist?.find(item => item.media_id === baseId);
        
        let title = meta?.title;
        let poster = meta?.poster_path;
        
        if (!title || !poster) {
          const fallback = await fetchItemDetails(row.media_id, 'movie');
          title = title || fallback.title;
          poster = fallback.poster || 'imgs/img1.png';
        }

        let subtext = 'Movie';
        if (row.media_id.includes(':')) {
          const parts = row.media_id.split(':');
          subtext = `Season ${parts[1]} — Episode ${parts[2]}`;
        }

        const card = document.createElement('div');
        card.className = 'mylist-poster-card';
        card.innerHTML = `
          <img src="${poster}" alt="${title}" class="mylist-poster-img" onerror="this.src='imgs/img1.png'">
          <div class="mylist-poster-overlay">
            <span class="mylist-poster-title">${title}</span>
            <span class="mylist-poster-meta">${subtext} (Watched)</span>
          </div>
        `;
        grid.appendChild(card);
      }
    } catch (err) {
      console.error('Failed to load watched tab:', err);
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ef4444;">Failed to load data.</div>';
    }
  }

  async function renderCollectionsTab() {
    const container = document.getElementById('container-collections');
    if (!container) return;
    container.innerHTML = '<div style="text-align: center; color: var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> Loading collections...</div>';

    try {
      // Fetch custom lists
      const { data: customLists, error: clError } = await supabaseClient
        .from('custom_lists')
        .select('id, list_name, theme_color, list_items(*)')
        .eq('profile_id', activeProfileId);

      if (clError) throw clError;

      // Fetch shared lists
      let sharedLists = [];
      try {
        const { data: memberRefs } = await supabaseClient
          .from('list_members')
          .select('list_id')
          .eq('user_id', currentUser.id)
          .eq('status', 'joined');
          
        if (memberRefs && memberRefs.length > 0) {
          const sharedListIds = memberRefs.map(m => m.list_id);
          const { data: fetchedShared, error: sharedError } = await supabaseClient
            .from('custom_lists')
            .select('id, list_name, theme_color, list_items(*)')
            .in('id', sharedListIds);
          if (!sharedError && fetchedShared) {
            sharedLists = fetchedShared;
          }
        }
      } catch (e) {
        console.warn('Failed to load shared lists:', e);
      }

      const combinedLists = [...(customLists || [])];
      const ownedIds = new Set(combinedLists.map(l => l.id));
      for (const list of sharedLists) {
        if (!ownedIds.has(list.id)) {
          combinedLists.push(list);
        }
      }

      if (combinedLists.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 40px;"><i class="fa-solid fa-circle-info" style="font-size: 24px; margin-bottom: 15px; color: var(--accent);"></i><br>No custom lists or collections created yet. Create lists in the MEEM app!</div>';
        return;
      }

      container.innerHTML = '';
      
      combinedLists.forEach(list => {
        const listName = list.list_name || 'Unnamed List';
        const themeColor = list.theme_color || '#a855f7';
        const items = list.list_items || [];
        const isShared = !customLists.some(l => l.id === list.id);

        const groupDiv = document.createElement('div');
        groupDiv.className = 'collection-group';
        
        let gridHtml = '';
        if (items.length === 0) {
          gridHtml = '<div style="color: var(--text-secondary); padding: 20px 0;">This list is empty.</div>';
        } else {
          gridHtml = '<div class="mylist-grid">';
          items.forEach(item => {
            const title = item.title || 'Untitled';
            const poster = item.poster_path || 'imgs/img1.png';
            const subtext = item.type === 'series' ? 'TV Show' : 'Movie';
            
            gridHtml += `
              <div class="mylist-poster-card">
                <img src="${poster}" alt="${title}" class="mylist-poster-img" onerror="this.src='imgs/img1.png'">
                <div class="mylist-poster-overlay">
                  <span class="mylist-poster-title">${title}</span>
                  <span class="mylist-poster-meta">${subtext}</span>
                </div>
              </div>
            `;
          });
          gridHtml += '</div>';
        }

        groupDiv.innerHTML = `
          <div class="collection-header">
            <h3 class="collection-title">
              <span class="collection-dot" style="background-color: ${themeColor}"></span>
              ${listName}
              ${isShared ? '<span style="font-size: 11px; background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 2px 8px; border-radius: 100px; font-weight: 700; margin-left: 8px;">SHARED</span>' : ''}
            </h3>
            <span class="collection-badge">${items.length} ${items.length === 1 ? 'item' : 'items'}</span>
          </div>
          ${gridHtml}
        `;
        container.appendChild(groupDiv);
      });
    } catch (err) {
      console.error('Failed to load collections:', err);
      container.innerHTML = '<div style="text-align: center; color: #ef4444;">Failed to load collections.</div>';
    }
  }

});
