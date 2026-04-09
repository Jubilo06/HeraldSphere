import React from 'react'
import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new'; // Import ReactQuill
import 'react-quill-new/dist/quill.snow.css'; // Import Quill's CSS
import { AuthContext } from './AuthContext';
function PostForm() {
    const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Admin'); // Default author
  const [category, setCategory] = useState('');
   const [isEditing, setIsEditing] = useState(false);
   const [image, setImage] = useState(null); // For new image uploads
  const [existingImageUrl, setExistingImageUrl] = useState(''); // To display current image in edit mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL for editing
  const { user, isAuthenticated, isLoading } = useContext(AuthContext); 

  const categories = ['Science', 'Business', 'Technology', 'Health', 'Sports', 'Opinion', 'Other'];
   const isEditMode = !!id; // True if 'id' param exists
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      setLoading(true);
      axios.get(`http://localhost:5014/api/posts/${id}`)
        .then(response => {
          setTitle(response.data.title);
          setContent(response.data.content);
          setCategory(response.data.category || ''); // Set category, default to empty if not present
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setIsEditing(false);
      setTitle('');
      setContent('');
      setCategory('');
    }
  }, [id]);

  const modules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'], // Add 'image' to the toolbar
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

              try {
                // IMPORTANT: This 'upload-image' endpoint needs to exist on your backend
                // It should accept a file, save it (e.g., to S3, Cloudinary, or local),
                // and return the public URL of the saved image.
                const response = await axios.post('http://localhost:5014/api/upload-image', formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                });

                const imageUrl = response.data.imageUrl; // Expecting imageUrl from backend
                const quill = this.quill;
                const range = quill.getSelection();
                quill.insertEmbed(range.index, 'image', imageUrl);
              } catch (uploadError) {
                console.error('Image upload failed:', uploadError);
                alert('Image upload failed. Please try again.');
              }
            }
          };
        },
      },
    },
    clipboard: {
      matchVisual: false, // Prevents issues with copying styled content
    },
  }), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!title || !content || !category) {
      setError('Please fill in all fields (Title, Content, and Category).');
      setLoading(false);
      return;
    }

    const postData = { title, content, category };

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5014/api/posts/${id}`, postData);
      } else {
        await axios.post('http://localhost:5014/api/posts', postData);
      }
      navigate('/admin/posts'); // Redirect to post list after save
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <div>Loading post for editing...</div>; // Only show for edit mode initial load

  return (
    <div>
        <h2>{id ? 'Edit Post' : 'Create New Post'}</h2>
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
            modules={modules} // Pass the configured modules
            theme="snow" // Or "bubble"
            placeholder="Write your post content here..."
            className="quill-editor"
          />
        </div>
        <div>
          <label>Author:</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={loading}
          />
        </div>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (id ? 'Update Post' : 'Create Post')}
        </button>
        <button type="button" onClick={() => navigate('/admin/posts')} disabled={loading}>
            Cancel
        </button>
      </form>        
    </div>
  )
}

export default PostForm