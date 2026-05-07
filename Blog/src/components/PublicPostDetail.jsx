import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './Api';
import Footer from './Footer';
import { FaHeart, FaRegHeart, FaTwitter, FaLinkedin, FaChevronLeft, FaReply } from 'react-icons/fa';

function PublicPostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => { window.scrollTo(0, 0); loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([api.get(`/api/posts/${id}`), api.get(`/api/posts/${id}/comments`)]);
      
      // CLEANUP: Remove trailing empty paragraphs that Quill often adds
      const cleanedContent = pRes.data.content.replace(/(<p><br><\/p>)+$/, "");
      setPost({ ...pRes.data, content: cleanedContent });
      
      setLikesCount(pRes.data.likes || 0);
      setComments(cRes.data || []);
      const relRes = await api.get(`/api/posts?category=${pRes.data.category}&limit=4`);
      setRelatedPosts(relRes.data.posts.filter(p => p._id !== id));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="w-full bg-white min-h-screen pb-4">
      {/* HEADER SECTION */}
      <header className="max-w-5xl mx-auto px-4 pt-4">
        <Link to="/posts" className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">← Back</Link>
        <div className="mt-2 border-b border-slate-100 pb-2">
          <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">{post.category}</span>
          <h1 className="text-2xl md:text-5xl font-black leading-tight mt-1 tracking-tighter text-slate-900">{post.title}</h1>
          <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
            {post.author?.firstName} {post.author?.lastName} • {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </header>

      {/* MAIN LAYOUT - Crucial: items-start prevents columns from stretching each other */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT/CENTER COLUMN */}
        <main className="lg:col-span-8 flex flex-col">
          {post.mainImageUrl && (
             <img src={post.mainImageUrl.startsWith('http') ? post.mainImageUrl : `http://localhost:5014${post.mainImageUrl}`} 
                  className="w-full h-auto rounded-xl mt-4 mb-4 shadow-sm" alt="" />
          )}

          {/* SOCIAL INTERACTION */}
          <div className="flex items-center gap-6 py-2 border-y border-slate-100 mb-4">
            <button onClick={() => setLiked(!liked)} className="flex items-center gap-1">
              {liked ? <FaHeart className="text-rose-500" size={14}/> : <FaRegHeart className="text-slate-300" size={14}/>}
              <span className="text-[10px] font-black">{likesCount + (liked?1:0)}</span>
            </button>
            <div className="flex gap-4 text-slate-300"><FaTwitter size={14}/><FaLinkedin size={14}/></div>
          </div>

          {/* THE ARTICLE CONTENT - margin-bottom: 0 is forced here */}
          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed mb-0">
            <div 
              className="ql-editor !p-0 !min-h-0" 
              style={{ height: 'auto' }} 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </div>

          {/* COMMENTS AREA - Sits directly below the text */}
          <section className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-black uppercase text-slate-900 mb-4">Transmissions ({comments.length})</h3>
            
            <div className="space-y-4 mb-6">
               {comments.map((c, i) => (
                 <div key={i} className="flex gap-3 text-[11px]">
                   <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">{c.name.charAt(0)}</div>
                   <div className="bg-slate-50 p-3 rounded-xl flex-1 border border-slate-100">
                     <p className="font-black text-slate-900 mb-1">{c.name}</p>
                     <p className="text-slate-600 leading-snug">{c.comment}</p>
                   </div>
                 </div>
               ))}
            </div>

            {/* QUICK FORM */}
            <div className="bg-slate-950 p-5 rounded-2xl text-white">
              <p className="text-[10px] font-black uppercase tracking-widest mb-4">Post Dispatch</p>
              <form className="space-y-3">
                <textarea className="w-full bg-white/10 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500" rows="3" placeholder="Your perspective..." />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Name" className="bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] outline-none" />
                  <input placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] outline-none" />
                </div>
                <button className="w-full bg-indigo-600 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">Transmit</button>
              </form>
            </div>
          </section>
        </main>

        {/* SIDEBAR - Compact and sits tightly below the content on mobile */}
        <aside className="lg:col-span-4 space-y-6 mt-6 lg:mt-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[8px] font-black uppercase text-indigo-600 mb-3 underline underline-offset-4">The Contributor</p>
            <div className="flex items-center gap-3">
              <img src={post.author?.profilePic || '/logo.webp'} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" alt="" />
              <div className="min-w-0">
                <h4 className="font-black text-xs text-slate-900 uppercase truncate">{post.author?.firstName} {post.author?.lastName}</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Herald Staff</p>
              </div>
            </div>
          </div>

          <div className="px-1">
            <h5 className="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-widest">Related Dispatches</h5>
            <div className="space-y-4">
              {relatedPosts.map(rp => (
                <Link key={rp._id} to={`/posts/${rp._id}`} className="group flex gap-3 items-center">
                  <img src={rp.mainImageUrl || '/logo.webp'} className="w-12 h-12 rounded-lg object-cover shrink-0 shadow-sm" alt="" />
                  <h4 className="text-[10px] font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-2 leading-tight uppercase tracking-tighter">{rp.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        </aside>

      </div>
      {/* <div className='mt-10 mb-0 absolute '>
        <Footer />
      </div> */}
    </div>
  );
}

export default PublicPostDetail;