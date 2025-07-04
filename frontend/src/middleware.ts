import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 보호할 경로와 공개 전용 경로를 배열로 정의
const protectedRoutes = ["/mypage"];
const publicOnlyRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 현재 사용자 세션 정보를 가져옴
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 비로그인 사용자 접근 제어
  //  - 보호된 페이지에 접근하려고 하면 로그인 페이지로 리다이렉트
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    console.log(
      `[Middleware] 비로그인 사용자 접근 제한: ${pathname} -> /login`
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 로그인 사용자 접근 제어
  //  - 공개 전용 페이지에 접근하려고 하면 메인 페이지로 리다이렉트함
  if (user && publicOnlyRoutes.some((route) => pathname.startsWith(route))) {
    console.log(`[Middleware] 로그인 사용자 접근 제한: ${pathname} -> /`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  //그 외의 경우는 정상적으로 페이지를 보여줌
  return response;
}

// 미들웨어가 실행될 경로를 설정
export const config = {
  matcher: [
    /*
     * 아래와 일치하는 경로를 제외한 모든 요청 경로에서 미들웨어를 실행:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘 파일)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
