import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import { Loader2, X } from 'lucide-react';
import { imageApi } from '@/lib/image-api';
import { useCreatePost, useUpdatePost, usePost } from './posts-api';
import { useAuth } from '@/lib/auth-context';
import { EditorJSRenderer } from './components/EditorJSRenderer';
import GoalCompletedModal from '@/components/GoalCompletedModal';

const DRAFT_KEY_PREFIX = 'post-draft-';

export default function PostEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const isEditMode = !!id;
  
  // Fetch existing post if editing
  const { data: existingPost, isLoading: loadingPost } = usePost(Number(id) || 0);
  
  const editorRef = useRef<EditorJS | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const titleRef = useRef<string>('');
  const isInitializedRef = useRef(false);
  
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('');
  const [showGoalCompletedModal, setShowGoalCompletedModal] = useState(false);
  const [completedGoalData, setCompletedGoalData] = useState<{ title: string; targetDays: number } | null>(null);

  // Get goalId from URL params
  useEffect(() => {
    const goalIdParam = searchParams.get('goalId');
    if (goalIdParam) {
      setSelectedGoalId(parseInt(goalIdParam, 10));
    } else if (!id) {
      // If creating new post without goalId, redirect back to dashboard
      navigate('/dashboard');
    }
  }, [searchParams, id, navigate]);

  // Load existing post data when editing
  useEffect(() => {
    if (isEditMode && existingPost && !isInitializedRef.current) {
      setTitle(existingPost.title);
      titleRef.current = existingPost.title;
      setSelectedGoalId(existingPost.goalId || null);
      setFeaturedImage(existingPost.featuredImage || '');
      setFeaturedImagePreview(existingPost.featuredImage || '');
    }
  }, [isEditMode, existingPost]);

  // Get draft key based on post ID or new post
  const getDraftKey = useCallback(() => {
    return `${DRAFT_KEY_PREFIX}${id || 'new'}-${user?.username}`;
  }, [id, user?.username]);

  // Load draft from localStorage or existing post
  const loadDraft = useCallback(() => {
    // If editing mode, use existing post content
    if (isEditMode && existingPost) {
      return existingPost.content;
    }
    
    // Otherwise, check for draft in localStorage
    const draftKey = getDraftKey();
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const loadedTitle = draft.title || '';
        setTitle(loadedTitle);
        titleRef.current = loadedTitle;
        return draft.content;
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
    return null;
  }, [getDraftKey, isEditMode, existingPost]);

  // Save draft to localStorage
  const saveDraft = useCallback(async () => {
    if (!editorRef.current) return false;
    
    try {
      const content = await editorRef.current.save();
      const draft = { 
        title: titleRef.current, 
        content, 
        goalId: selectedGoalId,
        savedAt: new Date().toISOString() 
      };
      localStorage.setItem(getDraftKey(), JSON.stringify(draft));
      setLastSaved(new Date());
      return true;
    } catch (e) {
      console.error('Failed to save draft:', e);
      return false;
    }
  }, [getDraftKey, selectedGoalId]);

  // Auto-save every 10 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (!previewMode && editorRef.current && isInitializedRef.current) {
        setIsAutoSaving(true);
        await saveDraft();
        setIsAutoSaving(false);
      }
    }, 10000); // Auto-save every 10 seconds

    return () => clearInterval(autoSaveInterval);
  }, [previewMode, saveDraft]);

  // Calculate word and character count
  const updateWordCount = useCallback(async () => {
    if (!editorRef.current) return;
    
    try {
      const content = await editorRef.current.save();
      let text = titleRef.current + ' ';
      
      content.blocks.forEach((block: any) => {
        if (block.type === 'paragraph' || block.type === 'header') {
          text += block.data.text + ' ';
        } else if (block.type === 'list') {
          text += block.data.items.join(' ') + ' ';
        } else if (block.type === 'quote') {
          text += block.data.text + ' ' + (block.data.caption || '') + ' ';
        }
      });
      
      // Remove HTML tags
      text = text.replace(/<[^>]*>/g, '');
      
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      setWordCount(words.length);
      setCharCount(text.trim().length);
    } catch (e) {
      console.error('Failed to calculate word count:', e);
    }
  }, [title]);

  // Show toast notification
  const showToast = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    const toast = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-yellow-500';
    toast.className = `fixed top-20 right-6 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out`;
    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="text-lg">${type === 'error' ? '❌' : type === 'success' ? '✅' : '⚠️'}</span>
        <span class="font-medium">${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.style.transform = 'translateX(0)', 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(400px)';
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 4000);
  };

  // Validation before publish
  const validatePost = useCallback(async (): Promise<string | null> => {
    if (!titleRef.current.trim()) {
      return 'Please add a title for your post';
    }
    
    if (titleRef.current.length < 3) {
      return 'Title is too short - try adding a few more characters';
    }
    
    if (titleRef.current.length > 200) {
      return 'Title is too long - please keep it under 200 characters';
    }

    if (editorRef.current) {
      try {
        const content = await editorRef.current.save();
        if (!content.blocks || content.blocks.length === 0) {
          return 'Your post is empty - start writing something!';
        }
        
        const hasContent = content.blocks.some((block: any) => {
          if (block.type === 'paragraph' || block.type === 'header') {
            return block.data.text && block.data.text.trim().length > 0;
          }
          return true;
        });
        
        if (!hasContent) {
          return 'Add some content to your post before publishing';
        }
      } catch (e) {
        return 'Something went wrong - please try again';
      }
    }

    if (wordCount < 10) {
      return `Write at least ${10 - wordCount} more ${10 - wordCount === 1 ? 'word' : 'words'} (${wordCount}/10 words)`;
    }

    return null;

    return errors;
  }, [wordCount]);

  // Initialize Editor.js
  useEffect(() => {
    // Wait for existing post to load if in edit mode
    if (isEditMode && !existingPost) {
      return;
    }
    
    if (!editorRef.current && !isInitializedRef.current) {
      isInitializedRef.current = true;
      const draftContent = loadDraft();
      
      const editor = new EditorJS({
        holder: 'editorjs',
        placeholder: 'Tell your story...',
        minHeight: 300,
        tools: {
          header: {
            class: Header as any,
            config: {
              levels: [1, 2, 3],
              defaultLevel: 2,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
          },
          delimiter: Delimiter,
          image: {
            class: class ImageTool {
              static get toolbox() {
                return {
                  title: 'Image',
                  icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
                };
              }

              constructor({ data }: { data: any }) {
                this.data = data || { url: '', caption: '', width: '100%' };
                this.wrapper = undefined;
              }

              data: any;
              wrapper: any;

              render() {
                const wrapper = document.createElement('div');
                wrapper.classList.add('image-tool');

                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.style.display = 'none';

                const button = document.createElement('button');
                button.type = 'button';
                button.innerHTML = '📷 Select an image';
                button.classList.add('image-tool-button');
                button.style.cssText = 'padding: 12px 24px; background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; cursor: pointer; width: 100%; transition: all 0.2s;';

                const uploadingMsg = document.createElement('div');
                uploadingMsg.textContent = '⏳ Uploading...';
                uploadingMsg.style.cssText = 'display: none; padding: 12px; background: #dbeafe; color: #1e40af; border-radius: 8px; text-align: center;';

                const errorMsg = document.createElement('div');
                errorMsg.style.cssText = 'display: none; padding: 12px; background: #fee2e2; color: #991b1b; border-radius: 8px; margin-top: 8px; text-align: center;';

                const imageContainer = document.createElement('div');
                imageContainer.style.cssText = 'position: relative; display: none;';

                const img = document.createElement('img');
                img.style.cssText = 'max-width: 100%; height: auto; border-radius: 8px; display: block;';
                
                // Size controls
                const sizeControls = document.createElement('div');
                sizeControls.style.cssText = 'display: flex; gap: 8px; margin-top: 8px; justify-content: center;';
                
                const sizes = [
                  { label: 'Small', value: '50%' },
                  { label: 'Medium', value: '75%' },
                  { label: 'Large', value: '100%' }
                ];
                
                sizes.forEach(size => {
                  const btn = document.createElement('button');
                  btn.textContent = size.label;
                  btn.type = 'button';
                  
                  const isActive = size.value === (this.data.width || '100%');
                  
                  if (isActive) {
                    btn.style.cssText = 'padding: 4px 12px; font-size: 12px; border: 1px solid #10b981; border-radius: 4px; background: #10b981; color: white; cursor: pointer; transition: all 0.2s;';
                  } else {
                    btn.style.cssText = 'padding: 4px 12px; font-size: 12px; border: 1px solid #d1d5db; border-radius: 4px; background: white; color: #374151; cursor: pointer; transition: all 0.2s;';
                  }
                  
                  // Hover effects
                  btn.addEventListener('mouseenter', () => {
                    if (this.data.width !== size.value) {
                      btn.style.background = '#f3f4f6';
                      btn.style.borderColor = '#9ca3af';
                    }
                  });
                  
                  btn.addEventListener('mouseleave', () => {
                    if (this.data.width !== size.value) {
                      btn.style.background = 'white';
                      btn.style.borderColor = '#d1d5db';
                    }
                  });
                  
                  btn.addEventListener('click', () => {
                    this.data.width = size.value;
                    img.style.width = size.value;
                    // Update all buttons
                    sizeControls.querySelectorAll('button').forEach((b: any) => {
                      b.style.background = 'white';
                      b.style.borderColor = '#d1d5db';
                      b.style.color = '#374151';
                    });
                    btn.style.background = '#10b981';
                    btn.style.borderColor = '#10b981';
                    btn.style.color = 'white';
                  });
                  
                  sizeControls.appendChild(btn);
                });

                const caption = document.createElement('input');
                caption.placeholder = 'Add a caption...';
                caption.classList.add('image-tool-caption');
                caption.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; margin-top: 8px;';

                if (this.data && this.data.url) {
                  img.src = this.data.url;
                  img.style.width = this.data.width || '100%';
                  imageContainer.style.display = 'block';
                  caption.value = this.data.caption || '';
                  button.style.display = 'none';
                }

                button.addEventListener('mouseenter', () => {
                  button.style.background = '#e5e7eb';
                  button.style.borderColor = '#9ca3af';
                });

                button.addEventListener('mouseleave', () => {
                  button.style.background = '#f3f4f6';
                  button.style.borderColor = '#d1d5db';
                });

                button.addEventListener('click', () => {
                  input.click();
                });

                input.addEventListener('change', async (e: any) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  // Validate file size (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    errorMsg.textContent = '❌ File too large. Maximum size is 5MB.';
                    errorMsg.style.display = 'block';
                    setTimeout(() => errorMsg.style.display = 'none', 5000);
                    return;
                  }

                  // Validate file type
                  if (!file.type.startsWith('image/')) {
                    errorMsg.textContent = '❌ Invalid file type. Please upload an image.';
                    errorMsg.style.display = 'block';
                    setTimeout(() => errorMsg.style.display = 'none', 5000);
                    return;
                  }

                  button.style.display = 'none';
                  uploadingMsg.style.display = 'block';
                  errorMsg.style.display = 'none';
                  
                  try {
                    const response = await imageApi.uploadImage(file);
                    
                    // Extract URL from response
                    let imageUrl = null;
                    if (response && response.file && response.file.url) {
                      imageUrl = response.file.url;
                    } else if (response && response.url) {
                      imageUrl = response.url;
                    }
                    
                    if (!imageUrl) {
                      throw new Error('No URL in response');
                    }
                    
                    this.data = { url: imageUrl, caption: '', width: '100%' };
                    img.src = imageUrl;
                    img.style.width = '100%';
                    imageContainer.style.display = 'block';
                    uploadingMsg.style.display = 'none';
                  } catch (error) {
                    console.error('Upload error:', error);
                    uploadingMsg.style.display = 'none';
                    button.style.display = 'block';
                    errorMsg.textContent = `❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    errorMsg.style.display = 'block';
                    setTimeout(() => errorMsg.style.display = 'none', 5000);
                  }
                });

                caption.addEventListener('input', (e: any) => {
                  this.data.caption = e.target.value;
                });

                wrapper.appendChild(input);
                wrapper.appendChild(button);
                wrapper.appendChild(uploadingMsg);
                wrapper.appendChild(errorMsg);
                imageContainer.appendChild(img);
                imageContainer.appendChild(sizeControls);
                imageContainer.appendChild(caption);
                wrapper.appendChild(imageContainer);

                this.wrapper = wrapper;
                return wrapper;
              }

              save() {
                return this.data;
              }
            },
          },
        },
        data: draftContent || { blocks: [] },
        onChange: () => {
          updateWordCount();
        },
      });

      editorRef.current = editor;
    }
  }, [loadDraft, updateWordCount, isEditMode, existingPost]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        try {
          editorRef.current.destroy();
        } catch (e) {
          console.log('Editor already destroyed');
        }
        editorRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  // Toggle preview mode
  const handlePreview = useCallback(async () => {
    if (!previewMode && editorRef.current) {
      const content = await editorRef.current.save();
      setPreviewContent(content);
    }
    setPreviewMode(!previewMode);
  }, [previewMode]);

  // Handle publish with validation
  const handlePublish = async () => {
    // Validate goalId exists for new posts
    if (!id && !selectedGoalId) {
      showToast('No goal selected. Please select a goal to write for.', 'warning');
      return;
    }

    // Validate first
    const validationError = await validatePost();
    
    if (validationError) {
      showToast(validationError, 'warning');
      return;
    }

    if (!editorRef.current) return;

    setIsSaving(true);
    setError('');
    setImageError('');
    
    try {
      const outputData = await editorRef.current.save();
      
      if (isEditMode && id) {
        // Update existing post
        await updatePostMutation.mutateAsync({
          id: Number(id),
          data: {
            title: titleRef.current,
            content: JSON.stringify(outputData),
            featuredImage: featuredImage || undefined,
          },
        });
        
        // Clear draft after successful update
        localStorage.removeItem(getDraftKey());
        navigate(`/posts/${id}`);
      } else {
        // Create new post
        const createdPost = await createPostMutation.mutateAsync({
          goalId: selectedGoalId!,
          title: titleRef.current,
          content: outputData,
          isPublished: true,
          featuredImage: featuredImage || undefined,
        });

        console.log('Post created successfully:', createdPost);
        
        // Clear draft after successful publish
        localStorage.removeItem(getDraftKey());

        // Force immediate invalidation of all goal and dashboard data
        console.log('Invalidating queries...');
        await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        await queryClient.invalidateQueries({ queryKey: ['goals'] });
        await queryClient.invalidateQueries({ queryKey: ['goal'] });
        
        // Wait for backend to complete streak update
        console.log('Waiting for backend streak update...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch updated goal to check if it was completed
        const updatedDashboard = await queryClient.fetchQuery({ 
          queryKey: ['dashboard', user?.username],
          queryFn: async () => {
            const response = await fetch(`http://localhost:8080/api/goals/dashboard/${user?.username}`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return response.json();
          }
        });
        
        // Check if the goal was just completed (moved to completed goals)
        const wasCompleted = updatedDashboard.completedGoals?.some((g: any) => g.id === selectedGoalId);
        const completedGoal = updatedDashboard.completedGoals?.find((g: any) => g.id === selectedGoalId);
        
        if (wasCompleted && completedGoal) {
          console.log('Goal completed! Showing celebration modal...');
          setCompletedGoalData({
            title: completedGoal.title,
            targetDays: completedGoal.targetDays
          });
          setShowGoalCompletedModal(true);
          // Don't navigate yet - wait for modal close
        } else {
          console.log('Navigating to dashboard...');
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error: any) {
      console.error('Publishing failed:', error);
      const errorMsg = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'publish'} post. ${!isEditMode ? 'Make sure you have an active goal!' : ''}`;
      showToast(errorMsg, 'error');
      setIsSaving(false);
    }
  };

  // Handle save draft manually
  const handleSaveDraft = async () => {
    if (!titleRef.current.trim() && editorRef.current) {
      const content = await editorRef.current.save();
      if (!content.blocks || content.blocks.length === 0) {
        alert('Nothing to save - add some content first');
        return;
      }
    }
    
    setIsAutoSaving(true);
    const success = await saveDraft();
    setIsAutoSaving(false);
    
    if (success) {
      // Show success feedback
      const savedMsg = document.createElement('div');
      savedMsg.textContent = '✓ Draft saved!';
      savedMsg.className = 'fixed top-20 right-8 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      document.body.appendChild(savedMsg);
      setTimeout(() => savedMsg.remove(), 2000);
    }
  };

  // Clear draft
  const handleClearDraft = () => {
    if (confirm('Are you sure you want to clear this draft? This cannot be undone.')) {
      localStorage.removeItem(getDraftKey());
      setTitle('');
      if (editorRef.current) {
        editorRef.current.clear();
      }
      setLastSaved(null);
      setWordCount(0);
      setCharCount(0);
    }
  };

  // Handle featured image upload
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size should be less than 5MB');
      return;
    }

    setUploadingFeatured(true);
    setImageError('');

    try {
      const response = await imageApi.uploadImage(file);
      console.log('Featured image upload response:', response);
      // Backend returns { url: "..." } directly, not wrapped in file object
      const imageUrl = response.url || (response as any).file?.url;
      console.log('Featured image URL:', imageUrl);
      setFeaturedImage(imageUrl);
      setFeaturedImagePreview(URL.createObjectURL(file));
    } catch (error: any) {
      console.error('Failed to upload featured image:', error);
      setImageError(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploadingFeatured(false);
    }
  };

  // Format last saved time
  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diff < 60) return 'Saved just now';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    return `Saved ${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading state when fetching post */}
      {loadingPost && isEditMode ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading post...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Editor Header */}
      <header className="border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="w-full">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
            {/* Left: Back Button & Title */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <span className="text-xs sm:text-sm text-gray-800 font-medium truncate max-w-[120px] sm:max-w-none">
                {title || 'Untitled Story'}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Word/Character Count */}
              <div className="text-xs text-gray-500 hidden md:flex items-center space-x-2">
                <span>{wordCount} words</span>
                <span className="text-gray-300">•</span>
                <span>{charCount} chars</span>
              </div>

              {/* Auto-save Status */}
              {isAutoSaving && (
                <span className="text-xs text-blue-600 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              )}
              {!isAutoSaving && lastSaved && (
                <span className="text-xs text-gray-400">{getLastSavedText()}</span>
              )}

              {/* Preview Toggle */}
              <button
                onClick={handlePreview}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                {previewMode ? '✏️' : '👁️'}
                <span className="hidden sm:inline ml-1">{previewMode ? 'Edit' : 'Preview'}</span>
              </button>

              {/* Save Draft Button */}
              <button
                onClick={handleSaveDraft}
                disabled={isAutoSaving}
                className="hidden sm:inline-flex px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAutoSaving ? 'Saving...' : '💾 Save Draft'}
              </button>

              {/* Publish Button */}
              <button
                onClick={handlePublish}
                disabled={isSaving}
                className={`px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white rounded-lg transition-all shadow-md hover:shadow-lg ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary-500 hover:bg-primary-600'
                }`}
              >
                {isSaving ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update' : 'Publish')}
              </button>
              
              <button 
                onClick={() => navigate(`/profile/${user?.username}`)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                title="View Profile"
              >
                <span className="text-white font-semibold text-xs">{user?.username?.[0].toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Draft Actions */}
            {lastSaved && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  📝 Draft saved - {getLastSavedText()}
                </span>
                <button
                  onClick={handleClearDraft}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Clear Draft
                </button>
              </div>
            )}

            {!previewMode ? (
              <>
                {/* Title Input */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setTitle(newTitle);
                    titleRef.current = newTitle;
                  }}
                  placeholder="Title"
                  maxLength={200}
                  className="w-full text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-800 placeholder:text-gray-300 outline-none mb-6 sm:mb-8 border-none focus:ring-0 bg-transparent"
                />

                {/* Editor.js Container */}
                <div id="editorjs" className="prose prose-lg max-w-none"></div>

                {/* Featured Image Upload Section */}
                <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-gray-200">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Featured Image</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    Add a cover image for your post. This will be displayed in post previews. (Optional)
                  </p>
                  
                  <div className="flex items-start gap-6">
                    {featuredImagePreview || featuredImage ? (
                      <div className="relative group">
                        <img
                          src={featuredImagePreview || featuredImage}
                          alt="Featured"
                          className="w-64 h-40 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          onClick={() => {
                            setFeaturedImage('');
                            setFeaturedImagePreview('');
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-64 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#10B981] hover:bg-green-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFeaturedImageUpload}
                          disabled={uploadingFeatured}
                          className="hidden"
                        />
                        {uploadingFeatured ? (
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Uploading...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-gray-600 font-medium">Click to upload</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </label>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Preview Mode */}
                <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
                  <p className="text-sm text-amber-800">
                    📖 <strong>Preview Mode</strong> - This is how your post will appear to readers
                  </p>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-800 mb-8 sm:mb-10">
                  {title || 'Untitled Story'}
                </h1>

                {(featuredImagePreview || featuredImage) && (
                  <img
                    src={featuredImagePreview || featuredImage}
                    alt="Featured"
                    className="w-full h-80 object-cover rounded-xl mb-10"
                  />
                )}

                {previewContent && <EditorJSRenderer content={previewContent} />}
              </>
            )}
          </div>
        </div>
      </main>
      </>
      )}

      {/* Goal Completed Modal */}
      {completedGoalData && (
        <GoalCompletedModal
          isOpen={showGoalCompletedModal}
          goalTitle={completedGoalData.title}
          targetDays={completedGoalData.targetDays}
          onClose={() => {
            setShowGoalCompletedModal(false);
            navigate('/dashboard', { replace: true });
          }}
        />
      )}
    </div>
  );
}
