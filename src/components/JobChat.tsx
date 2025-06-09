
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User } from "lucide-react";
import { Job } from "@/pages/Index";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JobChatProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  created_by: string;
  job_order_id: string;
  user_profile?: {
    full_name: string;
  };
}

export function JobChat({ job, isOpen, onClose }: JobChatProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch comments for the job
  useEffect(() => {
    if (isOpen && job.id) {
      fetchComments();
    }
  }, [isOpen, job.id]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      // Use raw SQL query to fetch comments since table might not be in types yet
      const { data: commentsData, error: commentsError } = await supabase
        .rpc('exec_sql', {
          sql: `SELECT * FROM public.job_order_comments WHERE job_order_id = '${job.id}' ORDER BY created_at ASC`
        }) as { data: any[], error: any };

      if (commentsError) {
        console.error('SQL query failed, trying direct access:', commentsError);
        // Fallback to direct table access
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('job_order_comments' as any)
          .select('*')
          .eq('job_order_id', job.id)
          .order('created_at', { ascending: true });

        if (fallbackError) {
          throw fallbackError;
        }
        
        if (fallbackData && fallbackData.length > 0) {
          await processCommentsWithProfiles(fallbackData);
        } else {
          setComments([]);
        }
        return;
      }

      if (commentsData && commentsData.length > 0) {
        await processCommentsWithProfiles(commentsData);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processCommentsWithProfiles = async (commentsData: any[]) => {
    // Get unique user IDs
    const userIds = [...new Set(commentsData.map(comment => comment.created_by))];
    
    // Fetch user profiles separately
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Combine comments with user profiles
    const commentsWithProfiles = commentsData.map(comment => ({
      ...comment,
      user_profile: profilesData?.find(profile => profile.id === comment.created_by) || { full_name: 'Unknown User' }
    }));

    setComments(commentsWithProfiles);
  };

  const sendComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSending(true);
    try {
      // Use raw SQL for insert since table might not be in types yet
      const { data, error } = await supabase
        .rpc('exec_sql', {
          sql: `INSERT INTO public.job_order_comments (job_order_id, comment, created_by) VALUES ('${job.id}', '${newComment.trim().replace(/'/g, "''")}', '${user.id}') RETURNING *`
        }) as { data: any[], error: any };

      if (error) {
        console.error('SQL insert failed, trying direct access:', error);
        // Fallback to direct table access
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('job_order_comments' as any)
          .insert({
            job_order_id: job.id,
            comment: newComment.trim(),
            created_by: user.id
          })
          .select()
          .single();

        if (fallbackError) {
          throw fallbackError;
        }
        
        // Get the user profile for the new comment
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const newCommentWithProfile = {
          ...fallbackData,
          user_profile: profileData || { full_name: 'Unknown User' }
        };

        setComments(prev => [...prev, newCommentWithProfile]);
        setNewComment('');
        
        toast({
          title: "Success",
          description: "Comment added successfully",
        });
        return;
      }

      if (data && data.length > 0) {
        // Get the user profile for the new comment
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const newCommentWithProfile = {
          ...data[0],
          user_profile: profileData || { full_name: 'Unknown User' }
        };

        setComments(prev => [...prev, newCommentWithProfile]);
        setNewComment('');
        
        toast({
          title: "Success",
          description: "Comment added successfully",
        });
      }
    } catch (error) {
      console.error('Error sending comment:', error);
      toast({
        title: "Error",
        description: "Failed to send comment",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendComment();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Chat: {job.title}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Job #{job.jobOrderNumber} • {job.customer}
          </p>
        </DialogHeader>

        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 p-4 border rounded-md">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Start the conversation!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.user_profile?.full_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="mt-4 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[80px] resize-none"
              disabled={isSending}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </span>
              <Button
                onClick={sendComment}
                disabled={!newComment.trim() || isSending}
                size="sm"
                className="flex items-center gap-1"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
