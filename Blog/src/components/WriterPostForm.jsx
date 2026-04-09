// src/components/PostForm.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { AuthContext } from './AuthContext';
import axios from 'axios'; // Ensure axios is imported for direct calls like image upload
import api from './Api'; // Use your configured axios instance for post CRUD

function WriterPostForm() {
  const { id } = useParams(); // Get ID from URL for editing
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useContext(AuthContext); // Get user from context

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState(''); // For the URL of the main image
const [mainImageFile, setMainImageFile] = useState(null); // For the actual file to upload
  // Author will be derived from context for creation, not a state field for input by user
  // const [author, setAuthor] = useState('Admin'); // Remove this if author is auto-set
  const [isEditing, setIsEditing] = useState(false);
  // Image handling is now primarily within ReactQuill, so no direct `image` state for main post image
  // const [image, setImage] = useState(null);
  // const [existingImageUrl, setExistingImageUrl] = useState('');
  const [loading, setLoading] = useState(false); // For form submission and initial fetch
  const [error, setError] = useState(null);

  const categories = ['Science', 'Business', 'Technology', 'Health', 'Sports', 'Opinion', 'Other'];
  const isEditMode = !!id; // True if 'id' param exists

  // --- Initial Fetch for Edit Mode ---
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
        // This is a fallback; ProtectedRoute should handle this
        navigate('/login');
        return;
    }

    if (isEditMode && !isLoading && isAuthenticated && user) {
      setIsEditing(true);
      setLoading(true);
      setError(null);
      api.get(`/api/posts/${id}`) // Use your 'api' instance
        .then(response => {
          const post = response.data;

          // --- Role-Aware Permission Check for Editing ---
          if (user.role === 'user' && post.author !== user._id) {
            setError("You are not authorized to edit this post.");
            navigate('/my-posts'); // Redirect non-authors to their posts
            return;
          }
          // --- END Permission Check ---

          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category || '');
          setMainImageUrl(post.mainImageUrl || '');
          // If you had a 'mainImage' for the post separate from Quill content, set it here
        })
        .catch(err => {
          console.error("Error fetching post:", err);
          setError(err.response?.data?.message || 'Failed to fetch post.');
          // Redirect if post not found or forbidden
          if (err.response?.status === 404) {
            navigate(user.role === 'admin' ? '/admin/posts' : '/my-posts'); // Redirect based on role
          } else if (err.response?.status === 403) {
            setError("You don't have permission to view/edit this post.");
            navigate(user.role === 'admin' ? '/admin/posts' : '/my-posts');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!isEditMode) {
      // Reset for creation mode
      setIsEditing(false);
      setTitle('');
      setContent('');
      setCategory('');
      setError(null); // Clear previous errors
    }
  }, [id, isEditMode, navigate, user, isAuthenticated, isLoading]);


  // --- ReactQuill Modules and Image Handler ---
  const modules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: async function () {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files[0];
            if (file) {
              const formData = new FormData();
              formData.append('image', file);
              const token = localStorage.getItem('token');
              if (!token) {
                  setError('Not authenticated. Please log in to upload images.');
                  return; // Don't even try to upload
              }
              try {
                // Use axios directly for image upload, as it's a specific endpoint
                const response = await api.post('http://localhost:5014/api/upload-image', formData, {
                  headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
                  withCredentials: true, // If your image upload endpoint requires credentials
                });

                const imageUrl = response.data.imageUrl;
                const quill = this.quill;
                const range = quill.getSelection();
                quill.insertEmbed(range.index, 'image', imageUrl, 'user'); // Add 'user' source
              } catch (uploadError) {
                console.error('Image upload failed:', uploadError);
                setError('Image upload failed. Please try again.'); // Set error state
              }
            }
          };
        },
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  // --- Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!title || !content || !category) {
      setError('Please fill in all fields (Title, Content, and Category).');
      setLoading(false);
      return;
    }

    if (!user) { // Fallback, should be caught by ProtectedRoute
        setError("You must be logged in to create/edit posts.");
        setLoading(false);
        navigate('/login');
        return;
    }
     let finalMainImageUrl = mainImageUrl; // Start with existing/cleared URL

    // Upload new main image file if one is selected
    if (mainImageFile) {
        const formData = new FormData();
        formData.append('image', mainImageFile); // 'image' should match your multer field name

        try {
            const response = await api.post('/api/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            finalMainImageUrl = response.data.imageUrl; // Get the URL from the upload response
        } catch (uploadError) {
            console.error('Main image upload failed:', uploadError);
            setError('Featured image upload failed. Please try again.');
            setLoading(false);
            return; // Stop form submission if main image upload fails
        }
    }

    const postData = {
      title,
      content,
      category,
       mainImageUrl: finalMainImageUrl,
      // The author ID will be set by the backend based on req.user._id
      // No need to send 'author' from frontend directly for security
    };

    try {
      if (isEditMode) {
        await api.put(`/api/posts/${id}`, postData); // Use your 'api' instance
      } else {
        await api.post('/api/posts', postData); // Use your 'api' instance
      }
      
      // --- Role-Aware Redirection after Submission ---
      if (user.role === 'admin') {
        navigate('/admin/posts'); // Admin goes to admin's list of all posts
      } else {
        navigate('/my-posts'); // Regular user goes to their own list of posts
      }

    } catch (err) {
      console.error("Error submitting post:", err);
      setError(err.response?.data?.message || 'Failed to submit post.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Logic ---
  if (isLoading) return <div>Loading user authentication...</div>; // Show loading for AuthContext
  if (!isAuthenticated) return <navigate to="/login" replace />; // Should be handled by ProtectedRoute
  if (loading && isEditMode) return <div>Loading post for editing...</div>; // For initial data fetch for edit
  // If not editing, and is just loading submission
  if (loading && !isEditMode) return <div>Submitting post...</div>;

  const formTitle = isEditMode
    ? (user?.role === 'admin' ? 'Edit Any Post' : 'Edit Your Post')
    : (user?.role === 'admin' ? 'Create New Post (Admin)' : 'Submit New Post');

  return (
    <div>
      <h2>{formTitle}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Select a Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group quill-editor-group">
          <label htmlFor="content">Content:</label>
          <ReactQuill
            value={content}
            onChange={setContent}
            modules={modules}
            theme="snow"
            placeholder="Write your post content here..."
            className="quill-editor"
          />
        </div>
        <div className="form-group">
          <label htmlFor="mainImage">Featured Image:</label>
          <input
            type="file"
            id="mainImage"
            accept="image/*"
            onChange={(e) => {
                setMainImageFile(e.target.files[0]);
                setMainImageUrl(''); // Clear previous URL if new file is selected
            }}
            className="form-input"
          />
          {mainImageUrl && ( // Display existing or newly uploaded main image
            <div style={{ marginTop: '10px' }}>
              <img src={mainImageUrl} alt="Featured Post" style={{ maxWidth: '200px', display: 'block' }} />
              <button
                type="button"
                onClick={() => {
                  setMainImageUrl(null); // Set to null to remove it from the post
                  setMainImageFile(null); // Clear any pending file
                }}
                style={{ marginTop: '5px' }}
              >
                Remove Image
              </button>
            </div>
          )}
          {/* If you want to show a preview of a newly selected file before upload */}
          {mainImageFile && !mainImageUrl && (
              <div style={{ marginTop: '10px' }}>
                  <img src={URL.createObjectURL(mainImageFile)} alt="New Featured" style={{ maxWidth: '200px', display: 'block' }} />
                  <button
                    type="button"
                    onClick={() => setMainImageFile(null)}
                    style={{ marginTop: '5px' }}
                  >
                    Clear Selected File
                  </button>
              </div>
          )}
        </div>
        {/* Author field removed for direct user input, as backend sets it securely */}
        {/* {error && <p style={{ color: 'red' }}>Error: {error}</p>} */}
        {error && <p style={{ color: 'red', margin: '10px 0' }}>Error: {error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (isEditMode ? 'Update Post' : 'Create Post')}
        </button>
        <button
          type="button"
          onClick={() => navigate(user?.role === 'admin' ? '/admin/posts' : '/my-posts')}
          disabled={loading}
          style={{ marginLeft: '10px' }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default WriterPostForm;