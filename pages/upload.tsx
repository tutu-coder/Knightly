// /pages/upload.tsx

import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../lib/useUser'; // make sure this exists

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const { user, loading } = useUser();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return alert("Still loading user...");
    if (!user) return alert("You must be logged in to upload.");

    const file = fileInputRef.current?.files?.[0];
    if (!file) return alert("Please select a video file.");

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file);
 
    console.log("Current user:", user);

    if (uploadError) {
    console.error("Upload error:", uploadError);
    alert("Upload failed: " + uploadError.message);
    return;
   }


    const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/${filePath}`;
    
   console.log("Upload Data:", {
   title,
   video_url: videoUrl,
   user_id: user.id,
   });

    const { error: dbError } = await supabase.from('videos').insert({
      title,
      video_url: videoUrl,
      storage_path: filePath,
      user_id: user.id,
    });

    if (dbError) {
      console.error("DB insert error:", dbError.message);
      alert("Failed to save video info.");
      return;
    }

    alert("Upload successful!");
    setTitle('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className="min-h-screen bg-black text-white py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Upload Animation</h1>
      <form onSubmit={handleUpload} className="space-y-4 max-w-md mx-auto">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Video title"
          className="w-full p-2 rounded bg-gray-800 text-white"
          required
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="video/*"
          className="w-full p-2 bg-gray-800 text-white"
          required
        />
        <button
          type="submit"
          className="w-full p-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold"
        >
          Upload
        </button>
      </form>
    </main>
  );
}
