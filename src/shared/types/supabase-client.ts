// Tipo derivado diretamente do factory server-side.
// Garante que os genéricos do SupabaseClient coincidem exatamente com o que
// createClient() retorna, evitando conflito com exactOptionalPropertyTypes.
// "import type" não executa código server-side em client components.
import type { createClient } from '@/infrastructure/supabase/server';

export type CelestiaClient = Awaited<ReturnType<typeof createClient>>;
