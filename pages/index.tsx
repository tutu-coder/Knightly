import { useEffect, useState, useCallback } from 'react';
import VideoCard from '../components/VideoCard';
import CommentsSection from '../components/CommentsSection';
import { supabase } from '../lib/supabase';
import { useUser } from '../lib/useUser';
import debounce from 'lodash/debounce';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  video_url: string;
  user_id: string;
}

export default function HomePage() {
  const { user, loading: userLoading } = useUser();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [commentCounts, setCommentCounts] = useState<{ [videoId: string]: number }>({});
  const [showComments, setShowComments] = useState<{ [videoId: string]: boolean }>({});

  const fetchVideos = async (query = '') => {
    setLoading(true);
    let videoQuery = supabase.from('videos').select('*').order('created_at', { ascending: false });

    if (query) {
      videoQuery = videoQuery.ilike('title', `%${query}%`);
    }

    const { data, error } = await videoQuery;

    if (error) {
      console.error("Error fetching videos:", error.message);
    } else {
      setVideos(data || []);
      fetchCommentCounts(data || []);
    }

    setLoading(false);
  };

  const fetchCommentCounts = async (videos: Video[]) => {
    const counts: { [videoId: string]: number } = {};

    await Promise.all(
      videos.map(async (video) => {
        const { count, error } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('video_id', video.id);

        if (!error) counts[video.id] = count ?? 0;
      })
    );

    setCommentCounts(counts);
  };

  const debouncedFetchVideos = useCallback(
    debounce((q: string) => {
      fetchVideos(q);
    }, 400),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedFetchVideos(query);
  };

  const toggleComments = (videoId: string) => {
    setShowComments((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  if (userLoading) return <p className="text-white text-center">Loading user...</p>;

  return (
    <div className="relative min-h-screen">
      {/* 🔹 Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* 🔹 Dim overlay to make text readable */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/60 -z-10" />

      {/* 🔹 Main content */}
      <main className="relative z-10 bg-transparent py-4 px-4 text-white">
        <h1 className="text-2xl font-bold text-center mb-6">Latest Animations</h1>

        <div className="mb-6 max-w-md mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search videos by title..."
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-center text-gray-400">No videos uploaded yet.</p>
        ) : (
          videos.map((video) => (
            <div key={video.id} className="mb-10">
              <VideoCard
                videoUrl={video.video_url}
                title={video.title}
                creator={
                  <Link href={`/creator/${video.user_id}`} className="text-blue-400 hover:underline">
                    {video.user_id}
                  </Link>
                }
                videoId={video.id}
              />

              {/* 👇 comments + toggle wrapped in same max-width as video */}
              <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
                <div className="text-sm text-gray-400 mt-1 mb-2">
                  💬 {commentCounts[video.id] ?? 0} comment(s)
                </div>

                <button
                  onClick={() => toggleComments(video.id)}
                  className="text-blue-500 text-sm hover:underline mb-2"
                >
                  {showComments[video.id] ? 'Hide Comments' : 'Show Comments'}
                </button>

                {showComments[video.id] && <CommentsSection videoId={video.id} />}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
