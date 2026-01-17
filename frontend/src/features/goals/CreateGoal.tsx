import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SuccessModal from '@/components/ui/SuccessModal';
import { useCreateGoal, useGoal } from './use-goals';
import { useAuth } from '@/lib/auth-context';
import { categoriesApi, type GoalCategory } from '@/lib/categories-api';
import { goalsApi } from './goals-api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CreateGoal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const createGoalMutation = useCreateGoal();
  const isEditMode = !!id;
  
  const [streakName, setStreakName] = useState('');
  const [targetDays, setTargetDays] = useState(30);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [motivation, setMotivation] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdGoalId, setCreatedGoalId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<GoalCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing goal if in edit mode
  useEffect(() => {
    if (isEditMode && id && user?.username) {
      setLoading(true);
      goalsApi.getGoalById(parseInt(id), user.username)
        .then((goal) => {
          setStreakName(goal.title);
          setTargetDays(goal.targetDays);
          setCurrentStreak(goal.currentStreak || 0);
          setSelectedCategory(goal.category?.id || null);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load goal:', error);
          setError('Failed to load goal data');
          setLoading(false);
        });
    }
  }, [isEditMode, id, user?.username]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getGoalCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load goal categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!streakName.trim()) {
      setError('Please enter a goal name');
      return;
    }

    if (targetDays <= 0) {
      setError('Please enter a valid number of days');
      return;
    }

    if (!user?.username) {
      setError('User not logged in. Please log in again.');
      return;
    }

    try {
      if (isEditMode && id) {
        // Update existing goal
        const goalData = {
          title: streakName,
          targetDays: targetDays,
          categoryId: selectedCategory,
        };
        
        await goalsApi.updateGoal(parseInt(id), goalData);
        navigate(`/goals/${id}`);
      } else {
        // Create new goal
        const goalData = {
          username: user.username,
          title: streakName,
          targetDays: targetDays,
          currentStreak: currentStreak,
          categoryId: selectedCategory,
        };

        console.log('Creating goal with data:', goalData);
        console.log('Target Days being sent:', targetDays);
        
        const createdGoal = await createGoalMutation.mutateAsync(goalData);
        
        console.log('Goal created successfully:', createdGoal);
        console.log('Created goal target days:', createdGoal.targetDays);
        
        setCreatedGoalId(createdGoal.id);
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      console.error('Goal operation error:', err);
      const errorMessage = err.response?.data?.message || err.message || `Failed to ${isEditMode ? 'update' : 'create'} goal`;
      setError(`Error: ${errorMessage}`);
    }
  };

  const handleStartWriting = () => {
    // Navigate to editor with the newly created goal pre-selected
    if (createdGoalId) {
      navigate(`/posts/new?goalId=${createdGoalId}`);
    } else {
      // Fallback: open goal selection modal
      navigate('/dashboard');
    }
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="py-12 pb-24 flex-1">
        {loading ? (
          <div className="max-w-2xl mx-auto px-6 flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading goal...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
              {error}
            </div>
          )}
          
          {/* Icon */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              {isEditMode ? 'Edit your goal' : 'Define your new habit'}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              {isEditMode ? 'Update your goal details below.' : 'Commit to a writing schedule and track your progress.'}
            </p>
            {!isEditMode && (
              <p className="text-gray-600 text-lg">
                Consistency is the key to mastery.
              </p>
            )}
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            {/* Streak Name */}
            <div className="mb-8">
              <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Streak Name
              </label>
              <input
                type="text"
                value={streakName}
                onChange={(e) => setStreakName(e.target.value)}
                placeholder="e.g., Daily Tech Thoughts"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                required
              />
            </div>

            {/* Category Selection */}
            <div className="mb-8">
              <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Category
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">Select a category (optional)</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Choose a category that best fits your goal
              </p>
            </div>

            {/* Target Days */}
            <div className="mb-8">
              <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Target Days
              </label>
              <input
                type="number"
                min="1"
                value={targetDays}
                onChange={(e) => setTargetDays(parseInt(e.target.value) || 30)}
                placeholder="30"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                How many days do you want to maintain this streak?
              </p>
            </div>

            {/* Current Streak - Only show in create mode */}
            {!isEditMode && (
              <div className="mb-8">
                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Starting Streak Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentStreak}
                  onChange={(e) => setCurrentStreak(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter your current streak count if continuing an existing goal (default: 0)
                </p>
              </div>
            )}

            {/* Motivation */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Motivation
                </label>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="I want to write about frontend development to improve my skills and document my learning journey..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-gray-400"
              />
            </div>

            {/* Info Box */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Did you know?</h4>
                  <p className="text-sm text-gray-700">
                    Users who set a specific goal are 40% more likely to maintain a 30-day streak.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => isEditMode ? navigate(`/goals/${id}`) : navigate('/dashboard')}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createGoalMutation.isPending || loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all flex items-center space-x-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createGoalMutation.isPending || loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{isEditMode ? 'Update Goal' : 'Start Streak'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        )}
      </main>

      {/* Success Modal - Only show in create mode */}
      {!isEditMode && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          streakName={streakName}
          onStartWriting={handleStartWriting}
          onViewDashboard={handleViewDashboard}
        />
      )}
      <Footer />
    </div>
  );
}
