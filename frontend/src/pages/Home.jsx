import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaFilter, FaPlus, FaSearch } from "react-icons/fa";
import Select from "react-select";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";
import { Header } from "../components/Header";
import { PostCard } from "../components/PostCard";
import { Modal } from "../components/Modal";
import { getPostImagePublicUrl } from "../lib/storage";

export function HomePage() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { showSplash, hideSplash } = useUi();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [postBeingEdited, setPostBeingEdited] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postBeingDeleted, setPostBeingDeleted] = useState(null);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    images: [],
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    imagesToKeep: [],
    newImages: [],
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [titleOrder, setTitleOrder] = useState(null); // "asc" | "desc"
  const [dateOrder, setDateOrder] = useState("desc"); // "desc" (mais recente) | "asc"

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    async function loadInitial() {
      if (!isAuthenticated) return;

      try {
        showSplash("Loading your feed...");
        const [meRes, postsRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/posts"),
        ]);
        setProfile(meRes.data);
        setPosts(postsRes.data || []);
      } catch (error) {
        toast.error("Error loading feed. Please try again.");
      } finally {
        hideSplash();
        setLoadingPosts(false);
      }
    }

    loadInitial();
  }, [isAuthenticated, showSplash, hideSplash]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (dateFrom) count += 1;
    if (dateTo) count += 1;
    if (titleOrder) count += 1;
    if (dateOrder && dateOrder !== "desc") count += 1;
    return count;
  }, [dateFrom, dateTo, titleOrder, dateOrder]);

  const filteredPosts = useMemo(() => {
    const term = search.toLowerCase().trim();

    let result = [...posts];

    if (term) {
      result = result.filter((p) => {
        const haystack = `${p.title} ${p.description} ${
          p.users?.username || ""
        }`.toLowerCase();
        return haystack.includes(term);
      });
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter((p) => {
        if (!p.created_at) return true;
        return new Date(p.created_at) >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      result = result.filter((p) => {
        if (!p.created_at) return true;
        return new Date(p.created_at) <= toDate;
      });
    }

    result.sort((a, b) => {
      // Ordenação por título
      if (titleOrder) {
        const ta = (a.title || "").toLowerCase();
        const tb = (b.title || "").toLowerCase();
        if (ta < tb) return titleOrder === "asc" ? -1 : 1;
        if (ta > tb) return titleOrder === "asc" ? 1 : -1;
      }

      // Ordenação por data
      const da = a.created_at ? new Date(a.created_at) : null;
      const db = b.created_at ? new Date(b.created_at) : null;

      if (!da || !db) return 0;

      if (da < db) return dateOrder === "desc" ? 1 : -1;
      if (da > db) return dateOrder === "desc" ? -1 : 1;
      return 0;
    });

    return result;
  }, [posts, search, dateFrom, dateTo, titleOrder, dateOrder]);

  function handleClearFilters() {
    setDateFrom("");
    setDateTo("");
    setTitleOrder(null);
    setDateOrder("desc");
  }

  function resetCreateForm() {
    setCreateForm({ title: "", description: "", images: [] });
  }

  function resetEditForm() {
    setEditForm({
      title: "",
      description: "",
      imagesToKeep: [],
      newImages: [],
    });
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    const { title, description, images } = createForm;

    if (!title || !description || !images.length) {
      toast.error("All fields are required and you must add at least one image.");
      return;
    }

    try {
      showSplash("Creating post...");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      images.forEach((img) => formData.append("images", img));

      const { data } = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Post created successfully.");
      setPosts((prev) => [data, ...prev]);
      resetCreateForm();
      setShowCreateModal(false);
    } catch (error) {
      toast.error("Error creating post. Please try again.");
    } finally {
      hideSplash();
    }
  }

  function openEditModal(post) {
    setPostBeingEdited(post);
    setEditForm({
      title: post.title,
      description: post.description,
      imagesToKeep: post.post_images?.map((img) => img.image_url) || [],
      newImages: [],
    });
    setShowEditModal(true);
  }

  async function handleEditPost(e) {
    e.preventDefault();
    if (!postBeingEdited) return;
    const { title, description, imagesToKeep, newImages } = editForm;

    if (!title || !description || (!imagesToKeep.length && !newImages.length)) {
      toast.error("Title, description and at least one image are required.");
      return;
    }

    try {
      showSplash("Updating post...");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      imagesToKeep.forEach((img) => formData.append("imagesToKeep", img));
      newImages.forEach((img) => formData.append("newImages", img));

      const { data } = await api.patch(`/posts/${postBeingEdited.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Post updated successfully.");
      setPosts((prev) =>
        prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)),
      );
      setShowEditModal(false);
      resetEditForm();
      setPostBeingEdited(null);
    } catch (error) {
      toast.error("Error updating post.");
    } finally {
      hideSplash();
    }
  }

  async function handleDeletePost() {
    if (!postBeingDeleted) return;
    try {
      showSplash("Deleting post...");
      await api.delete(`/posts/${postBeingDeleted.id}`);
      toast.success("Post deleted successfully.");
      setPosts((prev) => prev.filter((p) => p.id !== postBeingDeleted.id));
      setShowDeleteModal(false);
      setPostBeingDeleted(null);
    } catch (error) {
      toast.error("Error deleting post.");
    } finally {
      hideSplash();
    }
  }

  async function handleToggleLike(postId) {
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likesCount: data.likesCount,
                likedByCurrentUser: data.liked,
              }
            : p,
        ),
      );
    } catch {
      toast.error("Could not like this post.");
    }
  }

  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header profile={profile} />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-4 pb-24">
        <motion.section
          className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-950/50 px-3 py-2">
            <FaSearch className="text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search..."
              className="h-8 w-full bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="mt-2 inline-flex items-center justify-center gap-1 rounded-full border border-slate-700 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800/80 transition-colors sm:mt-0"
            onClick={() => setIsFilterOpen(true)}
          >
            <FaFilter size={11} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-slate-50">
                {activeFilterCount}
              </span>
            )}
          </button>
        </motion.section>

        <section className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {loadingPosts && (
              <p className="text-sm text-slate-400">Loading posts...</p>
            )}
            {!loadingPosts && filteredPosts.length === 0 && (
              <p className="text-sm text-slate-400">
                No posts found. How about creating the first one?
              </p>
            )}
            {!loadingPosts &&
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isOwner={post.user_id === user.id}
                  onEdit={() => openEditModal(post)}
                  onDelete={() => {
                    setPostBeingDeleted(post);
                    setShowDeleteModal(true);
                  }}
                  onLike={() => handleToggleLike(post.id)}
                  onOpenPost={() => navigate(`/posts/${post.id}`)}
                />
              ))}
          </AnimatePresence>
        </section>
      </main>

      <button
        type="button"
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-slate-50 shadow-xl hover:from-blue-400 hover:to-blue-600 transition"
      >
        <FaPlus size={20} />
      </button>

      {/* Modal criar post */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetCreateForm();
        }}
        title="Create new post"
      >
        <form className="space-y-4" onSubmit={handleCreatePost}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Title
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="w-full text-xs text-slate-300"
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  images: Array.from(e.target.files || []),
                }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Description
            </label>
            <textarea
              className="min-h-[100px] w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 py-2.5 text-sm font-semibold text-slate-50 shadow-lg hover:from-blue-400 hover:to-blue-600 transition"
          >
            Publish
          </button>
        </form>
      </Modal>

      {/* Menu lateral de filtros */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            className="fixed inset-0 z-30 flex justify-end bg-slate-950/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFilterOpen(false)}
          >
            <motion.div
              className="flex h-full w-full max-w-sm flex-col border-l border-slate-800 bg-slate-900/95 p-4 shadow-2xl"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-sm font-semibold text-slate-50">
                Filters
              </h2>

              <div className="space-y-4 text-xs text-slate-200">
                <div>
                  <p className="mb-1 font-medium text-slate-300">
                    Filter by date
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="mb-1 block text-[11px] text-slate-400">
                        From
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-[11px] text-slate-400">
                        To
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-1 font-medium text-slate-300">
                    Sort by title
                  </p>
                  <Select
                    value={
                      titleOrder
                        ? {
                            value: titleOrder,
                            label:
                              titleOrder === "asc"
                                ? "A - Z (title)"
                                : "Z - A (title)",
                          }
                        : null
                    }
                    onChange={(option) => setTitleOrder(option?.value || null)}
                    isClearable
                    placeholder="Select..."
                    options={[
                      { value: "asc", label: "A - Z (title)" },
                      { value: "desc", label: "Z - A (title)" },
                    ]}
                    classNamePrefix="select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: "#020617",
                        borderColor: "#1e293b",
                        minHeight: "32px",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#e2e8f0",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#0f172a",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? "#1d4ed8"
                          : "transparent",
                        color: state.isFocused ? "#e2e8f0" : "#cbd5f5",
                        fontSize: "12px",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#64748b",
                        fontSize: "12px",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "#e2e8f0",
                      }),
                    }}
                  />
                </div>

                <div>
                  <p className="mb-1 font-medium text-slate-300">
                    Sort by date
                  </p>
                  <Select
                    value={
                      dateOrder === "desc"
                        ? {
                            value: "desc",
                            label: "Newest first",
                          }
                        : {
                            value: "asc",
                            label: "Oldest first",
                          }
                    }
                    onChange={(option) =>
                      setDateOrder(option?.value === "asc" ? "asc" : "desc")
                    }
                    options={[
                      { value: "desc", label: "Newest first" },
                      { value: "asc", label: "Oldest first" },
                    ]}
                    classNamePrefix="select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: "#020617",
                        borderColor: "#1e293b",
                        minHeight: "32px",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#e2e8f0",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#0f172a",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? "#1d4ed8"
                          : "transparent",
                        color: state.isFocused ? "#e2e8f0" : "#cbd5f5",
                        fontSize: "12px",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#64748b",
                        fontSize: "12px",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "#e2e8f0",
                      }),
                    }}
                  />
                </div>
              </div>

              <div className="mt-auto flex justify-between gap-2 pt-4">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800/80 transition"
                  onClick={handleClearFilters}
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-slate-50 hover:bg-blue-500 transition"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Apply filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal editar post */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetEditForm();
          setPostBeingEdited(null);
        }}
        title={`Edit post: ${postBeingEdited?.title || ""}`}
      >
        <form className="space-y-4" onSubmit={handleEditPost}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Title
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              value={editForm.title}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Current images (uncheck to remove)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {postBeingEdited?.post_images?.map((img) => {
                const url = getPostImagePublicUrl(img.image_url);
                return (
                  <label
                    key={img.id}
                    className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-900/80"
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-20 w-full object-cover"
                    />
                    <input
                      type="checkbox"
                      className="absolute left-1 top-1 h-4 w-4"
                      checked={editForm.imagesToKeep.includes(img.image_url)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditForm((prev) => ({
                          ...prev,
                          imagesToKeep: checked
                            ? [...prev.imagesToKeep, img.image_url]
                            : prev.imagesToKeep.filter(
                                (url2) => url2 !== img.image_url,
                              ),
                        }));
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              New images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="w-full text-xs text-slate-300"
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  newImages: Array.from(e.target.files || []),
                }))
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Description
            </label>
            <textarea
              className="min-h-[100px] w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 py-2.5 text-sm font-semibold text-slate-50 shadow-lg hover:from-blue-400 hover:to-blue-600 transition"
          >
            Save changes
          </button>
        </form>
      </Modal>

      {/* Modal deletar post */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPostBeingDeleted(null);
        }}
        title="Delete post"
      >
        <p className="mb-4 text-sm text-slate-200">
          Do you want to delete the post{" "}
          <span className="font-semibold">
            {postBeingDeleted?.title || ""}
          </span>
          ?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800/80 transition"
            onClick={() => {
              setShowDeleteModal(false);
              setPostBeingDeleted(null);
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-slate-50 hover:bg-red-500 transition"
            onClick={handleDeletePost}
          >
            Yes
          </button>
        </div>
      </Modal>
    </div>
  );
}

