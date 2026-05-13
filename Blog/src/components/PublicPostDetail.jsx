import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './Api';
import { 
  FaHeart, FaRegHeart, FaTwitter, FaLinkedinIn, 
  FaChevronLeft, FaReply, FaLink, FaCheck, 
  FaWhatsapp, FaTelegramPlane, FaInstagram 
} from 'react-icons/fa';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import { ReadingProgress } from './ReadingProgress';

// --- SUB-COMPONENT: COMMENT ITEM ---
const CommentItem = ({ comment, onReply, replyingTo, setCommentForm, commentForm, handleSubmit }) => {
  const isReplying = replyingTo === comment._id;
  return (
    <div className="mb-4">
      <div className="flex gap-2 items-start group">
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 border border-white shadow-sm">
          {comment.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 p-3 rounded-xl rounded-tl-none border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-[10px] font-black text-slate-900 uppercase truncate">{comment.name}</h4>
              <span className="text-[8px] font-bold text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-slate-600 leading-snug">{comment.comment}</p>
          </div>
          <button onClick={() => onReply(isReplying ? null : comment._id)} className="mt-1 ml-1 text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors">
            {isReplying ? 'Cancel' : 'Reply'}
          </button>
          {isReplying && (
            <div className="mt-2 bg-white border border-slate-200 p-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-1">
              <textarea required autoFocus className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none mb-2" rows="2" placeholder="Write a reply..." value={commentForm.comment} onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value, parentId: comment._id })} />
              <button onClick={handleSubmit} className="px-4 py-1.5 bg-indigo-600 text-white font-black text-[8px] uppercase rounded-full hover:bg-indigo-700">Post Reply</button>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.length > 0 && (
        <div className="ml-6 md:ml-10 mt-2 border-l border-slate-100 pl-4 space-y-2">
          {comment.replies.map(reply => (
            <CommentItem key={reply._id} comment={reply} onReply={onReply} replyingTo={replyingTo} setCommentForm={setCommentForm} commentForm={commentForm} handleSubmit={handleSubmit} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
function PublicPostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '', parentId: null });

  useEffect(() => {
    if (slug && slug !== 'undefined') {
      window.scrollTo(0, 0);
      loadData();
    }
  }, [slug]);

  const loadData = async () => {
    setLoading(true);
    try {
      const postRes = await api.get(`/api/posts/${slug}`);
      const postData = postRes.data;
      setPost(postData);
      setLikesCount(postData.likes || 0);

      const [commRes, relatedRes] = await Promise.all([
        api.get(`/api/posts/${postData._id}/comments`),
        api.get(`/api/posts?category=${postData.category}&limit=4`)
      ]);

      setComments(Array.isArray(commRes.data) ? commRes.data : []);
      setRelatedPosts(relatedRes.data.posts.filter(p => p._id !== postData._id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dispatch.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Process the content to inject IDs into H2 and H3 tags
  const processedContent = useMemo(() => {
    if (!post?.content) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');
    headings.forEach((h, index) => {
      const cleanText = h.innerText || "";
      const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + index;
      h.setAttribute('id', id);
    });
    return doc.body.innerHTML;
  }, [post?.content]);

  // 2. Map Headings for Table of Contents
  const toc = useMemo(() => {
    if (!post?.content) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h2, h3'));
    return headings.map((h, index) => ({
      id: (h.innerText || "").toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + index,
      text: h.innerText,
      level: h.tagName
    }));
  }, [post?.content]);

  const handleLike = async () => {
    const action = liked ? 'unlike' : 'like';
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    try { await api.put(`/api/posts/${post._id}/like`, { action }); } catch (err) { console.error(err); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.comment || !commentForm.name) return;
    try {
      const res = await api.post(`/api/posts/${post._id}/comments`, commentForm);
      setComments([res.data, ...comments]);
      setCommentForm({ name: '', email: '', comment: '', parentId: null });
      setReplyingTo(null);
    } catch (err) { console.error(err); }
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

  const shareUrl = window.location.href;
  const shareTitle = post?.title || "Check out this article on Herald Sphere";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !post) return <div className="text-center py-20 font-black text-slate-300">NOT FOUND</div>;

  return (
    <div className="w-full bg-white min-h-screen">
      <ReadingProgress />
      <Helmet>
        <title>{post.title} | Herald Sphere</title>
        <meta name="description" content={post.content.substring(0, 160).replace(/<[^>]*>?/gm, '')} />
      </Helmet>

      {/* HEADER: Ultra Tight */}
      <header className="max-w-5xl mx-auto px-4 pt-4 pb-2">
        <Link to="/posts" className="text-[10px] font-black text-slate-400 uppercase tracking-tighter hover:text-indigo-600 transition-colors">← Back</Link>
        <div className="mt-2 border-b border-slate-100 pb-2">
          <span className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">{post.category}</span>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight mt-1 tracking-tighter text-slate-900">{post.title}</h1>
          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
             <img src={post.author?.profilePic ? `http://localhost:5014${post.author.profilePic}` : '/logo.webp'} className="w-5 h-5 rounded-full object-cover border border-slate-200" alt="" />
             <span>{post.author?.firstName} {post.author?.lastName} • {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      {/* MAIN GRID: 3-Column Desktop / 1-Column Mobile */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-4">
        
        {/* LEFT COLUMN: TABLE OF CONTENTS (Desktop Only) */}
        <aside className="hidden lg:block lg:col-span-2 sticky top-24 self-start mb-20">
          <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-1">Contents</h4>
          <nav className="flex flex-col gap-3">
            {toc.map((item) => (
              <a 
                key={item.id} href={`#${item.id}`}
                className={`text-[10px] font-bold transition-all hover:text-indigo-600 ${item.level === 'H3' ? 'ml-3 text-slate-400' : 'text-slate-600'}`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </aside>

        {/* CENTER COLUMN: ARTICLE & COMMENTS */}
        <main className="lg:col-span-7 flex flex-col items-start min-h-0">
          {post.mainImageUrl && (
             <img src={post.mainImageUrl.startsWith('http') ? post.mainImageUrl : `http://localhost:5014${post.mainImageUrl}`} 
                  className="w-full h-auto rounded-xl mb-4 shadow-sm" alt="" />
          )}

          {/* INTERACTION ROW */}
          <div className="w-full flex flex-wrap items-center justify-between py-2 border-y border-slate-100 mb-4 gap-4">
            <button onClick={handleLike} className="flex items-center gap-1 hover:scale-105 transition-transform">
              {liked ? <FaHeart className="text-rose-500" size={16}/> : <FaRegHeart className="text-slate-300" size={16}/>}
              <span className="text-[10px] font-black text-slate-900">{likesCount}</span>
            </button>
            <div className="flex items-center gap-3 text-slate-400">
              <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`, '_blank')} className="hover:text-[#25D366]"><FaWhatsapp size={16}/></button>
              <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank')} className="hover:text-[#0088cc]"><FaTelegramPlane size={16}/></button>
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')} className="hover:text-[#1DA1F2]"><FaTwitter size={16}/></button>
              <button onClick={copyToClipboard} className="ml-1 text-slate-300 hover:text-indigo-600">
                {copied ? <FaCheck size={12} className="text-emerald-500"/> : <FaLink size={12}/>}
              </button>
            </div>
          </div>

          {/* ARTICLE CONTENT */}
          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed mb-0 w-full">
             <div className="ql-editor p-0! min-h-0!" style={{ height: 'auto' }} dangerouslySetInnerHTML={{ 
               __html: DOMPurify.sanitize(processedContent, { ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "id"] }) 
             }} />  
          </div> 

          {/* COMMENTS LIST */}
          <section className="mt-6 border-t border-slate-100 pt-4 w-full mb-10">
            <h3 className="text-xs font-black uppercase text-slate-900 mb-4 tracking-widest text-center">Reader Comments ({comments.length})</h3>
            <div className="mb-6 space-y-2">
               {threadedComments.map(c => (
                 <CommentItem key={c._id} comment={c} onReply={setReplyingTo} replyingTo={replyingTo} setCommentForm={setCommentForm} commentForm={commentForm} handleSubmit={handleCommentSubmit} />
               ))}
               {comments.length === 0 && <p className="text-slate-400 italic text-[10px] text-center">No comments yet.</p>}
            </div>

            {/* FORM */}
            <div className="bg-slate-950 p-5 rounded-3xl text-white shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-center">New Comment</p>
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <textarea required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500" rows="2" placeholder="Your perspective..." value={commentForm.parentId === null ? commentForm.comment : ""} onChange={e => setCommentForm({...commentForm, comment: e.target.value, parentId: null})} />
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="Name" className="bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] outline-none" value={commentForm.name} onChange={e => setCommentForm({...commentForm, name: e.target.value})} />
                  <input required placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] outline-none" value={commentForm.email} onChange={e => setCommentForm({...commentForm, email: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-indigo-600 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-transform active:scale-95">Post comment</button>
              </form>
            </div>
          </section>
        </main>

        {/* RIGHT COLUMN: SIDEBAR */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
            <p className="text-[8px] font-black uppercase text-indigo-600 mb-3 underline underline-offset-4">Author</p>
            <div className="flex items-center gap-3">
              <img src={post.author?.profilePic ? `http://localhost:5014${post.author.profilePic}` : '/logo.webp'} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" alt="" />
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-xs text-slate-900 uppercase truncate leading-none">{post.author?.firstName} {post.author?.lastName}</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Herald Staff</p>
              </div>
            </div>
          </div>

          <div className="px-1 shrink-0">
            <h5 className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest text-center lg:text-left">Related Articles</h5>
            <div className="space-y-3">
              {relatedPosts && relatedPosts.length > 0 ? (
                relatedPosts.map(rp => (
                  <Link key={rp._id} to={`/posts/${rp.slug}`} className="group flex gap-3 items-center">
                    <img src={rp.mainImageUrl || '/logo.webp'} className="w-12 h-12 rounded-lg object-cover bg-slate-100 shadow-sm" alt="" />
                    <h4 className="text-[10px] font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-2 leading-tight tracking-tight uppercase">{rp.title}</h4>
                  </Link>
                ))
              ) : (
                <p className='text-[10px] font-black text-slate-300 uppercase italic text-center'>No related articles</p>
              )}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default PublicPostDetail;