// src/components/PostForm.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { AuthContext } from './AuthContext';
import axios from 'axios'; // Ensure axios is imported for direct calls like image upload
import api from './Api'; // Use your configured axios instance for post CRUD
import '../App.css'

function WriterPostForm() {
  const { id } = useParams(); // Get ID from URL for editing
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useContext(AuthContext); // Get user from context

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState(''); // For the URL of the main image
const [mainImageFile, setMainImageFile] = useState(null); // For the actual file to upload
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false); // For form submission and initial fetch
  const [error, setError] = useState(null);

  const categories = ['Science', 'Business', 'Technology', 'Health', 'Sports', 'Opinion', 'Other'];
  const isEditMode = !!id; // True if 'id' param exists
  const TOOLBAR_LABELS = {
  'ql-bold': 'Bold',
  'ql-italic': 'Italic',
  'ql-underline': 'Underline',
  'ql-strike': 'Strikethrough',
  'ql-blockquote': 'Blockquote',
  'ql-list': { 'ordered': 'Ordered List', 'bullet': 'Bullet List' },
  'ql-indent': { '-1': 'Decrease Indent', '+1': 'Increase Indent' },
  'ql-link': 'Insert Link',
  'ql-image': 'Insert Image',
  'ql-video': 'Insert Video (YouTube/Vimeo URL)',
  'ql-header': { '1': 'Heading 1', '2': 'Heading 2', 'false': 'Paragraph (Normal)' },
  'ql-clean': 'Remove Formatting',
  'ql-align': { 
    'left': 'Left Align', 
    'center': 'Center Align', 
    'right': 'Right Align', 
    'justify': 'Justify' 
  },
};
useEffect(() => {
  const addTooltips = () => {
    const toolbar = document.querySelector('.ql-toolbar');
    if (!toolbar) return;

    // Handle Buttons
    const buttons = toolbar.querySelectorAll('button');
    buttons.forEach(btn => {
      const className = Array.from(btn.classList).find(c => TOOLBAR_LABELS[c]);
       if (className) {
        let value = btn.value;

        // SPECIFIC FIX FOR ALIGN LEFT:
        // If it's an align button and the value is empty, set it to 'left'
        if (className === 'ql-align' && !value) {
          value = 'left';
        }

        const label = typeof TOOLBAR_LABELS[className] === 'object' 
                      ? TOOLBAR_LABELS[className][value || 'false'] 
                      : TOOLBAR_LABELS[className];
        
        if (label) btn.setAttribute('title', label);
      }
    });

    // Handle Dropdowns (Pickers)
    const pickers = toolbar.querySelectorAll('.ql-picker');
    pickers.forEach(picker => {
      const className = Array.from(picker.classList).find(c => TOOLBAR_LABELS[c]);
      if (className) {
        const label = TOOLBAR_LABELS[className]['1'] || 'Format';
        picker.setAttribute('title', label);
      }
    });
  };

  // Small delay to ensure Quill has finished rendering the toolbar
  const timer = setTimeout(addTooltips, 500);
  return () => clearTimeout(timer);
}, []);

  useEffect(() => {
    if (!isEditMode && !isLoading) {
      const savedDraft = localStorage.getItem('herald_sphere_draft');
      if (savedDraft) {
        try {
          const { dTitle, dContent, dCategory, dCustom } = JSON.parse(savedDraft);
          // Only offer restore if there's actual content
          if (dTitle || dContent) {
            if (window.confirm("Found an unsaved draft. Would you like to restore it?")) {
              setTitle(dTitle || '');
              setContent(dContent || '');
              setCategory(dCategory || '');
              setCustomCategory(dCustom || '');
            } else {
              localStorage.removeItem('herald_sphere_draft');
            }
          }
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [isEditMode, isLoading]);

  // --- 2. AUTO-SAVE LOGIC (Whenever content changes) ---
  useEffect(() => {
    if (!isEditMode && (title || content || category || customCategory)) {
      const draft = {
        dTitle: title,
        dContent: content,
        dCategory: category,
        dCustom: customCategory
      };
      localStorage.setItem('herald_sphere_draft', JSON.stringify(draft));
    }
  }, [title, content, category, customCategory, isEditMode]);

  

  // --- Initial Fetch for Edit Mode ---
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isEditMode && !isLoading && isAuthenticated && user) {
      setIsEditing(true);
      setLoading(true);
      setError(null);
      api.get(`/api/posts/${id}`)
        .then(response => {
          const post = response.data;
          if (user.role === 'user' && post.author !== user._id) {
            setError("You are not authorized to edit this post.");
            navigate('/my-posts');
            return;
          }

          if (categories.includes(post.category)) {
            setCategory(post.category);
          } else {
            setCategory('Other');
            setCustomCategory(post.category);
          }
          setTitle(post.title);
          setContent(post.content);
          setMainImageUrl(post.mainImageUrl || '');
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Failed to fetch post.');
          if (err.response?.status === 404 || err.response?.status === 403) {
            navigate(user.role === 'admin' ? '/admin/posts' : '/my-posts');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode, navigate, user, isAuthenticated, isLoading]);


  // --- ReactQuill Modules and Image Handler ---
  const modules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' },  
           { 'indent': '-1' }, { 'indent': '+1' }],
           [{ 'align': '' },
           { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
        ['link', 'image', 'video'],
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
                  headers: { 'Content-Type': 'multipart/form-data', 
                    'Authorization': `Bearer ${token}`
                     },
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

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalCategory = category === 'Other' ? customCategory : category;

    if (!title || !content || !finalCategory) {
      setError('Please fill in all fields (Title, Content, and Category).');
      setLoading(false);
      return;
    }

    let finalMainImageUrl = mainImageUrl;

    if (mainImageFile) {
      const formData = new FormData();
      formData.append('image', mainImageFile);
      try {
        const response = await api.post('/api/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        finalMainImageUrl = response.data.imageUrl;
      } catch (uploadError) {
        setError('Featured image upload failed.');
        setLoading(false);
        return;
      }
    }

    const postData = {
      title,
      content,
      category: finalCategory, // Corrected to use finalCategory
      mainImageUrl: finalMainImageUrl,
    };

    try {
      if (isEditMode) {
        await api.put(`/api/posts/${id}`, postData);
      } else {
        await api.post('/api/posts', postData);
        // --- 3. CLEAR DRAFT ON SUCCESS ---
        localStorage.removeItem('herald_sphere_draft');
      }
      navigate(user.role === 'admin' ? '/admin/posts' : '/my-posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit post.');
    } finally {
      setLoading(false);
    }
  };


  // --- Render Logic ---
  if (isLoading) return <div>Loading user authentication...</div>; // Show loading for AuthContext
  if (!isAuthenticated) return <Navigate to="/login" replace />; // Should be handled by ProtectedRoute
  if (loading && isEditMode) return <div>Loading post for editing...</div>; // For initial data fetch for edit
  // If not editing, and is just loading submission
  if (loading && !isEditMode) return <div>Submitting post...</div>;

  const formTitle = isEditMode
    ? (user?.role === 'admin' ? 'Edit Any Post' : 'Edit Your Post')
    : (user?.role === 'admin' ? 'Create New Post (Admin)' : 'Submit New Post');

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className='text-4xl text-slate-900 font-black mb-10 tracking-tight'>{formTitle}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title Input */}
        <div className="form-group flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500" htmlFor="title">Post Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold border-b-2 border-slate-200 focus:border-indigo-500 outline-none pb-2 transition-colors"
            placeholder="Enter title here..."
            required
          />
        </div>

        {/* Category Select */}
        <div className="form-group flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2" htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              <option value="">Select a Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {category === 'Other' && (
            <div className="flex-1 w-full animate-in slide-in-from-left duration-300">
               <label className="text-[10px] font-bold uppercase text-indigo-600 block mb-2">Custom Category Name</label>
              <input
                type="text"
                placeholder="Type category..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full p-3 border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          )}
        </div>

        {/* Quill Editor */}
        <div className="form-group flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500" htmlFor="content">Article Content</label>
          <ReactQuill
            value={content}
            onChange={setContent}
            modules={modules}
            theme="snow"
            placeholder="Write your article..."
            className="quill-editor bg-white rounded-xl overflow-hidden border border-slate-200"
          />
        </div>

        {/* Featured Image Styled Section */}
        <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
           <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-4">Featured Image</label>
           <div className="flex flex-col items-center gap-4">
              <label className="w-full h-32 border-2 border-dotted border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition">
                 <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                 <span className="text-sm text-slate-500">{mainImageFile ? mainImageFile.name : "Click to select featured image"}</span>
                 <input type="file" className="hidden" accept="image/*" onChange={(e) => { setMainImageFile(e.target.files[0]); setMainImageUrl(''); }} />
              </label>

              {(mainImageUrl || mainImageFile) && (
                <div className="relative mt-4">
                  <img src={mainImageUrl || URL.createObjectURL(mainImageFile)} className="h-48 w-80 object-cover rounded-xl shadow-lg border-4 border-white" alt="Preview" />
                  <button type="button" onClick={() => { setMainImageUrl(''); setMainImageFile(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              )}
           </div>
        </div>

        {/* Action Buttons & Save Indicator */}
        {error && <p className="text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100">Error: {error}</p>}
        
        <div className="flex flex-col md:flex-row items-center gap-6 pt-6">
          <button 
            type="submit" 
            disabled={loading}
            className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:bg-slate-400"
          >
            {loading ? 'Processing...' : (isEditMode ? 'Update Dispatch' : 'Publish Article')}
          </button>
          
          <button
            type="button"
            onClick={() => navigate(user?.role === 'admin' ? '/admin/posts' : '/my-posts')}
            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
          >
            Discard
          </button>

          {/* 4. AUTO-SAVE INDICATOR */}
          {!isEditMode && (
            <div className="flex items-center gap-2 ml-auto">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Draft Auto-Saved</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default WriterPostForm;