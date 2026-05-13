import React from 'react'
import { useState, useEffect } from 'react'
import api from './Api'
import { Link } from 'react-router-dom';
function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]); // This will be all posts, not just admin's
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersPage, setUsersPage] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalUsersPages, setTotalUsersPages] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const [totalPostsPages, setTotalPostsPages] = useState(1);
  // Total Counts for Stats
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalPostsCount, setTotalPostsCount] = useState(0);
   const limit = 10; // Items per page

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await api.get(`/api/auth/admin/users?page=${usersPage}&limit=${limit}`);
      // Assuming backend returns { users, totalPages, totalUsers }
      setUsers(res.data.users || res.data); 
      setTotalUsersPages(res.data.totalPages || 1);
      setTotalUsersCount(res.data.totalUsers || res.data.length);
    } catch (err) {
      setError("Failed to load users.");
    }
  };
  
  // Fetch Posts
  const fetchPosts = async () => {
    try {
      const res = await api.get(`/api/posts/admin/all?page=${postsPage}&limit=${limit}`);
      // Assuming backend returns { posts, totalPages, totalPosts }
      setPosts(res.data.posts || res.data);
      setTotalPostsPages(res.data.totalPages || 1);
      setTotalPostsCount(res.data.totalPosts || res.data.length);
    } catch (err) {
      setError("Failed to load posts.");
    }
  };

  const fetchSubscriberCount = async () => {
  try {
    const res = await api.get('/api/posts/admin/subscribers/count');
    setTotalSubscribers(res.data.totalSubscribers);
  } catch (err) {
    console.error("Error fetching subscribers:", err);
  }
};

   useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchPosts(), fetchSubscriberCount()]);
      setLoading(false);
    };
    loadData();
  }, [usersPage, postsPage]); // Re-fetch when page numbers change

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Permanently delete this user?")) {
      try {
        await api.delete(`/api/auth/admin/users/${userId}`);
        fetchUsers(); // Re-fetch current page
      } catch (err) { setError(err.response?.data?.message); }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Permanently delete this article?")) {
      try {
        await api.delete(`/api/posts/${postId}`);
        fetchPosts(); // Re-fetch current page
      } catch (err) { setError(err.response?.data?.message); }
    }
  };
  const runMigration = async () => {
  try {
    const res = await api.get('/api/posts/admin/migrate-slugs');
    alert(res.data.message);
  } catch (err) {
    alert("Migration failed: " + err.message);
  }
};

   // Reusable Pagination Component
  const PaginationControls = ({ current, total, onChange }) => (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
        Page {current} of {total}
      </p>
      <div className="flex gap-2">
        <button 
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className="px-3 py-1 text-xs font-bold uppercase tracking-tighter bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
        >
          Prev
        </button>
        <button 
          onClick={() => onChange(current + 1)}
          disabled={current === total}
          className="px-3 py-1 text-xs font-bold uppercase tracking-tighter bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
        >
          Next
        </button>
      </div>
    </div>
  );

  // if (loading) return <div>Loading Admin Dashboard...</div>;
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 pt-10 pb-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin <span className="text-indigo-600">Command Center</span></h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Global management of the Herald Sphere ecosystem.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-bold">{error}</div>}

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
            <h2 className="text-4xl font-black text-gray-900 mt-2">{totalUsersCount}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Posts</p>
            <h2 className="text-4xl font-black text-indigo-600 mt-2">{totalPostsCount}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Growth Status</p>
            <h2 className="text-4xl font-black text-emerald-600 mt-2 font-mono">ACTIVE</h2>
          </div>
          {/* NEW: SUBSCRIBERS CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border  ring-2 ring-rose-50 border-rose-100">
            <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">Subscribers</p>
            <h2 className="text-4xl font-black text-rose-600 mt-2">{totalSubscribers}</h2>
          </div>
        </div>

        <section className="mb-12">
  <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tighter">Editorial Queue</h3>
  <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
    {posts.filter(p => p.status === 'pending').map(post => (
      <div key={post._id} className="p-6 flex items-center justify-between border-b border-slate-50 last:border-0">
        <div>
          <h4 className="font-bold text-slate-900">{post.title}</h4>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">By {post.author.username}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleStatusUpdate(post._id, 'published')}
            className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg"
          >
            Approve & Publish
          </button>
          <button 
            onClick={() => handleStatusUpdate(post._id, 'rejected')}
            className="px-4 py-2 bg-rose-50 text-rose-500 text-[10px] font-black uppercase rounded-lg"
          >
            Reject
          </button>
        </div>
      </div>
    ))}
    {posts.filter(p => p.status === 'pending').length === 0 && (
      <p className="p-10 text-center text-slate-400 italic text-sm">The editorial queue is clear.</p>
    )}
  </div>
</section>

        {/* USERS TABLE */}
        <section className="mb-12">
          <h3 className="text-xl font-bold text-gray-800 mb-4 ml-2">User Directory</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Role</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-[10px]">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(user._id)} className="text-red-500 hover:text-red-700 font-black text-[10px] uppercase tracking-widest">Terminate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls current={usersPage} total={totalUsersPages} onChange={setUsersPage} />
          </div>
        </section>

        {/* POSTS TABLE */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4 ml-2">Content Archives</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Article</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Author</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map(post => (
                    <tr key={post._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/posts/${post._id}`} className="font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">{post.title}</Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter">{post.author?.username || 'Herald Staff'}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-4 font-black text-[10px] uppercase tracking-widest">
                        <Link to={`/edit-post/${post._id}`} className="text-indigo-600 hover:text-indigo-800">Edit</Link>
                        <button onClick={() => handleDeletePost(post._id)} className="text-red-500 hover:text-red-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={runMigration} className="bg-orange-500 text-white p-2 rounded">
  Fix Missing Slugs
</button>
            <PaginationControls current={postsPage} total={totalPostsPages} onChange={setPostsPage} />
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard