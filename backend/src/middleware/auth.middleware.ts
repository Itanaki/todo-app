import { createClient } from "@supabase/supabase-js";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

type AuthenticatedUser = {
  id: string;
  email: string | null;
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const hasSupabaseAuthConfig =
  typeof supabaseUrl === "string" &&
  supabaseUrl.length > 0 &&
  typeof supabaseAnonKey === "string" &&
  supabaseAnonKey.length > 0;

const supabase = hasSupabaseAuthConfig
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export const attachAuthHook = (app: FastifyInstance) => {
  app.addHook("preHandler", async (request) => {
    request.user = null;

    if (!supabase) {
      return;
    }

    const authorizationHeader = request.headers.authorization;
    const query = request.query as { access_token?: unknown } | undefined;

    let token: string | undefined;

    if (typeof authorizationHeader === "string") {
      const [scheme, value] = authorizationHeader.split(" ");
      if (scheme === "Bearer" && value) {
        token = value;
      }
    }

    if (!token && typeof query?.access_token === "string") {
      token = query.access_token;
    }

    if (!token) {
      return;
    }

    const { data } = await supabase.auth.getUser(token);

    if (!data.user) {
      return;
    }

    const user: AuthenticatedUser = {
      id: data.user.id,
      email: data.user.email ?? null,
    };

    request.user = user;
  });
};

export const authMiddleware: FastifyPluginAsync = async (
  app: FastifyInstance,
) => {
  attachAuthHook(app);
};