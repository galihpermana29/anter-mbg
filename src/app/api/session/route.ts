import { getSession } from "@/shared/session/getter-session";

export async function GET(request: Request) {
  // get session
  const session = await getSession();

  return new Response(JSON.stringify(session));
}
