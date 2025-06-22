import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { initMenu } from './src/utils/menu.js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Initialize the menu
    initMenu();
    
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setShowResults(true);

    try {
      const { data: posts, error } = await supabase
        .from('archive_posts')
        .select(`
          *,
          users:user_id (
            email,
            raw_user_meta_data
          )
        `)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,prompt.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setSearchResults(posts || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const closeSearch = () => {
    setShowResults(false);
    setSearchResults([]);
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getAuthorName = (post) => {
    return post.users?.raw_user_meta_data?.display_name || 
           post.users?.raw_user_meta_data?.full_name || 
           post.users?.email?.split('@')[0] || 
           'Anonymous';
  };

  return (
    <>
      {/* Menu Header */}
      <div className="menu-header">
        <img src="https://i.imgur.com/sMqKf3K.png" alt="Menu Logo" className="menu-logo" />
        <div className="nav-links">
          <div className="nav-container">
            <a href="/publish.html" className="nav-item publish-nav">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14"/>
                <path d="M5 12h14"/>
              </svg>
              Publish
            </a>
            <a href="/index.html" className="nav-item archives-nav active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v16a2 2 0 002 2h12a2 2 0 002-2V8.342a2 2 0 00-.602-1.43l-4.44-4.342A2 2 0 0013.56 2H6a2 2 0 00-2 2z"/>
                <path d="M14 2v4a2 2 0 002 2h4"/>
              </svg>
              ARCHIVES
            </a>
            <a href="/collab.html" className="nav-item collab-nav">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              COLLAB
            </a>
          </div>
        </div>
      </div>

      {/* Menu Overlay and Options */}
      <div className="menu-overlay"></div>
      <div className="menu-options info-menu"></div>
      <div className="left-edge-trigger"></div>
      <div className="menu-hamburger-indicator">
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="logo-container">
          <img src="https://i.imgur.com/sMqKf3K.png" alt="WikiDeep.io" className="main-logo" />
        </div>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search DeepWiki.io Open AI Archives"
              className="search-input"
            />
            <button type="submit" className="search-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
        </form>

        <div className="action-buttons">
          <button className="action-button search-btn" onClick={() => document.querySelector('.search-input').focus()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </button>
          <a href="/browse-archive.html" className="action-button browse-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            Browse
          </a>
        </div>

        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">1,247</div>
            <div className="stat-label">AI Insights Shared</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">89.3 kWh</div>
            <div className="stat-label">Energy Saved</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">523</div>
            <div className="stat-label">Active Contributors</div>
          </div>
        </div>
      </div>

      {/* Search Results Overlay */}
      {showResults && (
        <div className="archive-results-container active">
          <div className="search-results-header">
            <h2>Archive Search Results</h2>
            <button onClick={closeSearch} className="close-search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="search-results">
            {isSearching ? (
              <div className="search-loading">
                <p>Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="results-grid">
                {searchResults.map((post) => (
                  <div key={post.id} className="result-card" onClick={() => window.location.href = `/view-post.html?id=${post.id}&type=archive`}>
                    <h3 className="result-title">{post.title}</h3>
                    <div className="result-meta">
                      <span>👤 {getAuthorName(post)}</span>
                      <span>🤖 {post.ai_model}</span>
                      <span>📅 {formatDate(post.created_at)}</span>
                    </div>
                    <div className="result-content">
                      {post.content ? 
                        (post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content) :
                        'AI-generated content available via link'
                      }
                    </div>
                    <div className="result-tags">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="result-tag">{tag}</span>
                      ))}
                      {post.tags.length > 3 && <span className="result-tag">+{post.tags.length - 3}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No results found for "{searchTerm}"</p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="footer visible">
        <div className="footer-links">
          <a href="/info-hub.html">Contributor Guidelines</a>
          <a href="/info-hub.html#terms">Terms</a>
          <a href="/info-hub.html#privacy-policy">Privacy Policy</a>
          <a href="/info-hub.html#copyright-notice">Copyright Notice</a>
          <a href="/contact.html">Contact Us</a>
          <a href="/support.html">Support DeepWiki.io</a>
        </div>
      </div>
    </>
  );
}

// Initialize the app
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);