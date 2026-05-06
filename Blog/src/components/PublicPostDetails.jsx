import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './Api';
import { FaHeart, FaRegHeart, FaTwitter, FaLinkedin, FaFacebook, FaLink, FaChevronLeft, FaReply } from 'react-icons/fa';

// --- SUB-COMPONENT: INDIVIDUAL COMMENT & REPLIES ---
const CommentItem = ({ comment, onReply, replyingTo, setCommentForm, commentForm, handleSubmit, commentStatus }) => {
  const isReplying = replyingTo === comment._id;

  return (
    <div className="group">
      <div className="flex gap-4 items-start">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 border-2 border-white shadow-sm">
          {comment.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 p-5 rounded-2xl rounded-tl-none border border-slate-100 transition-colors group-hover:bg-slate-100/50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">{comment.name}</h4>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed wrap-break-word">{comment.comment}</p>
          </div>

          {/* Action: Reply Button */}
          <button 
            onClick={() => onReply(isReplying ? null : comment._id)}
            className="mt-2 ml-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-all"
          >
            <FaReply size={10} /> {isReplying ? 'Cancel' : 'Reply'}
          </button>

          {/* INLINE REPLY FORM */}
          {isReplying && (
            <div className="mt-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Replying to {comment.name}</p>
              <textarea 
                autoFocus
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-4 min-h-25"
                placeholder="Type your response..."
                value={commentForm.comment}
                onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value, parentId: comment._id })}
              />
              <div className="flex flex-wrap gap-3">
                <input 
                  type="text" placeholder="Your Name" required
                  className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  value={commentForm.name}
                  onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                />
                <input 
                  type="email" placeholder="Your Email" required
                  className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  value={commentForm.email}
                  onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                />
              </div>
              <button 
                onClick={handleSubmit}
                className="mt-4 w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
              >
                {commentStatus.type === 'loading' ? 'Sending...' : 'Post Reply'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RECURSIVE REPLIES (Indented) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 md:ml-14 mt-6 space-y-6 border-l-2 border-slate-100 pl-6 md:pl-8">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply._id} 
              comment={reply} 
              onReply={onReply} 
              replyingTo={replyingTo} 
              setCommentForm={setCommentForm}
              commentForm={commentForm}
              handleSubmit={handleSubmit}
              commentStatus={commentStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function PublicPostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // States
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '' });
  const [commentStatus, setCommentStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, [id]);

  // const loadData = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await api.get(`/api/posts/${id}`);
  //     setPost(res.data);
  //     setLikesCount(res.data.likes || 0);
  //     const commRes = await api.get(`/api/posts/${id}/comments`);
  //     setComments(commRes.data || []);
  //     const relatedRes = await api.get(`/api/posts?category=${res.data.category}&limit=4`);
  //     setRelatedPosts(relatedRes.data.posts.filter(p => p._id !== id));
  //   } catch (err) { console.error(err); }
  //   setLoading(false);
  // };

   const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get(`/api/posts/${id}`),
        api.get(`/api/posts/${id}/comments`)
      ]);
      setPost(pRes.data);
      setLikesCount(pRes.data.likes || 0);
      setComments(Array.isArray(cRes.data) ? cRes.data : []);

      const relRes = await api.get(`/api/posts?category=${pRes.data.category}&limit=4`);
      setRelatedPosts(relRes.data.posts.filter(p => p._id !== id));
    } catch (err) { console.error("Error loading article:", err); }
    setLoading(false);
  };

  // Helper: Organize flat comments into a tree
  // const threadedComments = useMemo(() => {
  //   const map = {};
  //   comments.forEach(c => map[c._id] = { ...c, replies: [] });
  //   const roots = [];
  //   comments.forEach(c => {
  //     if (c.parentId && map[c.parentId]) map[c.parentId].replies.push(map[c._id]);
  //     else roots.push(map[c._id]);
  //   });
  //   return roots;
  // }, [comments]);
   const threadedComments = useMemo(() => {
    if (!comments.length) return [];
    const map = {};
    comments.forEach(c => map[c._id] = { ...c, replies: [] });
    const roots = [];
    comments.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].replies.push(map[c._id]);
      } else if (!c.parentId) {
        roots.push(map[c._id]);
      }
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
    if (!commentForm.comment || !commentForm.name) return;
    setCommentStatus({ type: 'loading', msg: 'Transmitting...' });
    try {
      const res = await api.post(`/api/posts/${id}/comments`, commentForm);
      setComments([res.data, ...comments]);
      setCommentForm({ name: '', email: '', comment: '', parentId: null });
      setReplyingTo(null);
      setCommentStatus({ type: 'success', msg: 'Dispatch received!' });
      setTimeout(() => setCommentStatus({ type: '', msg: '' }), 3000);
    } catch (err) { setCommentStatus({ type: 'error', msg: 'Error.' }); }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!post) return <div className="text-center py-20 font-black text-slate-300 uppercase">Article Not Found</div>;

   return (
    <div className="w-full bg-white min-h-screen pb-32">
      
      {/* 1. Header Section */}
      <header className="max-w-5xl mx-auto px-4 pt-10 text-center lg:text-left">
        <Link to="/posts" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 mb-8 transition-colors">
          <FaChevronLeft /> Back to Blog
        </Link>
        <br />
        <span className="inline-block px-3 py-1 mb-4 text-[10px] font-black tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded">{post.category}</span>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-8 tracking-tighter text-slate-900">{post.title}</h1>
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-6">
          {/* <img src={post.author?.profilePic || '/logo.webp'} className="w-8 h-8 rounded-full object-cover border border-slate-200" alt="" /> */}
          <img src={post.author?.profilePic 
                 ? (post.author.profilePic.startsWith('http') ? post.author.profilePic : `http://localhost:5014${post.author.profilePic}`)
                 : 'https://via.placeholder.com/100'} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md" alt="" />
          <span className="text-slate-900">{post.author?.firstName} {post.author?.lastName}</span>
          <span className="opacity-30">|</span>
          <time>{new Date(post.createdAt).toLocaleDateString()}</time>
        </div>
      </header>

      {/* 2. Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <main className="lg:col-span-8">
          {post.mainImageUrl && (
            <img src={post.mainImageUrl.startsWith('http') ? post.mainImageUrl : `http://localhost:5014${post.mainImageUrl}`} 
                 className="w-full h-auto rounded-3xl shadow-xl mb-12" alt="" />
          )}

          {/* Social Row */}
          <div className="flex items-center justify-between py-6 border-y border-slate-100 mb-10">
            <div className="flex items-center gap-6">
              <button onClick={handleLike} className="flex items-center gap-2 hover:scale-110 transition-transform outline-none">
                {liked ? <FaHeart className="text-rose-500" size={22}/> : <FaRegHeart className="text-slate-300" size={22}/>}
                <span className="text-xs font-black text-slate-900">{likesCount}</span>
              </button>
              <div className="flex gap-4 text-slate-300"><FaTwitter /><FaLinkedin /></div>
            </div>
            <button onClick={() => {navigator.clipboard.writeText(window.location.href); alert("Copied!")}} className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><FaLink/> Copy Link</button>
          </div>

          {/* Article Text */}
          <div className="prose prose-slate max-w-none md:prose-lg text-slate-700 leading-relaxed mb-2 ql-editor" 
               dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* 3. COMMENTS LISTING */}
          <section className="mt-2 pt-2 border-t border-slate-100">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-10">Reader Comments ({comments.length})</h3>
            <div className="space-y-4 mb-16">
              {threadedComments.map(c => (
                <CommentItem 
                  key={c._id} comment={c} onReply={setReplyingTo} replyingTo={replyingTo}
                  setCommentForm={setCommentForm} commentForm={commentForm}
                  handleSubmit={handleCommentSubmit} commentStatus={commentStatus}
                />
              ))}
              {comments.length === 0 && <p className="text-slate-400 italic text-sm">No comment yet.</p>}
            </div>

            {/* 4. ALWAYS VISIBLE COMMENT FORM */}
            <div className="bg-slate-950 p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl">
              <h4 className="text-2xl font-black tracking-tighter mb-1 uppercase">Join the Discussion</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-8">Secure Editorial Interface</p>
              <form onSubmit={handleCommentSubmit} className="space-y-6">
                <textarea required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-indigo-500" 
                          rows="4" placeholder="Your perspective..."
                          value={commentForm.comment} onChange={e => setCommentForm({...commentForm, comment: e.target.value})} />
                
                {/* Name and Email only show if not replying to something else, or keep for simplicity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input required className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" placeholder="Full Name" 
                         value={commentForm.name} onChange={e => setCommentForm({...commentForm, name: e.target.value})} />
                  <input required className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" placeholder="Email" 
                         value={commentForm.email} onChange={e => setCommentForm({...commentForm, email: e.target.value})} />
                </div>
                
                <button type="submit" className="w-full md:w-auto px-12 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-black text-[10px] uppercase tracking-widest transition-all">
                  {commentStatus.type === 'loading' ? 'Processing...' : 'Post Dispatch'}
                </button>
                {commentStatus.msg && <p className="text-xs font-bold text-emerald-400 text-center mt-4">{commentStatus.msg}</p>}
              </form>
            </div>
          </section>
        </main>

        {/* 5. Sidebar */}
        <aside className="lg:col-span-4 space-y-2">
          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-8 underline underline-offset-8">Contributor</p>
            <div className="flex items-center gap-4 mb-6">
              <img src={post.author?.profilePic 
                 ? (post.author.profilePic.startsWith('http') ? post.author.profilePic : `http://localhost:5014${post.author.profilePic}`)
                 : 'https://via.placeholder.com/100'} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md" alt="" />
              <div className="min-w-0">
                <h4 className="font-black text-slate-900 truncate uppercase tracking-tighter">{post.author?.firstName} {post.author?.lastName}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Journalist</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic leading-relaxed">"Deciphering global trends for the Herald Sphere."</p>
          </div>

          <div className="px-2">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Related Dispatches</h5>
            <div className="space-y-8">
              {relatedPosts.map(rp => (
                <Link key={rp._id} to={`/posts/${rp._id}`} className="group flex gap-4 items-center">
                  <img src={rp.mainImageUrl || '/logo.webp'} className="w-16 h-16 rounded-2xl object-cover shrink-0" alt="" />
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{rp.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default PublicPostDetails;