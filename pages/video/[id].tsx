import LikeButton from '../../components/LikeButton';
import CommentsSection from '../../components/CommentsSection';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../lib/useUser';

// ✅ Define the Video type for proper typing
interface Video {
  id: string;
  title: string;
  video_url: string;
  user_id: string;
  username?: string; // Optional
}

export default function VideoPage() {
  const { user } = useUser();
  const router = useRouter();
  const { id } = router.query;

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from<Video>('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching video:', error.message);
        setLoading(false);
        return;
      }

      setVideo(data);
      setLoading(false);
    };

    fetchVideo();
  }, [id]);

  if (loading) {
    return <p className="text-white text-center">Loading...</p>;
  }

  if (!video) {
    return <p className="text-white text-center">Video not found.</p>;
  }

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
      <p className="text-sm text-gray-400 mb-4">
        Uploaded by {video.username || video.user_id}
      </p>

      <video
        src={video.video_url}
        controls
        className="w-full max-w-3xl mx-auto mb-6"
      />

      <LikeButton videoId={video.id} />
      <CommentsSection videoId={video.id} />
    </main>
  );
}
