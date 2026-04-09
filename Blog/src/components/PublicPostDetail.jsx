// src/pages/PublicPostDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function PublicPostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5014/api/posts/${id}`)
      .then(response => {
        setPost(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading post...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div className="public-post-detail">
      <h1 className="post-detail-title">{post.title}</h1>
      {post.category && <p className="post-detail-category">Category: {post.category}</p>}
      <div className="post-detail-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      <p className="post-detail-date">Published on: {new Date(post.createdAt).toLocaleDateString()}</p>
      <Link to="/posts">Back to Blog</Link>
    </div>
  );
}

export default PublicPostDetail;