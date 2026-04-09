import React from 'react'
import { useState, useEffect } from 'react'
import api from './Api'
import { Link } from 'react-router-dom';
function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]); // This will be all posts, not just admin's
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all users
        const usersResponse = await api.get('/api/auth/admin/users'); // Using /api/auth for users
        setUsers(usersResponse.data);

        // Fetch all posts (using your existing admin endpoint)
        const postsResponse = await api.get('/api/posts/admin/all');
        setPosts(postsResponse.data);

      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError(err.response?.data?.message || 'Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // --- User Management Handlers (similar to post delete) ---
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user and ALL their posts?")) {
      try {
        await api.delete(`/api/auth/admin/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
        // You might need to re-fetch posts too if deleting a user should remove their posts from the list
        // Or handle cascading delete on the backend.
        alert("User deleted successfully.");
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  // --- Post Management Handlers (already implemented in principle for user's own posts) ---
  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/api/posts/${postId}`); // This uses the shared delete endpoint
        setPosts(posts.filter(post => post._id !== postId));
        alert("Post deleted successfully.");
      } catch (err) {
        console.error('Error deleting post:', err);
        setError(err.response?.data?.message || 'Failed to delete post.');
      }
    }
  };

  if (loading) return <div>Loading Admin Dashboard...</div>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <section className="admin-section">
        <h3>Manage Users ({users.length})</h3>
        {users.length === 0 ? (
            <p>No users found.</p>
        ) : (
            <table>
            <thead>
                <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td>
                    {/* Only allow deleting non-admin users, or prevent self-deletion */}
                    {user.role !== 'admin' && ( // Example: Don't allow deleting other admins directly here
                        <button onClick={() => handleDeleteUser(user._id)} style={{ backgroundColor: 'red', color: 'white', marginRight: '5px' }}>Delete</button>
                    )}
                    {/* <Link to={`/admin/users/edit/${user._id}`}><button>Edit</button></Link> */}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </section>

      <section className="admin-section" style={{ marginTop: '30px' }}>
        <h3>Manage All Posts ({posts.length})</h3>
        {posts.length === 0 ? (
            <p>No posts found.</p>
        ) : (
            <table>
            <thead>
                <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {posts.map(post => (
                <tr key={post._id}>
                    <td>{post._id}</td>
                    <td>{post.title}</td>
                    <td>{post.author?.username || 'N/A'}</td> {/* Populate author in backend */}
                    <td>{post.category}</td>
                    <td>
                    <Link to={`/edit-post/${post._id}`}><button style={{ marginRight: '5px' }}>Edit</button></Link>
                    <button onClick={() => handleDeletePost(post._id)} style={{ backgroundColor: 'red', color: 'white' }}>Delete</button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </section>
    </div>
  )
}

export default AdminDashboard