import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../lib/useUser';

interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_email?: string;
}

interface CommentsSectionProps {
  videoId: string;
}

export default function CommentsSection({ videoId }: CommentsSectionProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // Fetch comments
  useEffect(() => {
    if (!videoId) return;

    const fetchComments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('id, video_id, user_id, user_email, content, created_at')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error.message);
      } else {
        setComments(data);
      }
      setLoading(false);
    };

    fetchComments();

    // Realtime listener
    const channel = supabase
      .channel('comments-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `video_id=eq.${videoId}`,
        },
        (payload) => {
          setComments((prev) => [payload.new as Comment, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId]);

  // Add comment
  const addComment = async () => {
    if (!user) return alert('You must be logged in to comment.');
    if (!newComment.trim()) return;

    setPosting(true);
    const { data, error } = await supabase
      .from('comments')
      .insert({
        video_id: videoId,
        user_id: user.id,
        user_email: user.email,
        content: newComment.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error posting comment:', error.message);
      alert('Failed to post comment.');
    } else if (data) {
      setNewComment('');
      setComments((prev) => [data, ...prev]);
    }
    setPosting(false);
  };

  // Delete comment
  const deleteComment = async (id: string) => {
    const confirmDelete = confirm('Delete this comment?');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id);

    if (error) {
      console.error('Failed to delete comment:', error.message);
    } else {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <section className="mt-8 max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>

      {user ? (
        <div className="mb-4">
          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 rounded bg-gray-800 text-white resize-none"
            disabled={posting}
          />
          <button
            onClick={addComment}
            disabled={posting || !newComment.trim()}
            className="mt-2 px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
          >
            {posting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      ) : (
        <p className="text-gray-400">Log in to post comments.</p>
      )}

      {loading ? (
        <p className="text-gray-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400">No comments yet. Be the first!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="bg-gray-900 p-3 rounded">
              <p className="text-sm text-gray-300">
                {comment.user_email}{' '}
                <span className="text-xs text-gray-500">
                  • {new Date(comment.created_at).toLocaleString()}
                </span>
              </p>
              <p className="mt-1">{comment.content}</p>
              {user?.id === comment.user_id && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="text-red-500 text-xs mt-2 hover:underline"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
