import { FaBlog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Avatar } from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";
import toast from "react-hot-toast";

export function Header({ profile }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSplash, hideSplash } = useUi();

  async function handleLogout() {
    try {
      showSplash("Signing you out...");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("You have signed out.");
      navigate("/login");
    } catch (error) {
      toast.error("Could not sign out. Please try again.");
    } finally {
      hideSplash();
    }
  }

  const displayName = profile?.username || user?.user_metadata?.name || user?.email;

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur-md">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full px-1 py-1 hover:bg-slate-800/70 transition-colors"
        onClick={() => navigate("/home")}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-slate-50 shadow-md">
          <FaBlog size={18} />
        </div>
        <div className="text-left">
          <h1 className="text-sm font-semibold text-slate-50">
            BlueWave Blog
          </h1>
          <p className="text-xs text-slate-400">
            Share ideas with the community
          </p>
        </div>
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full px-1 py-1 hover:bg-slate-800/70 transition-colors"
          onClick={() => navigate("/profile")}
        >
          <Avatar name={displayName} src={profile?.avatar_url} size="md" />
          <span className="hidden text-sm font-medium text-slate-100 sm:inline">
            {displayName}
          </span>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700 hover:text-slate-50 transition-colors"
        >
          <FaSignOutAlt className="mr-1" size={12} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}

