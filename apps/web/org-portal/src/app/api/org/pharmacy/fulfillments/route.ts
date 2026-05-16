import { proxyPost } from "@/lib/apiProxy";

export async function POST(request: Request) {
  return proxyPost("/org/pharmacy/fulfillments", request);
}
