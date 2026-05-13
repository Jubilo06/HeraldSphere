import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './Api';
import { FaHeart, FaRegHeart, FaTwitter, FaLinkedinIn, FaChevronLeft, FaReply,FaLink, FaCheck, FaFacebookF, FaWhatsapp, FaTelegramPlane, FaInstagram,  } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import { ReadingProgress } from './ReadingProgress';

// --- 1. SUB-COMPONENT: INDIVIDUAL COMMENT & RECURSIVE REPLIES ---
const CommentItem = ({ comment, onReply, replyingTo, setCommentForm, commentForm, handleSubmit }) => {
  const isReplying = replyingTo === comment._id;

  return (
    <div className="mb-6">
     <ReadingProgress /> 
      
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
  const [copied, setCopied] = useState(false);
  
  // Interaction States
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '', parentId: null });
  //  const [toc, setToc] = useState([]);

  

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
   const shareUrl = window.location.href;
  const shareTitle = post?.title || "Check out this article on Herald Sphere";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
  };

  const shareActions = {
    twitter: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank'),
    facebook: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank'),
    linkedin: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank'),
    whatsapp: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`, '_blank'),
    telegram: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank'),
    instagram: () => {
      copyToClipboard();
      alert("Link copied to clipboard! Open Instagram to share it in your Story or Bio.");
    }
  };

  // 1. Process the content to inject IDs into H2 and H3 tags
const processedContent = useMemo(() => {
  if (!post?.content) return "";

  // Use DOMParser instead of Regex (much safer and faster)
  const parser = new DOMParser();
  const doc = parser.parseFromString(post.content, 'text/html');
  const headings = doc.querySelectorAll('h2, h3');

  headings.forEach((h, index) => {
    // Generate a clean, unique ID
    const cleanText = h.innerText || "";
    const id = cleanText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-')     // spaces to hyphens
      + '-' + index;            // guarantee uniqueness
      
    h.setAttribute('id', id);
  });

  return doc.body.innerHTML;
}, [post?.content]);

// 2. Updated getHeadings function to match the IDs exactly
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

  const calculateReadTime = (content) => {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>?/gm, ''); // Remove HTML tags
  const noOfWords = text.split(/\s+/).length;
  const minutes = Math.ceil(noOfWords / wordsPerMinute);
  return `${minutes} min read`;
};

const getHeadings = (html) => {
  if (!html) return []; // Safety check

  // 1. Correct method name: parseFromString
  const doc = new DOMParser().parseFromString(html, 'text/html');
  
  // 2. Find all H2 and H3 tags
  const headingElements = Array.from(doc.querySelectorAll('h2, h3'));
  
  return headingElements.map((el, index) => {
    const text = el.innerText;
    
    // 3. Create a URL-friendly ID (slugify equivalent for frontend)
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove special characters
      .replace(/\s+/g, '-')     // replace spaces with hyphens
      + '-' + index;            // add index to guarantee uniqueness

    return { id, text, level: el.tagName };
  });
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
      <div  className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-10">

        {/* SIDEBAR: TABLE OF CONTENTS (Desktop Only) */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-32">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2">Contents</h4>
            <nav className="space-y-4">
              {toc.map((item) => (
                <a 
                  key={item.id} 
                  href={`#${item.id}`}
                  className={`block text-xs font-bold transition-all hover:text-indigo-600 ${item.level === 'H3' ? 'ml-4 text-slate-400' : 'text-slate-600'}`}
                >
                  {item.text}
                </a>
              ))}
              {toc.length === 0 && <p className="text-[10px] italic text-slate-300 font-medium uppercase">No sub-headings in this dispatch</p>}
            </nav>
          </div>
        </aside>
        
        <main className="lg:col-span-6">
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
             <div className="flex flex-wrap items-center gap-4 text-slate-400 py-4 border-y border-slate-100 mb-6">
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mr-2">Share Dispatch:</span>
      
      {/* WhatsApp */}
      <button onClick={shareActions.whatsapp} className="hover:text-[#25D366] transition-colors" title="Share on WhatsApp">
        <FaWhatsapp size={18}/>
      </button>

      {/* Telegram */}
      <button onClick={shareActions.telegram} className="hover:text-[#0088cc] transition-colors" title="Share on Telegram">
        <FaTelegramPlane size={18}/>
      </button>

      {/* Twitter */}
      <button onClick={shareActions.twitter} className="hover:text-[#1DA1F2] transition-colors" title="Share on Twitter">
        <FaTwitter size={18}/>
      </button>

      {/* Instagram */}
      <button onClick={shareActions.instagram} className="hover:text-[#E4405F] transition-colors" title="Share on Instagram">
        <FaInstagram size={18}/>
      </button>

      {/* LinkedIn */}
      <button onClick={shareActions.linkedin} className="hover:text-[#0077B5] transition-colors" title="Share on LinkedIn">
        <FaLinkedinIn size={18}/>
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1"></div>

      {/* Generic Copy Link */}
      <button 
        onClick={copyToClipboard}
        className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors group"
      >
        {copied ? (
          <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-tighter animate-in fade-in zoom-in">
            <FaCheck size={10} /> Copied
          </span>
        ) : (
          <>
            <FaLink size={14} className="group-hover:rotate-45 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Copy Link</span>
          </>
        )}
      </button>
    </div>
          </div>

          {/* CONTENT */}
          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed mb-8 ql-editor p-0! min-h-0!">
             <div 
                className="ql-editor p-0! min-h-0!" 
                style={{ height: 'auto' }} 
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(processedContent, { 
                    ADD_TAGS: ["iframe"], 
                    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "id"] 
                  }) 
                }} 
              />  
          </div> 

          {/* COMMENTS LIST */}
          <section className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-black uppercase text-slate-900 mb-6 tracking-widest">Comments ({comments.length})</h3>
            
            <div className="mb-10">
               {threadedComments.map(c => (
                 <CommentItem 
                   key={c._id} comment={c} onReply={setReplyingTo} replyingTo={replyingTo}
                   setCommentForm={setCommentForm} commentForm={commentForm} handleSubmit={handleCommentSubmit}
                 />
               ))}
               {comments.length === 0 && <p className="text-slate-400 italic text-[11px]">No comments yet.</p>}
            </div>

            {/* NEW COMMENT FORM (Always visible for new threads) */}
            <div className="bg-slate-950 p-6 rounded-4xl text-white shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest mb-4">New Comment</p>
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
        <aside className="lg:col-span-3 space-y-6 mt-6 lg:mt-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[8px] font-black uppercase text-indigo-600 mb-3 underline">Author</p>
            <div className="flex items-center gap-3">
              <img src={post.author?.profilePic ? `http://localhost:5014${post.author.profilePic}` : '/logo.webp'} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
              <div className="min-w-0">
                <h4 className="font-black text-xs text-slate-900 uppercase truncate">{post.author?.firstName} {post.author?.lastName}</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Herald Contributor</p>
              </div>
            </div>
          </div>

          <div className="px-1">
            <h5 className="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-widest">Related Articles</h5>
            <div className="space-y-4">
              {relatedPosts.map(rp => (
                <Link key={rp._id} to={`/posts/${rp.slug}`} className="group flex gap-3 items-center">
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