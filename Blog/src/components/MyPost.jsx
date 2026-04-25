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
        setPosts(posts.filter(post => post._id !== postId));
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
    <div className='bg-[url("/myPost.webp")] bg-center bg-cover h-screen '>
        <h3 className='text-2xl font-extrabold pt-10 ml-10'>Your Contributions ({user?.username})</h3>
      <p className='text-gray-500 pt-10 ml-16 mb-10'>List of posts written by you.</p>
      {/* Fetch and display posts where author matches current user's ID */}
      <div className=' w-[90%] justify-self-center p-4   border rounded mb-6 h-auto'>
          {posts.map(post => (
              <div className='flex w-full  flex-wrap justify-self-start 
              h-auto gap-6 mb-4 border-b-black shadow-2xl bg-white text-black 
              offset-4 p-4' key={post._id}>
                <div>
                  <Link to={`/edit-post/${post._id}`}>{post.title}</Link> 
                  - {new Date(post.createdAt).toLocaleDateString()}
                </div>
                
                  {/* Add options to delete, view public post etc. */}
                   {/* Edit Button */}
                   <div className='flex flex-wrap gap-4'>
                      <Link to={`/edit-post/${post._id}`}>
                        <button className='border border-amber-950 rounded p-1 w-20 
                        hover:cursor-pointer'>Edit</button>
                      </Link>
                    {/* Delete Button */}
                      <button className='border border-amber-950 rounded p-1 w-20 
                      hover:cursor-pointer' onClick={() => handleDelete(post._id)} >
                          Delete
                      </button>
                   </div>
                
                
              </div>
          ))}
          
      </div>
      <Link className='bg-blue-900 text-white 
      border border-amber-950 rounded p-1 w-60 hover:cursor-pointer ml-5 sm:ml-8 md:ml-12'  
      to="/submit-post">Submit a New Post</Link>
    </div>
  )
}

export default MyPost