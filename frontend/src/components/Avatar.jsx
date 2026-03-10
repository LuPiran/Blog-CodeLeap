import { FaUser } from "react-icons/fa";

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Avatar({ name, src, size = "md" }) {
  const sizeClass =
    size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";

  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={`${sizeClass} rounded-full object-cover border border-slate-700`}
      />
    );
  }

  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-blue-500/10 text-blue-300 border border-slate-700`}
    >
      {initials || <FaUser size={14} />}
    </div>
  );
}

