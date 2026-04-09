import React from 'react'
import axios from 'axios'
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function PostList() {
     const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 5; // You can make this configurable

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchPosts();
  }, []);

  // useEffect(() => {
  //   const pageFromUrl = parseInt(searchParams.get('page')) || 1;
  //   setCurrentPage(pageFromUrl);
  //   fetchPosts(pageFromUrl);
  // }, [searchParams]); // Re-fetch when URL search params change
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(pageFromUrl);
    fetchPosts(pageFromUrl);
  }, [searchParams, fetchPosts]); // Re-fetch when URL search params or fetchPosts changes

  const fetchPosts = useCallback(async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5014/api/posts?page=${page}&limit=${postsPerPage}`);
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [postsPerPage]); // Depend on postsPerPage if it's dynamic

  // const fetchPosts = async (page) => {
  //   setLoading(true);
  //   try {
  //     // Adjust URL to include pagination parameters
  //     const response = await fetch(`http://localhost:5000/api/posts?page=${page}&limit=${postsPerPage}`);
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     setPosts(data.posts);
  //     setTotalPages(data.totalPages);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage }); // Update URL, which triggers useEffect
  };

  // const fetchPosts = async () => {
  //   try {
  //     const response = await fetch('http://localhost:5000/api/posts'); // Your backend URL
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     setPosts(data);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleDelete = async (id) => {
  //   if (window.confirm('Are you sure you want to delete this post?')) {
  //     try {
  //       const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
  //         method: 'DELETE',
  //       });
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       setPosts(posts.filter(post => post._id !== id)); // Remove from UI
  //     } catch (err) {
  //       console.error('Failed to delete post:', err);
  //       setError('Failed to delete post.');
  //     }
  //   }
  // };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:5014/api/posts/${id}`);
        // After successful deletion, re-fetch posts for the current page
        // Or, if the last item on a page was deleted, go to the previous page if current page is > 1
        const newPage = (posts.length === 1 && currentPage > 1) ? currentPage - 1 : currentPage;
        setSearchParams({ page: newPage }); // This will trigger useEffect and fetchPosts
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;
  if (posts.length === 0 && currentPage === 1) return <div className="no-posts">No posts found. <Link to="/admin/posts/new">Create the first post?</Link></div>;
  if (posts.length === 0 && currentPage > 1) return <div className="no-posts">No posts on this page. Try going back.</div>;
  return (
    <div>
        <h2>Admin Post List</h2>
      <Link to="/admin/posts/new">Create New Post</Link>
      <ul>
        {posts.map(post => (
          <li key={post._id}>
            <h3>{post.title}</h3>
            <p>{post.content.substring(0, 100)}...</p>
            <Link to={`/admin/posts/edit/${post._id}`}>Edit</Link>
            <button onClick={() => handleDelete(post._id)}>Delete</button>
          </li>
        ))}
      </ul>
      Pagination Controls
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span> Page {currentPage} of {totalPages} </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        {/* You could add buttons for specific page numbers */}
      </div>

      
    </div>
  )
}

export default PostList