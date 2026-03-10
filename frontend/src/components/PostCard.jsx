import {
  FaHeart,
  FaRegCommentDots,
  FaPen,
  FaTrash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Avatar } from "./Avatar";
import { getPostImagePublicUrl } from "../lib/storage";

export function PostCard({
  post,
  isOwner,
  onEdit,
  onDelete,
  onLike,
  onOpenComments,
  onOpenPost,
}) {
  const firstImagePath = post.post_images?.[0]?.image_url;
  const firstImage = firstImagePath
    ? getPostImagePublicUrl(firstImagePath)
    : null;
  const likeCount = post.likes?.length ?? post.likesCount ?? 0;
  const commentCount = post.comments?.length ?? post.commentsCount ?? 0;

  return (
    <motion.article
      layout
      className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg backdrop-blur-sm cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpenPost}
    >
      {firstImage && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={firstImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-slate-50">
            {post.title}
          </h3>
          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="rounded-full bg-slate-800 p-2 text-blue-300 hover:bg-slate-700 hover:text-blue-200 transition-colors"
              >
                <FaPen size={12} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="rounded-full bg-slate-800 p-2 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
              >
                <FaTrash size={12} />
              </button>
            </div>
          )}
        </div>

        <p className="line-clamp-3 text-sm text-slate-300">
          {post.description}
        </p>

        <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
              className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-3 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <FaHeart
                size={11}
                className={post.likedByCurrentUser ? "text-red-400" : ""}
              />
              <span>{likeCount}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenComments?.();
              }}
              className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-3 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <FaRegCommentDots size={11} />
              <span>{commentCount}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Avatar
              name={post.users?.username}
              src={post.users?.avatar_url}
              size="sm"
            />
            <span className="text-xs font-medium text-slate-100">
              {post.users?.username || "Author"}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

