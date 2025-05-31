'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface SaveButtonProps {
  projectId: string;
  initialSaved?: boolean;
  size?: 'sm' | 'md';
  variant?: 'ghost' | 'default';
}

export default function SaveButton({ 
  projectId, 
  initialSaved = false,
  size = 'md',
  variant = 'ghost'
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const checkIfSaved = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('saved_projects')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('project_id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      setIsSaved(!!data);
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  }, [projectId]);

  useEffect(() => {
    checkIfSaved();
  }, [checkIfSaved]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth?tab=login');
        return;
      }

      setIsLoading(true);

      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_projects')
          .delete()
          .eq('user_id', session.user.id)
          .eq('project_id', projectId);

        if (error) throw error;
        setIsSaved(false);
        toast.success('Project removed from saved list');
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_projects')
          .insert({
            user_id: session.user.id,
            project_id: projectId
          });

        if (error) throw error;
        setIsSaved(true);
        toast.success('Project saved successfully');
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      toast.error(isSaved ? 'Failed to remove project' : 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10'
  };

  const variantClasses = {
    ghost: 'hover:bg-red-50 text-gray-600 hover:text-red-600',
    default: 'bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 shadow-sm'
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-full flex items-center justify-center transition-colors
        ${isSaved ? 'text-red-500 hover:text-red-600' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title={isSaved ? 'Remove from saved' : 'Save project'}
    >
      <Heart
        className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`}
        strokeWidth={isSaved ? 0 : 2}
      />
    </button>
  );
} 