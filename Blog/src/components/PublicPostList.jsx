import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function PublicPostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 5;

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(pageFromUrl);
    fetchPosts(pageFromUrl);
  }, [searchParams]);

  const fetchPosts = async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5014/api/posts?page=${page}&limit=${postsPerPage}`);
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;
  if (posts.length === 0) return <>
    <div>
       <nav className='bg-amber-300 w-full h-15 flex flex-wrap place-items-center-safe justify-around'>
         <div><a href='#'>TemmyDeBlogger</a></div>
         <ul className='flex flex-wrap justify-between  w-[320px]' >
           <li><a href='#home'>Home</a></li>
           <li><a href='#about'>About</a></li>
           <li><a href='#contact'>Contact</a></li>
         </ul>
         <div><input className='w-[50] h-[50] border round border-amber-900' type='search' /></div>
       </nav>

       <div className=' w-full h-60  justify-center place-content-center'>
         <div className='border-blue-500 w-80 flex flex-wrap justify-center  border-2  place-self-center'>
         <span className='text-3xl '>Hi I am Temiloluwa.</span> 
       <br/> A web developer and content creator</div></div> 
      
       <div className='w-full h-120  flex  justify-center place-content-center'>
         <div className='w-100 h-100 border-2 border-amber-900 place-self-center'>
           <img className='w-full h-full' src='hero1.webp' />
         </div>
       </div>
       <section className='w-full h-100 border-2 border-amber-950'>
         <div>
           <h1>Latest Post</h1>
           <ul>
             <li>Title</li>
             <li>Content</li>
             <li>Date</li>
           </ul>
           <div><button><a>&lt; View older posts</a></button></div>
         </div>
       </section>
     </div> 
    <div>No posts published yet.</div>;
    </>

  return (
    <div>
      <h2>Latest Blog Posts</h2>
      <ul>
        {posts.map(post => (
          <li key={post._id}>
            <h3>{post.title}</h3>
            {post.category && <p>Category: {post.category}</p>}
            {/* Render full content safely for a public view if needed, or a longer snippet */}
            <div dangerouslySetInnerHTML={{ __html: post.content.substring(0, 200) + '...' }} />
            {/* You'd typically have a Link to /posts/:id for full post view */}
            <Link to={`/posts/${post._id}`}>Read More</Link>
          </li>
        ))}
      </ul>

      {/* Pagination Controls */}
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
      </div>
    </div>
  );
}
export default PublicPostList;