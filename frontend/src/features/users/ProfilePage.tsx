import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentProfile, useUpdateProfile, useUpdateProfilePicture, useDeleteAccount } from './use-user';
import { useAuth } from '@/lib/auth-context';
import { Globe, Github, Twitter, Linkedin, User, AlertCircle, Loader2, Check, X, Camera, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: profile, isLoading, error } = useCurrentProfile();
  const updateProfileMutation = useUpdateProfile();
  const updatePictureMutation = useUpdateProfilePicture();
  const deleteAccount = useDeleteAccount();

  // Form state
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    bio: profile?.bio || '',
    websiteUrl: profile?.websiteUrl || '',
    githubUsername: profile?.githubUsername || '',
    twitterUsername: profile?.twitterUsername || '',
    linkedinUrl: profile?.linkedinUrl || '',
  });

  // Popup states
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Profile picture upload state
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        websiteUrl: profile.websiteUrl || '',
        githubUsername: profile.githubUsername || '',
        twitterUsername: profile.twitterUsername || '',
        linkedinUrl: profile.linkedinUrl || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync(formData);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        websiteUrl: profile.websiteUrl || '',
        githubUsername: profile.githubUsername || '',
        twitterUsername: profile.twitterUsername || '',
        linkedinUrl: profile.linkedinUrl || '',
      });
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must not exceed 5MB');
      setTimeout(() => setUploadError(''), 5000);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      setTimeout(() => setUploadError(''), 5000);
      return;
    }

    setUploadingPicture(true);
    setUploadError('');

    try {
      await updatePictureMutation.mutateAsync(file);
    } catch (error: any) {
      setUploadError(error.response?.data?.error || 'Failed to upload profile picture');
      setTimeout(() => setUploadError(''), 5000);
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== 'delete') {
      setUploadError('Please type "delete" to confirm');
      return;
    }

    try {
      await deleteAccount.mutateAsync();
      logout();
      navigate('/register');
    } catch (error: any) {
      setUploadError(error.response?.data?.message || 'Failed to delete account');
      setShowDeleteModal(false);
    }
  };

  const getProfilePictureUrl = () => {
    return profile?.profilePictureUrl || null;
  };

  const bioLength = formData.bio.length;
  const bioMaxLength = 1000;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Header />
      <main className="max-w-[1400px] mx-auto py-8 sm:py-12 px-4 sm:px-6 pb-20 sm:pb-24">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Edit Profile
          </h1>
          <p className="text-gray-600">
            Manage your public presence and gamified habit identity.
          </p>
        </div>

        {/* Profile Picture Section */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-6 sm:p-8 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Profile Picture
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">JPG, GIF, or PNG. Max size of 5MB. Click on the photo to upload.</p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <label className="relative group cursor-pointer">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-[#10B981] transition-colors">
                {getProfilePictureUrl() ? (
                  <img 
                    src={getProfilePictureUrl()!} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg pointer-events-none">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                disabled={uploadingPicture}
                className="hidden"
              />
            </label>
            
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                Click on the photo to upload a new image
              </p>
              {uploadingPicture && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </p>
              )}
              {uploadError && (
                <p className="text-sm text-red-600">{uploadError}</p>
              )}
              {updatePictureMutation.isSuccess && !uploadError && !uploadingPicture && (
                <p className="text-sm text-[#10B981] flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Profile picture updated successfully
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-6 sm:p-8 mb-4 sm:mb-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Alex Rivera"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">@</span>
                  <input
                    type="text"
                    value={profile?.username || ''}
                    disabled
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                maxLength={bioMaxLength}
                placeholder="Blogging my way to a 365-day meditation streak. Coffee enthusiast and product designer."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent resize-none transition-all"
              />
              <div className="flex justify-end mt-2">
                <span className={`text-xs font-medium ${bioLength > bioMaxLength * 0.9 ? 'text-red-600' : 'text-gray-500'}`}>
                  {bioLength} / {bioMaxLength}
                </span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Social Links
            </h3>

            <div className="space-y-4">
              {/* Website */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 text-[#10B981]" />
                  Website
                </label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="https://alexrivera.me"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                />
              </div>

              {/* GitHub */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Github className="w-4 h-4 text-[#10B981]" />
                  GitHub Username
                </label>
                <input
                  type="text"
                  name="githubUsername"
                  value={formData.githubUsername}
                  onChange={handleInputChange}
                  placeholder="arivera-dev"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                />
              </div>

              {/* Twitter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Twitter className="w-4 h-4 text-[#10B981]" />
                  Twitter Username
                </label>
                <input
                  type="text"
                  name="twitterUsername"
                  value={formData.twitterUsername}
                  onChange={handleInputChange}
                  placeholder="@arivera_builds"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Linkedin className="w-4 h-4 text-[#10B981]" />
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/alexrivera"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Account Stats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(profile?.createdAt || '').toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-lg font-semibold text-[#10B981]">42 Days 🔥</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={updateProfileMutation.isPending}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-6 py-3 text-sm font-medium text-white bg-[#10B981] rounded-lg hover:bg-[#059669] disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Success/Error Messages */}
          {updateProfileMutation.isSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Profile updated successfully!
              </p>
            </div>
          )}
          {updateProfileMutation.isError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <X className="w-4 h-4" />
                Failed to update profile. Please try again.
              </p>
            </div>
          )}
        </form>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border-2 border-red-200 p-8">
          <h3 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <AlertTriangle className="w-6 h-6" />
            Danger Zone
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Once you delete your account, there is no going back. Your 42-day streak, all published posts, and followers will be permanently removed.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200 shadow-2xl">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Logout?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to logout? You'll need to login again to access your account.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200 shadow-2xl">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation('');
                setUploadError('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Delete Account?
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete your account? This action cannot be undone. You will lose your current{' '}
                <span className="font-semibold text-[#10B981]">42-day streak</span>, all published posts, and your followers.
              </p>
              <p className="text-sm text-gray-700 font-medium mb-3">
                To confirm, please type <span className="font-bold px-2 py-1 bg-gray-100 rounded">delete</span> below:
              </p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => {
                  setDeleteConfirmation(e.target.value);
                  setUploadError('');
                }}
                placeholder="delete"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              {uploadError && deleteConfirmation && (
                <p className="mt-3 text-sm text-red-600 font-medium">{uploadError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                  setUploadError('');
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccount.isPending || deleteConfirmation.toLowerCase() !== 'delete'}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {deleteAccount.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
