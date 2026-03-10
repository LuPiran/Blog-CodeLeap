import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCamera } from "react-icons/fa";
import toast from "react-hot-toast";

import { Header } from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";
import { api } from "../lib/api";
import { PostCard } from "../components/PostCard";

export function ProfilePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { showSplash, hideSplash } = useUi();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function load() {
      if (!isAuthenticated) return;
      try {
        showSplash("Loading profile...");
        const [meRes, postsRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/posts"),
        ]);
        setProfile(meRes.data);
        setPosts(postsRes.data || []);
      } catch (error) {
        toast.error("Error loading profile.");
      } finally {
        hideSplash();
        setLoadingData(false);
      }
    }

    load();
  }, [isAuthenticated, showSplash, hideSplash]);

  const myPosts = useMemo(
    () => posts.filter((p) => p.user_id === user?.id),
    [posts, user],
  );

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showSplash("Updating avatar...");
      const formData = new FormData();
      formData.append("avatar", file);
      if (profile?.username) {
        formData.append("username", profile.username);
      }

      const { data } = await api.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(data);
      toast.success("Avatar updated successfully.");
    } catch {
      toast.error("Could not update avatar.");
    } finally {
      hideSplash();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  if (loading || !isAuthenticated || loadingData) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header profile={profile} />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 pb-24">
        <section className="flex flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg backdrop-blur-sm">
          <div className="relative">
            <motion.div
              className="relative h-28 w-28 overflow-hidden rounded-full border border-slate-700 bg-slate-800"
              whileHover={{ scale: 1.02 }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username || "Avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-blue-300">
                  {(profile?.username || user?.email || "U")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}

              <AnimatePresence>
                <motion.button
                  type="button"
                  className="group absolute inset-0 flex items-center justify-center bg-slate-950/70 text-slate-100 opacity-0 backdrop-blur-sm transition-opacity hover:opacity-100"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium">
                    <FaCamera size={12} />
                    <span>Change photo</span>
                  </div>
                </motion.button>
              </AnimatePresence>
            </motion.div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="text-center">
            <h1 className="text-base font-semibold text-slate-50">
              {profile?.username || user?.user_metadata?.name || user?.email}
            </h1>
            <p className="mt-1 text-xs text-slate-400">{profile?.email}</p>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-slate-100">
            My posts
          </h2>

          {myPosts.length === 0 && (
            <p className="text-xs text-slate-500">
              You haven't created any posts yet.
            </p>
          )}

          <div className="mt-2 grid grid-cols-1 gap-3">
            {myPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isOwner
                onOpenPost={() => {}}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

