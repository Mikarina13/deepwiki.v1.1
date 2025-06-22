import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { initMenu } from './src/utils/menu.js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    initMenu();
    loadFeaturedPosts();
  }, []);

  const loadFeaturedPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('archive_posts')
        .select(`
          *,
          users:user_id (
            email,
            raw_user_meta_data
          )
        `)
        .order('views', { ascending: false })
        .limit(6);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading featured posts:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthorName = (post) => {
    if (!post.users) return 'Community Member';
    
    const userData = post.users;
    const metadata = userData.raw_user_meta_data || {};
    
    return metadata.display_name || 
           metadata.full_name || 
           userData.email?.split('@')[0] || 
           'Community Member';
  };

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setShowResults(false);
      return;
    }

    setIsSearching(true);
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
        .or(`title.ilike.%${term}%,content.ilike.%${term}%,tags.cs.{${term}}`)
        .order('views', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, posts.length - 2));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, posts.length - 2)) % Math.max(1, posts.length - 2));
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      window.location.href = `/browse-archive.html?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  const handleBrowse = () => {
    window.location.href = '/browse-archive.html';
  };

  const closeSearchResults = () => {
    setShowResults(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="app">
      <div className="main-content">
        <div className="hero-section">
          <div className="logo-container">
            <img 
              src="https://i.imgur.com/sMqKf3K.png" 
              alt="DeepWiki.io Logo" 
              className="main-logo"
            />
          </div>
          
          <div className="search-container">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search DeepWiki.io Open AI Archives"
                className="search-input"
                value={searchTerm}
                onChange={handleSearchInput}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
              {isSearching && (
                <div className="search-spinner">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
            
            <div className="search-buttons">
              <button className="search-btn" onClick={handleSearchSubmit}>
                Search
              </button>
              <button className="browse-btn" onClick={handleBrowse}>
                Browse
              </button>
            </div>
          </div>
        </div>

        <div className="knowledge-section">
          <h2 className="section-title">Knowledge Spotlights</h2>
          <p className="section-subtitle">Discover Popular Topics</p>
          
          {isLoading ? (
            <div className="loading-carousel">
              <div className="loading-spinner"></div>
              <p>Loading featured content...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="carousel-container">
              <div className="carousel-wrapper">
                <div 
                  className="carousel-track"
                  style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
                >
                  {posts.map((post, index) => (
                    <div key={post.id} className="knowledge-card">
                      <div className="card-header">
                        <div className="author-info">
                          <span className="author-icon">👤</span>
                          <span className="author-name">{getAuthorName(post)}</span>
                        </div>
                        <div className="card-stats">
                          <span className="views">{post.views || 0} VIEWS</span>
                          <span className="likes">❤️ {post.downloads || 0}</span>
                        </div>
                      </div>
                      
                      <div className="card-content">
                        <div className="prompt-section">
                          <strong>PROMPT:</strong> {post.prompt?.substring(0, 100)}...
                        </div>
                        
                        <h3 className="card-title">{post.title}</h3>
                        
                        <div className="content-preview">
                          {post.embed_url ? 
                            'Content available via embedded link' : 
                            post.content?.substring(0, 100) + '...'
                          }
                        </div>
                      </div>
                      
                      <div className="card-footer">
                        <div className="tags">
                          {post.tags?.slice(0, 2).map((tag, i) => (
                            <span key={i} className="tag">{tag}</span>
                          ))}
                          {post.tags?.length > 2 && (
                            <span className="tag">+{post.tags.length - 2}</span>
                          )}
                        </div>
                        <span className="date">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div 
                        className="card-overlay"
                        onClick={() => window.location.href = `/view-post.html?id=${post.id}&type=archive`}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {posts.length > 3 && (
                <div className="carousel-controls">
                  <button className="carousel-btn prev" onClick={prevSlide}>
                    ‹
                  </button>
                  <button className="carousel-btn next" onClick={nextSlide}>
                    ›
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-carousel">
              <p>No featured content available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {showResults && (
        <div className="archive-results-container active">
          <div className="search-results-header">
            <h2>Archive Search Results</h2>
            <button className="close-search-btn" onClick={closeSearchResults}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="search-results">
            {searchResults.length > 0 ? (
              searchResults.map((post) => (
                <div 
                  key={post.id} 
                  className="search-result-item"
                  onClick={() => window.location.href = `/view-post.html?id=${post.id}&type=archive`}
                >
                  <h3>{post.title}</h3>
                  <p className="result-meta">
                    By {getAuthorName(post)} • {post.views || 0} views • {new Date(post.created_at).toLocaleDateString()}
                  </p>
                  <p className="result-preview">
                    {post.content?.substring(0, 150)}...
                  </p>
                  <div className="result-tags">
                    {post.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="result-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">No results found for "{searchTerm}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);