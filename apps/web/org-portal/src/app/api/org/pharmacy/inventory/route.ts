import { proxyGet, proxyPost } from "@/lib/apiProxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return proxyGet(`/org/pharmacy/inventory?${url.searchParams.toString()}`);
}

export async function POST(request: Request) {
  return proxyPost("/org/pharmacy/inventory", request);
}
