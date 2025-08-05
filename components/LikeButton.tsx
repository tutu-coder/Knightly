import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../lib/useUser';

interface LikeButtonProps {
  videoId: string;
}

export default function LikeButton({ videoId }: LikeButtonProps) {
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!user) return;

      // Total like count
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', videoId);

      setLikeCount(count || 0);

      // Check if this user has already liked
      const { data: existingLike, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .maybeSingle();

      setLiked(!!existingLike);
      setLoading(false);
    };

    fetchLikes();
  }, [user, videoId]);

  const toggleLike = async () => {
    if (!user) return;

    if (liked) {
      // Remove like
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('video_id', videoId);

      if (!error) {
        setLiked(false);
        setLikeCount((count) => Math.max(0, count - 1)); // Prevent negatives
      }
    } else {
      // Add like
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: user.id, video_id: videoId });

      if (!error) {
        setLiked(true);
        setLikeCount((count) => count + 1);
      }
    }
  };

  if (loading) return null;

  return (
    <button
      onClick={toggleLike}
      className={`mt-2 text-sm px-3 py-1 rounded ${
        liked ? 'bg-red-600 text-white' : 'bg-gray-700 text-white'
      }`}
    >
      ❤️ {likeCount}
    </button>
  );
}
