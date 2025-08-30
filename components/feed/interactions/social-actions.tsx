import { Button } from "@/components/ui/button";
import type { MouseEvent } from "react";
import { Heart, MessageCircle, Repeat2, Bookmark } from "lucide-react";
import { OutlineBookmark, OutlineChat, OutlineHeart, OutlineRepeat } from "@/components/icons/Icons";

interface SocialActionsProps {
  likes: number;
  comments: number;
  reposts: number;
  bookmarks: number;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
  onLike: (e: MouseEvent) => void;
  onComment: (e: MouseEvent) => void;
  onRepost: (e: MouseEvent) => void;
  onBookmark: (e: MouseEvent) => void;
  showLikesCount?: boolean;
  showCommentsCount?: boolean;
  showRepostsCount?: boolean;
  showBookmarksCount?: boolean;
}

export function SocialActions({
  likes,
  comments,
  reposts,
  bookmarks,
  isLiked,
  isReposted,
  isBookmarked,
  onLike,
  onComment,
  onRepost,
  onBookmark,
  showLikesCount = true,
  showCommentsCount = true,
  showRepostsCount = true,
  showBookmarksCount = true
}: SocialActionsProps) {
  return (
    <div className="flex items-center justify-between text-white">
      <div className="flex items-center gap-3">
        {/* Like button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size={'icon'}
            className={`hover:bg-white/12 hover:text-white ${isLiked ? 'text-red-500 hover:text-red-500 hover:bg-red-500/12' : 'text-white'}`}
            onClick={onLike}
          >
            <OutlineHeart
              className={isLiked ? 'fill-current' : ''}
            />
          </Button>
          {showLikesCount && (
            likes > 0 ? (
              <span className={`ml-1 text-xs text-red-500`}>{likes}</span>
            ) : (
              <span className={`ml-1 text-xs opacity-0`}>0</span>
            )
          )}
        </div>

        {/* Comment button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size={'icon'}
            // TODO: add isCommented
            className="hover:bg-white/12 hover:text-white text-white"
            onClick={onComment}
          >
            <OutlineChat />
          </Button>
          {showCommentsCount && (
            comments > 0 ? (
              <span className={`ml-1 text-xs text-blue-500`}>{comments}</span>
            ) : (
              <span className={`ml-1 text-xs opacity-0`}>0</span>
            )
          )}
        </div>

        {/* Repost button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size={'icon'}
            className={`hover:bg-white/12 hover:text-white ${isReposted ? 'text-green-500 hover:text-green-500 hover:bg-green-500/12' : 'text-white'}`}
            onClick={onRepost}
          >
            <OutlineRepeat />
          </Button>
          {showRepostsCount && (
            reposts > 0 ? (
              <span className={`ml-1 text-xs ${isReposted ? 'text-green-500' : 'text-white'}`}>{reposts}</span>
            ) : (
              <span className={`ml-1 text-xs opacity-0`}>0</span>
            )
          )}
        </div>
      </div>

      {/* Bookmark button */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size={'icon'}
          className={`hover:bg-white/12 hover:text-white ${isBookmarked ? 'text-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/12' : 'text-white'}`}
          onClick={onBookmark}
        >
          <OutlineBookmark
            className={isBookmarked ? 'fill-current' : ''}
          />
        </Button>
        {showBookmarksCount && (
          bookmarks > 0 ? (
            <span className={`ml-1 text-xs ${isBookmarked ? 'text-yellow-500' : 'text-white'}`}>{bookmarks}</span>
          ) : (
            <span className={`ml-1 text-xs opacity-0`}>0</span>
          )
        )}
      </div>
    </div>
  );
}
