import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PublicPostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { categoryName } = useParams(); 
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
   const [searchInput, setSearchInput] = useState('');
  const postsPerPage = 5;

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const categories = ['Science', 'Business', 'Technology', 'Health', 'Sports', 'Opinion', 'Other'];

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || '';

    setCurrentPage(pageFromUrl);
    fetchPosts(pageFromUrl, categoryName, search);
    console.log("Current Category from URL param:", categoryName);
  }, [searchParams, categoryName]);

  const fetchPosts = async (page, category, search) => {
    setLoading(true);
    try {
      let url = `http://localhost:5014/api/posts?page=${page}&limit=${postsPerPage}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (search) url += `&search=${search}`;
    console.log("Fetching from URL:", url);
      const response = await axios.get(url);
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchInput });
  };

  if (loading) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div></div>;
  
  if (error) return <div>Error: {error}</div>;
  if (posts.length === 0) return 

  return (
    <div className='w-full'>
      <form onSubmit={handleSearch} className="mb-8 flex gap-2 w-[90%] justify-self-center">
        <input 
          type="text" 
          placeholder="Search by title or category..." 
          className="flex-1 p-3 border rounded-lg shadow-sm"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg">Search</button>
      </form>
      
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
  {/* SECTION HEADER */}
  <div className="text-center mb-12">
    <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-[0.3em] mb-3">
      Browse by Topic
    </h2>
    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
      Explore <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">Categories</span>
    </h1>
    <div className="mt-4 h-1 w-24 bg-gray-100 mx-auto rounded-full relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 w-1/2 animate-pulse"></div>
    </div>
  </div>

  {/* CATEGORY GRID */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {categories.map((cat) => (
      <Link
        key={cat}
        to={`/posts/category/${cat}`}
        className="group relative flex items-center justify-between p-5 bg-white border
         border-gray-100 rounded-2xl shadow-sm hover:shadow-xl
         hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="flex items-center space-x-4">
          {/* Icon Placeholder (Circle with initial) */}
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
            <span className="text-xs font-black uppercase">{cat.substring(0, 2)}</span>
          </div>
          
          <span className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
            {cat}
          </span>
        </div>

        {/* Small Arrow that appears on hover */}
        <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 h-1 w-0 bg-indigo-600 transition-all duration-300 group-hover:w-full rounded-t-2xl"></div>
      </Link>
    ))}
  </div>
</div>
      
  
     <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
  {/* SECTION HEADER */}
  <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-4">
    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
      {categoryName ? (
        <span>Showing <span className="text-indigo-600">{categoryName}</span></span>
      ) : (
        "Latest Stories"
      )}
    </h2>
    <div className="h-1 w-20 bg-indigo-600 rounded-full"></div>
  </div>

  {posts.length === 0 ? (
    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
      <p className="text-gray-500 text-lg">No stories found in this category yet.</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {posts.map((post) => (
        <Link 
          to={`/posts/${post._id}`} 
          key={post._id} 
          className="group relative flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          {/* IMAGE CONTAINER */}
          <div className="relative w-full md:w-48 lg:w-56 h-56 md:h-auto overflow-hidden">
            {post.category && (
              <span className="absolute top-3 left-3 z-10 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-lg">
                {post.category}
              </span>
            )}
            
            {post.mainImageUrl ? (
              <img
                src={post.mainImageUrl.startsWith('http') 
                  ? post.mainImageUrl 
                  : `http://localhost:5014${post.mainImageUrl}`}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>

          {/* CONTENT CONTAINER */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center text-xs text-gray-400 mb-3 space-x-2">
                <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span className="text-indigo-600 font-semibold italic">5 min read</span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-3">
                {post.title}
              </h3>

              {/* Snippet - Cleaned of HTML tags */}
              <div 
                className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: post.content.substring(0, 100).replace(/<[^>]*>?/gm, '') + '...' 
                }} 
              />
            </div>

            {/* FOOTER: Author & Action */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                  {post.author?.firstName?.charAt(0) || 'U'}
                </div>
                <p className="text-sm font-medium text-gray-700 uppercase tracking-tighter">
                  {post.author ? `${post.author.firstName} ${post.author.lastName}` : "Herald Contributor"}
                </p>
              </div>

              <div className="text-indigo-600 font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                Read
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )}
</div>

  
      <div className="flex flex-col items-center justify-center space-y-4 py-16 mb-10">
  {/* The Pagination Container */}
  <nav className="flex items-center space-x-2 bg-white p-2 rounded-full shadow-lg border border-gray-100">
    
    {/* Previous Button */}
    <button
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="flex items-center justify-center w-10 h-10 md:w-auto md:px-5 md:h-11 rounded-full text-sm font-bold tracking-wide transition-all duration-200 
      disabled:opacity-20 disabled:cursor-not-allowed
      enabled:text-indigo-600 enabled:hover:bg-indigo-50 enabled:hover:scale-105 active:scale-95"
      aria-label="Previous Page"
    >
      <svg className="w-5 h-5 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span className="hidden md:block text-xs uppercase tracking-widest">Prev</span>
    </button>

    {/* Page Indicator */}
    <div className="flex items-center justify-center px-4 md:px-8 h-11 bg-gray-50 border border-gray-100 rounded-full">
      <span className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-widest">
        Page <span className="text-indigo-600 font-black mx-1">{currentPage}</span> of {totalPages}
      </span>
    </div>

    {/* Next Button */}
    <button
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="flex items-center justify-center w-10 h-10 md:w-auto md:px-5 md:h-11 rounded-full text-sm font-bold tracking-wide transition-all duration-200 
      disabled:opacity-20 disabled:cursor-not-allowed
      enabled:text-indigo-600 enabled:hover:bg-indigo-50 enabled:hover:scale-105 active:scale-95"
      aria-label="Next Page"
    >
      <span className="hidden md:block text-xs uppercase tracking-widest text-right">Next</span>
      <svg className="w-5 h-5 md:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </nav>

  {/* Subtle "Go To Top" hint or small detail */}
  <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-medium">
    Herald Sphere Archives
  </p>
</div>
    </div>
  );
}
export default PublicPostList;