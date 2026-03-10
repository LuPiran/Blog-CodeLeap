const { createClient } = require("@supabase/supabase-js");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  // Falta de configuração é erro grave em ambiente de backend
  // Lançar aqui ajuda a falhar rápido na inicialização
  throw new Error(
    "Variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY não foram configuradas no .env do backend.",
  );
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

module.exports = supabase;

