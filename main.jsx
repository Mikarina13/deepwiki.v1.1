import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    initMenu();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const { data, error } = await supabase
        .from('archive_posts')
        .select(`
          *,
          users:user_id (
            email,
            raw_user_meta_data
          )
        `)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBrowse = () => {
    window.location.href = '/browse-archive.html';
  };

  const closeSearch = () => {
    setShowResults(false);
    setSearchResults([]);
    setSearchTerm('');
  };

  return (
    <div className="app">
      <div className="menu-header">
        <img src="https://i.imgur.com/zcLQ3gB.png" alt="Menu Logo" className="menu-logo" />
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

      <div className="menu-overlay"></div>
      <div className="menu-options info-menu"></div>
      <div className="left-edge-trigger"></div>
      <div className="menu-hamburger-indicator">
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </div>

      <div className="main-content">
        <div className="hero-section">
          <div className="logo-container">
            <img 
              src="https://videos.openai.com/vg-assets/assets%2Ftask_01jybgre3sfqf9t8hj52a9e932%2F1750585892_img_1.webp?st=2025-06-22T08%3A34%3A52Z&se=2025-06-28T09%3A34%3A52Z&sks=b&skt=2025-06-22T08%3A34%3A52Z&ske=2025-06-28T09%3A34%3A52Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=Laz1fQeqG17VID02cb3E4d3A70Rd7gSV8DtyWKe7xxg%3D&az=oaivgprodscus" 
              alt="WikiDeep.io Logo" 
              className="main-logo"
            />
          </div>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Search DeepWiki.io Open AI Archives"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
          </div>
          
          <div className="action-buttons">
            <button onClick={handleSearch} className="search-btn">
              Search
            </button>
            <button onClick={handleBrowse} className="browse-btn">
              Browse
            </button>
          </div>
        </div>

        <div className="knowledge-spotlights">
          <h2>Knowledge Spotlights</h2>
          <p>Discover Popular Topics</p>
          
          <div className="spotlight-cards">
            <div className="spotlight-card">
              <div className="card-header">
                <span className="user-badge">👤 Community Member</span>
                <span className="views">2 VIEWS</span>
              </div>
              <div className="card-content">
                <div className="prompt-section">
                  <strong>PROMPT:</strong> Create a game mixing game of life game of theory and universal paper clip allowing 1 or 2 or infinit...
                </div>
                <h3>CONVERGENCE: Strategic Civilization Builder - Ultimate One-Shot</h3>
                <p>Content available via embedded link</p>
              </div>
              <div className="card-footer">
                <span className="tag">ONE PROMPT CHALLENGE</span>
                <span className="tag">GAME</span>
                <span className="likes">❤️ 0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showResults && (
        <div id="archive-results-container" className="archive-results-container active">
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
              <p className="loading-state">Searching...</p>
            ) : searchResults.length > 0 ? (
              searchResults.map((post) => (
                <div key={post.id} className="search-result-item">
                  <h3>{post.title}</h3>
                  <p>{post.content.substring(0, 200)}...</p>
                  <div className="result-meta">
                    <span>AI Model: {post.ai_model}</span>
                    <span>Tags: {post.tags.join(', ')}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">No results found for "{searchTerm}"</p>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
}

export default App;