// src/pages/PublicPostDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function PublicPostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when post changes
    loadData();
  }, [id]);
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get the main post
      const res = await axios.get(`http://localhost:5014/api/posts/${id}`);
      setPost(res.data);

      // 2. Get related posts (same category)
      const relatedRes = await axios.get(`http://localhost:5014/api/posts?category=${res.data.category}&limit=4`);
      // Filter out the current post so it doesn't recommend itself
      const filtered = relatedRes.data.posts.filter(p => p._id !== id);
      setRelatedPosts(filtered);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

   if (loading) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div></div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* ARTICLE HEADER */}
      <header className="max-w-4xl mx-auto pt-16 px-4 text-center">
        {post.category && (
          <Link to={`/posts/category/${post.category}`} className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full hover:bg-indigo-100 transition">
            {post.category}
          </Link>
        )}
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8 tracking-tight">
          {post.title}
        </h1>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-12">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 uppercase tracking-tighter">
              {post.author ? `${post.author.firstName} ${post.author.lastName}` : "Herald Staff"}
            </span>
          </div>
          <span>•</span>
          <time>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
        </div>
      </header>
      
       {/* FEATURED IMAGE */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        {post.mainImageUrl && (
          <img 
            src={post.mainImageUrl.startsWith('http') ? post.mainImageUrl : `http://localhost:5014${post.mainImageUrl}`} 
            className="w-full h-[500px] object-cover rounded-3xl shadow-2xl shadow-slate-200" 
            alt={post.title} 
          />
        )}
      </div>

       {/* MAIN CONTENT */}
      <article className="max-w-3xl mx-auto px-6">
        <div 
          className="prose prose-lg prose-indigo max-w-none text-slate-700 leading-relaxed ql-editor" 
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        {/* AUTHOR BIO BOX (Professional Style) */}
        <div className="mt-16 p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center gap-6">
          <img 
            src={post.author?.profilePic 
                 ? (post.author.profilePic.startsWith('http') ? post.author.profilePic : `http://localhost:5014${post.author.profilePic}`)
                 : 'https://via.placeholder.com/100'} 
            alt="Author" 
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div className="text-center md:text-left flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Written By</p>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {post.author ? `${post.author.firstName} ${post.author.lastName}` : "Anonymous Contributor"}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Herald Sphere senior contributor specializing in {post.category} and global digital trends. Dedicated to bringing high-integrity journalism to the Sphere.
            </p>
          </div>
        </div>

        {/* BACK TO BLOG LINK (Premium Style) */}
        <div className="mt-12 flex justify-center">
          <Link 
            to="/posts" 
            className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-200"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Archives
          </Link>
        </div>
      </article>

       {/* RELATED POSTS SECTION */}
      {relatedPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mt-24">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-2xl font-black text-slate-900">More from <span className="text-indigo-600">{post.category}</span></h3>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {relatedPosts.map(rp => (
              <Link key={rp._id} to={`/posts/${rp._id}`} className="group flex flex-col">
                <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                  {rp.mainImageUrl && (
                    <img 
                      src={rp.mainImageUrl.startsWith('http') ? rp.mainImageUrl : `http://localhost:5014${rp.mainImageUrl}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={rp.title} 
                    />
                  )}
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                  {rp.title}
                </h4>
              </Link>
            ))}
          </div>
        </section>
      )}
      
    </div>
  );
}

export default PublicPostDetail;