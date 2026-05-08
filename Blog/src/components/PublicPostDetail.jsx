import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './Api';
import { FaHeart, FaRegHeart, FaTwitter, FaLinkedin, FaChevronLeft, FaReply } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';

// --- 1. SUB-COMPONENT: INDIVIDUAL COMMENT & RECURSIVE REPLIES ---
const CommentItem = ({ comment, onReply, replyingTo, setCommentForm, commentForm, handleSubmit }) => {
  const isReplying = replyingTo === comment._id;

  return (
    <div className="mb-6">
      
      <div className="flex gap-3 items-start group">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
          {comment.name?.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-[11px] font-black text-slate-900 uppercase truncate">{comment.name}</h4>
              <span className="text-[9px] font-bold text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{comment.comment}</p>
          </div>

          {/* Action: Reply Button */}
          <button 
            onClick={() => onReply(isReplying ? null : comment._id)}
            className="mt-1 ml-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800"
          >
            <FaReply size={10} /> {isReplying ? 'Cancel' : 'Reply'}
          </button>

          {/* INLINE REPLY FORM */}
          {isReplying && (
            <div className="mt-3 bg-white border border-slate-200 p-4 rounded-xl shadow-lg animate-in fade-in zoom-in duration-200">
              <textarea 
                required autoFocus
                className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs focus:ring-1 focus:ring-indigo-500 outline-none mb-3"
                placeholder={`Replying to ${comment.name}...`}
                value={commentForm.comment}
                onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value, parentId: comment._id })}
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-indigo-600 text-white font-black text-[9px] uppercase rounded-full hover:bg-indigo-700"
                >
                  Post Reply
                </button>
                <button onClick={() => onReply(null)} className="px-4 py-2 text-slate-400 text-[9px] font-black uppercase">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RENDER REPLIES (Indented) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 md:ml-12 mt-4 border-l-2 border-slate-50 pl-6 space-y-4">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply._id} comment={reply} onReply={onReply} replyingTo={replyingTo}
              setCommentForm={setCommentForm} commentForm={commentForm} handleSubmit={handleSubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- 2. MAIN COMPONENT ---
function PublicPostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const[error, setError]=useState(null)
  
  // Interaction States
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '', parentId: null });

  useEffect(() => { window.scrollTo(0, 0); loadData(); }, [id]);
  
  const { slug } = useParams(); 
  useEffect(() => {
  if (slug && slug !== 'undefined') {
    window.scrollTo(0, 0);
    loadData();
  }
}, [slug]);
  

  const loadData = async () => {
  setLoading(true);
  try {
    // 1. First, get the post by its SLUG
    const postRes = await api.get(`/api/posts/${slug}`);
    const postData = postRes.data;
    setPost(postData);
    setLikesCount(postData.likes || 0);

    // 2. NOW that we have the postData, we have the real _id for comments and related posts
    const [commRes, relatedRes] = await Promise.all([
      api.get(`/api/posts/${postData._id}/comments`), // Use the ID here
      api.get(`/api/posts?category=${postData.category}&limit=4`)
    ]);

    setComments(Array.isArray(commRes.data) ? commRes.data : []);
    setRelatedPosts(relatedRes.data.posts.filter(p => p._id !== postData._id));

  } catch (err) {
    console.error("Error loading article data:", err);
    setError(err.response?.data?.message || "Failed to load dispatch.");
  } finally {
    setLoading(false);
  }
};

  // Organize flat list into a tree for replies
  const threadedComments = useMemo(() => {
    const map = {};
    comments.forEach(c => map[c._id] = { ...c, replies: [] });
    const roots = [];
    comments.forEach(c => {
      if (c.parentId && map[c.parentId]) map[c.parentId].replies.push(map[c._id]);
      else if (!c.parentId) roots.push(map[c._id]);
    });
    return roots;
  }, [comments]);

  const handleLike = async () => {
    const action = liked ? 'unlike' : 'like';
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    try { await api.put(`/api/posts/${id}/like`, { action }); } catch (err) { console.error(err); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.comment) return;
    try {
      const res = await api.post(`/api/posts/${id}/comments`, commentForm);
      setComments([res.data, ...comments]);
      setCommentForm({ name: '', email: '', comment: '', parentId: null });
      setReplyingTo(null);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!post) return <div className="text-center py-20 font-black text-slate-300">NOT FOUND</div>;

  return (
    <div className="w-full bg-white min-h-screen pb-10">

      {post && (
      <Helmet>
        {/* Standard SEO */}
        <title>{post.title} | Herald Sphere</title>
        <meta name="description" content={post.content.substring(0, 160).replace(/<[^>]*>?/gm, '')} />
        
        {/* Social Media (Facebook/LinkedIn) */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content="Read the full dispatch on Herald Sphere." />
        <meta property="og:image" content={post.mainImageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
      </Helmet>
    )}
    {post && (
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "image": post.mainImageUrl,
      "author": {
        "@type": "Person",
        "name": `${post.author?.firstName} ${post.author?.lastName}`
      },
      "publisher": {
        "@type": "Organization",
        "name": "Herald Sphere",
        "logo": {
          "@type": "ImageObject",
          "url": "http://localhost:5173/logo.webp"
        }
      },
      "datePublished": post.createdAt,
      "description": post.content.substring(0, 160).replace(/<[^>]*>?/gm, '')
    })}
  </script>
)}
      {/* HEADER */}
      <header className="max-w-5xl mx-auto px-4 pt-4">
        <Link to="/posts" className="text-[10px] font-black text-slate-400 uppercase tracking-tighter hover:text-indigo-600 transition-colors">← Back to Blog</Link>
        <div className="mt-2 border-b border-slate-100 pb-2">
          <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">{post.category}</span>
          <h1 className="text-2xl md:text-5xl font-black leading-tight mt-1 tracking-tighter text-slate-900">{post.title}</h1>
          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
             <img src={post.author?.profilePic ? `http://localhost:5014${post.author.profilePic}` : '/logo.webp'} className="w-6 h-6 rounded-full object-cover" alt="" />
             <span>{post.author?.firstName} {post.author?.lastName} • {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <main className="lg:col-span-8">
          {post.mainImageUrl && (
             <img src={post.mainImageUrl.startsWith('http') ? post.mainImageUrl : `http://localhost:5014${post.mainImageUrl}`} 
                  className="w-full h-auto rounded-xl mt-4 mb-4 shadow-sm" alt="" />
          )}

          {/* INTERACTION */}
          <div className="flex items-center gap-6 py-2 border-y border-slate-100 mb-4">
            <button onClick={handleLike} className="flex items-center gap-1">
              {liked ? <FaHeart className="text-rose-500" size={14}/> : <FaRegHeart className="text-slate-300" size={14}/>}
              <span className="text-[10px] font-black text-slate-900">{likesCount}</span>
            </button>
            <div className="flex gap-4 text-slate-300"><FaTwitter size={14}/><FaLinkedin size={14}/></div>
          </div>

          {/* CONTENT */}
          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed mb-8 ql-editor p-0! min-h-0!" 
               dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, { ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder"] }) }} />

          {/* COMMENTS LIST */}
          <section className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-black uppercase text-slate-900 mb-6 tracking-widest">Transmissions ({comments.length})</h3>
            
            <div className="mb-10">
               {threadedComments.map(c => (
                 <CommentItem 
                   key={c._id} comment={c} onReply={setReplyingTo} replyingTo={replyingTo}
                   setCommentForm={setCommentForm} commentForm={commentForm} handleSubmit={handleCommentSubmit}
                 />
               ))}
               {comments.length === 0 && <p className="text-slate-400 italic text-[11px]">No transmissions yet.</p>}
            </div>

            {/* NEW COMMENT FORM (Always visible for new threads) */}
            <div className="bg-slate-950 p-6 rounded-4xl text-white shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest mb-4">New Transmission</p>
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <textarea 
                  required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500" 
                  rows="3" placeholder="Share your perspective..."
                  value={commentForm.parentId === null ? commentForm.comment : ""}
                  onChange={e => setCommentForm({...commentForm, comment: e.target.value, parentId: null})} 
                />
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="Name" className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-[10px] outline-none" value={commentForm.name} onChange={e => setCommentForm({...commentForm, name: e.target.value})} />
                  <input required placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-[10px] outline-none" value={commentForm.email} onChange={e => setCommentForm({...commentForm, email: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-indigo-600 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-colors">Post comment</button>
              </form>
            </div>
          </section>
        </main>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 space-y-6 mt-6 lg:mt-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[8px] font-black uppercase text-indigo-600 mb-3 underline">Journalist</p>
            <div className="flex items-center gap-3">
              <img src={post.author?.profilePic ? `http://localhost:5014${post.author.profilePic}` : '/logo.webp'} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
              <div className="min-w-0">
                <h4 className="font-black text-xs text-slate-900 uppercase truncate">{post.author?.firstName} {post.author?.lastName}</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Herald Contributor</p>
              </div>
            </div>
          </div>

          <div className="px-1">
            <h5 className="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-widest">Related Dispatches</h5>
            <div className="space-y-4">
              {relatedPosts.map(rp => (
                <Link key={rp._id} to={`/posts/${rp._id}`} className="group flex gap-3 items-center">
                  <img src={rp.mainImageUrl || '/logo.webp'} className="w-12 h-12 rounded-lg object-cover bg-slate-100" alt="" />
                  <h4 className="text-[10px] font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-2 leading-tight tracking-tight uppercase">{rp.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PublicPostDetail;