import LikeButton from '../../components/LikeButton';
import CommentsSection from '../../components/CommentsSection'; // import CommentsSection
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../lib/useUser';

export default function VideoPage() {
  const { user } = useUser();
  const router = useRouter();
  const { id } = router.query;

  const [video, setVideo] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(error.message);
        return;
      }

      setVideo(data);
      setLoading(false);
    };

    fetchVideo();
  }, [id]);

  if (loading) return <p className="text-white text-center">Loading...</p>;
  if (!video) return <p className="text-white text-center">Video not found.</p>;

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

      <CommentsSection videoId={video.id} /> {/* added comments section here */}
    </main>
  );
}
