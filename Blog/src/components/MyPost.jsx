import React from 'react'
import { Link } from 'react-router-dom';
import api from './Api';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';

function MyPost() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
        if (user) {
            const fetchMyPosts = async () => {
                try {
                    // This endpoint needs to be implemented in your backend postRoutes.mjs
                    const response = await api.get('/api/posts/my-posts'); 
                    setPosts(response.data);
                } catch (err) {
                    console.error("Error fetching my posts:", err);
                    setError(err.response?.data?.message || 'Failed to fetch your posts.');
                } finally {
                    setLoading(false);
                }
            };
            fetchMyPosts();
        } else {
            setLoading(false); // No user, so no posts to fetch
        }
    }, [user]);
     const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/api/posts/${postId}`);
        // Remove the deleted post from the state
        setMyPosts(myPosts.filter(post => post._id !== postId));
        console.log(`Post ${postId} deleted successfully.`);
      } catch (err) {
        console.error('Error deleting post:', err);
        setError(err.response?.data?.message || 'Failed to delete post.');
      }
    }
  };

    if (loading) return <div>Loading your posts...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
    if (posts.length === 0) return <div>You haven't created any posts yet. <Link to="/submit-post">Start writing!</Link></div>;
  return (
    <div>
        <h3>My Contributions ({user?.username})</h3>
      <p>List of posts written by the current user will go here.</p>
      {/* Fetch and display posts where author matches current user's ID */}
      <div>
          {posts.map(post => (
              <div key={post._id}>
                  <Link to={`/edit-post/${post._id}`}>{post.title}</Link> - {new Date(post.createdAt).toLocaleDateString()}
                  {/* Add options to delete, view public post etc. */}
                   {/* Edit Button */}
                <Link to={`/edit-post/${post._id}`}>
                    <button style={{ marginRight: '10px' }}>Edit</button>
                </Link>
                {/* Delete Button */}
                <button onClick={() => handleDelete(post._id)} style={{ backgroundColor: 'red', color: 'white' }}>
                    Delete
                </button>
              </div>
          ))}
      </div>
      <Link to="/submit-post">Submit a New Post</Link>
    </div>
  )
}

export default MyPost