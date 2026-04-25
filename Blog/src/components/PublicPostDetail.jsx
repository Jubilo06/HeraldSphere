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

  // useEffect(() => {
  //   setLoading(true);
  //   axios.get(`http://localhost:5014/api/posts/${id}`)
  //     .then(response => {
  //       setPost(response.data);
  //       setLoading(false);
  //     })
  //     .catch(err => {
  //       setError(err.message);
  //       setLoading(false);
  //     });
  // }, [id]);
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

  if (loading) return <div>Loading post...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div className="public-post-detail w-full">
      <article className='w-full justify-center place-items-center'>
        {post.category && <p className="post-detail-category mb-8 text-gray-400"> {post.category}</p>}
        <h1 className="post-detail-title text-5xl font-extrabold mb-10">{post.title}</h1>
        <div className='flex flex-wrap gap-4 mb-10'>
          <div>
            {post.author ? (
              <div className='flex '>
                <p> By - {post.author.lastName} {post.author.firstName}</p>
              </div>
            ) : (
              <p>Author: Unknown</p> 
            )}
          </div>
          <p className="post-detail-date">{new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
        
         {post.mainImageUrl && (
          <img src={post.mainImageUrl.startsWith('http') ? post.mainImageUrl : `http://localhost:5014${post.mainImageUrl}`} 
               className="w-full h-150 object-cover rounded mb-8" alt={post.title} />
        )}
        
        <div className="post-detail-content mb-4" dangerouslySetInnerHTML={{ __html: post.content }} />
        
        
        
        <Link  to="/posts">Back to Blog ⬅</Link>
      </article>
      <hr className="my-10" />

      {/* RELATED POSTS SECTION */}
      <section className="mt-12">
        <h3 className="text-2xl font-bold mb-6">More from {post.category}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedPosts.map(rp => (
            <Link key={rp._id} to={`/posts/${rp._id}`} className="block border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              {rp.mainImageUrl && (
                <img src={rp.mainImageUrl.startsWith('http') ? rp.mainImageUrl : `http://localhost:5014${rp.mainImageUrl}`} 
                     className="w-full h-32 object-cover" alt={rp.title} />
              )}
              <div className="p-3">
                <h4 className="font-bold text-sm line-clamp-2">{rp.title}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
    </div>
  );
}

export default PublicPostDetail;