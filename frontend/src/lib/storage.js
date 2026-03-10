const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const STORAGE_BUCKET = "usuarios";

// Monta a URL pública de uma imagem armazenada no bucket "usuarios"
export function getPostImagePublicUrl(imagePath) {
  if (!SUPABASE_URL || !imagePath) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${imagePath}`;
}

