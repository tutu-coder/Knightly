import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../lib/useUser';
import VideoCard from '../components/VideoCard';

// ✅ Define a proper type for Video
interface Video {
  id: number;
  title: string;
  video_url: string;
  storage_path: string;
  user_id: string;
}

export default function ProfilePage() {
  const { user, loading } = useUser();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [myVideos, setMyVideos] = useState<Video[]>([]); // ✅ Properly typed
  const [editingTitle, setEditingTitle] = useState<Record<number, boolean>>({});
  const [newTitles, setNewTitles] = useState<Record<number, string>>({});

  // ✅ Load profile info
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, bio')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('Profile not found, creating new...');
      } else {
        setUsername(data.username);
        setBio(data.bio);
      }

      setLoadingProfile(false);
    };

    loadProfile();
  }, [user]);

  // ✅ Load user's videos
  const loadMyVideos = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMyVideos(data as Video[]); // ✅ Cast as correct type
    }
  };

  useEffect(() => {
    loadMyVideos();
  }, [user]);

  // ✅ Save profile
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const updates = {
      id: user.id,
      username,
      bio,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
  .from('profiles')
  .upsert([updates], { onConflict: 'id' });


    if (error) {
      alert('Failed to save profile.');
      console.error(error.message);
    } else {
      alert('Profile saved!');
    }
  };

  // ✅ Delete video
  const handleDelete = async (videoId: number, videoPath: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    const { error: dbError } = await supabase.from("videos").delete().eq("id", videoId);
    if (dbError) {
      console.error("Failed to delete from DB:", dbError.message);
      return alert("Failed to delete video.");
    }

    const { error: storageError } = await supabase.storage.from("videos").remove([videoPath]);
    if (storageError) {
      console.error("Failed to delete from storage:", storageError.message);
    }

    setMyVideos(myVideos.filter((v) => v.id !== videoId));
  };

  // ✅ Edit title
  const handleTitleEdit = async (videoId: number, newTitle: string) => {
    const { error } = await supabase.from("videos").update({ title: newTitle }).eq("id", videoId);
    if (error) {
      console.error("Failed to update title:", error.message);
      return alert("Failed to update title.");
    }

    setMyVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, title: newTitle } : v))
    );
    setEditingTitle((prev) => ({ ...prev, [videoId]: false }));
  };

  if (loading || loadingProfile) {
    return <p className="text-white text-center">Loading...</p>;
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <form onSubmit={handleSave} className="space-y-4 max-w-md mx-auto mb-10">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-2 rounded bg-gray-800 text-white"
          required
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
        <button
          type="submit"
          className="w-full p-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold"
        >
          Save Profile
        </button>
      </form>

      <h2 className="text-xl font-bold mb-4 text-center">My Uploaded Videos</h2>
      <div className="space-y-6">
        {myVideos.length === 0 ? (
          <p className="text-center text-gray-400">You have not uploaded any videos yet.</p>
        ) : (
          myVideos.map((vid) => (
            <div key={vid.id} className="relative">
              <VideoCard
                videoUrl={vid.video_url}
                title={vid.title}
                creator={username || user.email}
              />
              {editingTitle[vid.id] ? (
                <div className="flex gap-2 px-4 mb-4">
                  <input
                    type="text"
                    className="flex-1 p-2 rounded bg-gray-800 text-white"
                    value={newTitles[vid.id] || ''}
                    onChange={(e) =>
                      setNewTitles((prev) => ({ ...prev, [vid.id]: e.target.value }))
                    }
                  />
                  <button
                    onClick={() => handleTitleEdit(vid.id, newTitles[vid.id] || '')}
                    className="bg-blue-600 px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-4 mb-4">
                  <button
                    onClick={() =>
                      setEditingTitle((prev) => ({ ...prev, [vid.id]: true }))
                    }
                    className="bg-yellow-600 px-3 py-1 rounded"
                  >
                    Edit Title
                  </button>
                  <button
                    onClick={() => handleDelete(vid.id, vid.storage_path)}
                    className="bg-red-600 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
