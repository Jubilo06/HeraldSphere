import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from './Api';
import { AuthContext } from './AuthContext';
import { 
  Plus, Edit3, Trash2, Eye, 
  FileText, Clock, CheckCircle, AlertCircle 
} from 'lucide-react';
import gsap from 'gsap';

function MyPost() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  // useEffect(() => {
  //   if (user) {
  //     const fetchMyPosts = async () => {
  //       try {
  //         const response = await api.get('/api/posts/my-posts');
  //         setPosts(response.data);
  //         // Trigger GSAP after data is set
  //         setTimeout(animateCards, 100);
  //       } catch (err) {
  //         setError(err.response?.data?.message || 'Failed to fetch your posts.');
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchMyPosts();
  //   }
  // }, [user]);

  // const animateCards = () => {
  //   gsap.from(cardsRef.current, {
  //     y: 30,
  //     opacity: 0,
  //     stagger: 0.1,
  //     duration: 0.8,
  //     ease: "power3.out"
  //   });
  // };
  const animateCards = () => {
  // We target the class '.post-card' instead of using refs for better reliability in React
  const cards = document.querySelectorAll('.post-card');
  if (cards.length > 0) {
    gsap.fromTo(cards, 
      { y: 30, opacity: 0 }, 
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.1, 
        duration: 0.6, 
        ease: "power2.out",
        overwrite: true // Prevents conflicts if the data loads twice
      }
    );
  }
};

useEffect(() => {
  if (user) {
    const fetchMyPosts = async () => {
      try {
        const response = await api.get('/api/posts/my-posts');
        setPosts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch your posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }
}, [user]);

useEffect(() => {
  if (!loading && posts.length > 0) {
    // Small timeout ensures React has finished putting the cards in the DOM
    const timer = setTimeout(animateCards, 100);
    return () => clearTimeout(timer);
  }
}, [loading, posts]);


  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this dispatch?")) {
      try {
        await api.delete(`/api/posts/${postId}`);
        setPosts(posts.filter(post => post._id !== postId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete post.');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'rejected': return <AlertCircle size={14} />;
      default: return <FileText size={14} />;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* BACKGROUND DECORATION (No Gradients) */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: `radial-gradient(#6366f1 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-100 rounded-full blur-[120px] z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-100 rounded-full blur-[120px] z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" ref={containerRef}>
        
        {/* HEADER SECTION */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-2 block">
              Workspace / {user?.username}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              Your Dispatches
            </h1>
            <p className="text-slate-500 mt-2 max-w-md">
              Manage your global contributions and track their progress through the editorial sphere.
            </p>
          </div>
          
          <Link to="/submit-post" 
                className="group flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200">
            <Plus size={16} /> Create New Post
          </Link>
        </header>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total', count: posts.length, color: 'text-slate-600' },
            { label: 'Published', count: posts.filter(p => p.status === 'published').length, color: 'text-emerald-600' },
            { label: 'Pending', count: posts.filter(p => p.status === 'pending').length, color: 'text-amber-600' },
            { label: 'Drafts', count: posts.filter(p => p.status === 'draft').length, color: 'text-blue-600' },
          ].map((stat, i) => (stat.count > 0 || i === 0) && (
            <div key={stat.label} className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-8 flex items-center gap-3 animate-bounce">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* POSTS LIST */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-4xl p-20 text-center border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">The sphere is quiet...</h3>
            <p className="text-slate-500 mt-2 mb-8">You haven't contributed any dispatches yet.</p>
            <Link to="/submit-post" className="text-indigo-600 font-black uppercase text-xs tracking-widest underline decoration-2 underline-offset-8">
              Start your first article
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <div 
                key={post._id}
                ref={el => cardsRef.current[index] = el}
                className="group bg-white rounded-4xl p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 flex flex-col h-full"
              >
                {/* Status & Date */}
                <div className="flex justify-between items-start mb-6">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    post.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
                    post.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    post.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {getStatusIcon(post.status)} {post.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight grow group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h3>

                {/* Meta / Image Preview Mockup */}
                <div className="w-full h-32 bg-slate-50 rounded-2xl mb-6 overflow-hidden relative">
                    {post.mainImageUrl ? (
                        <img src={post.mainImageUrl} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                             <FileText size={40} />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                  {post.status === 'published' && (
                    <Link to={`/posts/${post.slug}`} className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="View Public Post">
                      <Eye size={18} />
                    </Link>
                  )}
                  <Link to={`/edit-post/${post._id}`} className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm" title="Edit Article">
                    <Edit3 size={18} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(post._id)}
                    className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm ml-auto"
                    title="Delete Permanently"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* BOTTOM SPACING */}
      <div className="h-20"></div>
    </div>
  );
}

export default MyPost;