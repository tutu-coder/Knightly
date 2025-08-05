import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import VideoCard from '../../components/VideoCard';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  video_url: string;
  user_id: string;
}

export default function CreatorPage() {
  const router = useRouter();
  const { id } = router.query;

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching creator videos:', error.message);
      } else {
        setVideos(data || []);
      }

      setLoading(false);
    };

    fetchVideos();
  }, [id]);

  return (
    <main className="bg-black min-h-screen text-white py-6 px-4">
      <div className="mb-6">
        <Link href="/" className="text-blue-400 hover:underline">
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Videos by this Creator</h1>

      {loading ? (
        <p className="text-gray-400 text-center">Loading videos...</p>
      ) : videos.length === 0 ? (
        <p className="text-gray-400 text-center">This creator hasn’t uploaded any videos yet.</p>
      ) : (
        <div className="space-y-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              videoUrl={video.video_url}
              title={video.title}
              creator={
                <span className="text-blue-300">{video.user_id}</span>
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
