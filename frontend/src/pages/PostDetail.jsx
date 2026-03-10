import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaRegCommentDots,
  FaReply,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";
import { Header } from "../components/Header";
import { Avatar } from "../components/Avatar";
import { getPostImagePublicUrl } from "../lib/storage";

function buildCommentTree(comments) {
  const roots = [];
  const childrenMap = {};

  (comments || []).forEach((c) => {
    if (!c.parent_comment_id) {
      roots.push(c);
    } else {
      if (!childrenMap[c.parent_comment_id]) {
        childrenMap[c.parent_comment_id] = [];
      }
      childrenMap[c.parent_comment_id].push(c);
    }
  });

  return { roots, childrenMap };
}

function formatDate(dateString) {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { showSplash, hideSplash } = useUi();

  const [profile, setProfile] = useState(null);
  const [post, setPost] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [commentText, setCommentText] = useState("");
  const [replyTexts, setReplyTexts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [showReplyFor, setShowReplyFor] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    async function load() {
      if (!isAuthenticated || !id) return;
      try {
        showSplash("Loading post...");
        const [meRes, postRes] = await Promise.all([
          api.get("/users/me"),
          api.get(`/posts/${id}`),
        ]);
        setProfile(meRes.data);
        setPost(postRes.data);
      } catch (error) {
        toast.error("Error loading post.");
      } finally {
        hideSplash();
      }
    }

    load();
  }, [id, isAuthenticated, showSplash, hideSplash]);

  const images = useMemo(() => {
    if (!post?.post_images) return [];
    return post.post_images
      .map((img) => ({
        id: img.id,
        url: getPostImagePublicUrl(img.image_url),
      }))
      .filter((img) => !!img.url);
  }, [post]);

  const { roots: rootComments, childrenMap } = useMemo(
    () => buildCommentTree(post?.comments || []),
    [post],
  );

  function handlePrevImage() {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1,
    );
  }

  function handleNextImage() {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1,
    );
  }

  async function handleToggleLikePost() {
    try {
      const { data } = await api.post(`/posts/${id}/like`);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: [], // não precisamos da lista, só do count
              likesCount: data.likesCount,
              likedByCurrentUser: data.liked,
            }
          : prev,
      );
    } catch {
      toast.error("Could not like this post.");
    }
  }

  async function handleSendComment(parentCommentId = null) {
    const text =
      parentCommentId == null
        ? commentText.trim()
        : (replyTexts[parentCommentId] || "").trim();

    if (!text) return;

    try {
      const { data } = await api.post("/comments", {
        postId: Number(id),
        comment: text,
        parentCommentId,
      });

      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [...(prev.comments || []), data],
            }
          : prev,
      );

      if (parentCommentId == null) {
        setCommentText("");
      } else {
        setReplyTexts((prev) => ({ ...prev, [parentCommentId]: "" }));
        setShowReplyFor(null);
        setExpandedComments((prev) => ({ ...prev, [parentCommentId]: true }));
      }
    } catch {
      toast.error("Error sending comment.");
    }
  }

  async function handleToggleLikeComment(commentId) {
    try {
      const { data } = await api.post(`/comments/${commentId}/like`);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((c) =>
                c.id === commentId
                  ? {
                      ...c,
                      likesCount: data.likesCount,
                    }
                  : c,
              ),
            }
          : prev,
      );
    } catch {
      toast.error("Could not like this comment.");
    }
  }

  if (loading || !isAuthenticated || !post) {
    return null;
  }

  const likeCount = post.likesCount ?? post.likes?.length ?? 0;
  const commentCount = post.comments?.length ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header profile={profile} />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-4 pb-24">
        <button
          type="button"
          className="mb-2 w-fit text-xs text-slate-400 hover:text-slate-100"
          onClick={() => navigate("/home")}
        >
          ← Back to feed
        </button>

        {/* Imagens do post */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg backdrop-blur-sm">
          <div className="relative h-72 w-full overflow-hidden bg-slate-900">
            {images.length > 0 ? (
              <img
                src={images[currentImageIndex].url}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No image for this post.
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/70 text-slate-100 hover:bg-slate-800 transition"
                >
                  <FaChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/70 text-slate-100 hover:bg-slate-800 transition"
                >
                  <FaChevronRight size={14} />
                </button>
              </>
            )}
          </div>

          {/* Título / descrição / likes / autor */}
          <div className="flex flex-col gap-3 p-4">
            <div>
              <h1 className="text-lg font-semibold text-slate-50">
                {post.title}
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                {post.description}
              </p>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleLikePost}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-3 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-700 transition-colors"
                >
                  <FaHeart
                    size={11}
                    className={post.likedByCurrentUser ? "text-red-400" : ""}
                  />
                  <span>{likeCount}</span>
                </button>
                <div className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-3 py-1 text-[11px] font-medium text-slate-100">
                  <FaRegCommentDots size={11} />
                  <span>{commentCount}</span>
                </div>
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
        </section>

        {/* Comments */}
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-slate-100">
            Comments
          </h2>

          <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
            <AnimatePresence>
              {rootComments.length === 0 && (
                <p className="text-xs text-slate-500">
                  There are no comments yet. Be the first to comment!
                </p>
              )}

              {rootComments.map((comment) => {
                const replies = childrenMap[comment.id] || [];
                const isExpanded = expandedComments[comment.id];
                const replyText = replyTexts[comment.id] || "";
                const likesCount =
                  comment.likesCount ?? comment.likes?.length ?? 0;

                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200"
                  >
                    <div className="flex items-start gap-2">
                      <Avatar
                        name={comment.users?.username}
                        src={comment.users?.avatar_url}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-semibold text-slate-100">
                              {comment.users?.username || "User"}
                            </p>
                            {comment.created_at && (
                              <p className="text-[10px] text-slate-500">
                                {formatDate(comment.created_at)}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-200">
                          {comment.comment}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleLikeComment(comment.id)}
                              className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-700 transition"
                            >
                              <FaHeart size={10} />
                              <span>{likesCount}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setShowReplyFor(
                                  showReplyFor === comment.id
                                    ? null
                                    : comment.id,
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-700 transition"
                            >
                              <FaReply size={10} />
                              <span>Reply</span>
                            </button>
                          </div>

                          {replies.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedComments((prev) => ({
                                  ...prev,
                                  [comment.id]: !prev[comment.id],
                                }))
                              }
                              className="text-[10px] text-blue-400 hover:text-blue-300"
                            >
                              {isExpanded
                                ? "Hide replies"
                                : `View replies (${replies.length})`}
                            </button>
                          )}
                        </div>

                        {showReplyFor === comment.id && (
                          <div className="mt-2">
                            <textarea
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40"
                              rows={2}
                              placeholder="Reply..."
                              value={replyText}
                              onChange={(e) =>
                                setReplyTexts((prev) => ({
                                  ...prev,
                                  [comment.id]: e.target.value,
                                }))
                              }
                            />
                            <div className="mt-1 flex justify-end gap-2">
                              <button
                                type="button"
                                className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800/80 transition"
                                onClick={() => {
                                  setShowReplyFor(null);
                                  setReplyTexts((prev) => ({
                                    ...prev,
                                    [comment.id]: "",
                                  }));
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-semibold text-slate-50 hover:bg-blue-500 transition"
                                onClick={() => handleSendComment(comment.id)}
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        )}

                        {isExpanded &&
                          replies.map((reply) => {
                            const replyLikesCount =
                              reply.likesCount ?? reply.likes?.length ?? 0;
                            return (
                              <div
                                key={reply.id}
                                className="mt-3 ml-6 rounded-lg border border-slate-800 bg-slate-950/80 p-2"
                              >
                                <div className="flex items-start gap-2">
                                  <Avatar
                                    name={reply.users?.username}
                                    src={reply.users?.avatar_url}
                                    size="sm"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <div>
                                        <p className="text-[11px] font-semibold text-slate-100">
                                          {reply.users?.username || "User"}
                                        </p>
                                        {reply.created_at && (
                                          <p className="text-[10px] text-slate-500">
                                            {formatDate(reply.created_at)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <p className="mt-1 text-[11px] text-slate-200">
                                      {reply.comment}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleToggleLikeComment(reply.id)
                                        }
                                        className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-700 transition"
                                      >
                                        <FaHeart size={10} />
                                        <span>{replyLikesCount}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* New comment field */}
          <div className="mt-3 border-t border-slate-800 pt-3">
            <label className="mb-1 block text-xs font-medium text-slate-300">
              New comment
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              rows={3}
              placeholder="Write your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-slate-50 hover:bg-blue-500 transition"
                onClick={() => handleSendComment(null)}
              >
                Comment
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

