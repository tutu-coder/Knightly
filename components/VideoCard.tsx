import LikeButton from './LikeButton';

interface VideoCardProps {
  videoUrl: string;
  title: string;
  creator: React.ReactNode;
  videoId?: string; // 👈 optional for homepage like support
}

export default function VideoCard({ videoUrl, title, creator, videoId }: VideoCardProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-md mb-6 
                    max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
      <video
        src={videoUrl}
        controls
        className="w-full mb-3 rounded"
        preload="metadata"
      />
      <h2 className="text-lg font-semibold truncate">{title}</h2>
      <p className="text-sm text-gray-400">By: {creator}</p>

      {videoId && (
        <div className="mt-3">
          <LikeButton videoId={videoId} />
        </div>
      )}
    </div>
  );
}
