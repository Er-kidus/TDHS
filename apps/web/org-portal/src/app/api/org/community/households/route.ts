import { proxyGet, proxyPost } from "@/lib/apiProxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return proxyGet(`/org/community/households?${url.searchParams.toString()}`);
}

export async function POST(request: Request) {
  return proxyPost("/org/community/households", request);
}
