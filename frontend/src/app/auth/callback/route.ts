import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      try {
        // 백엔드에 로그인/가입 요청을 보냅니다.
        // 서버 컴포넌트이므로 fetch를 직접 사용하고, 헤더에 토큰을 실어 보냅니다.
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          // 백엔드 로그인 실패 시 에러 처리
          throw new Error("Backend login failed");
        }
        
        // 백엔드 로그인/가입 성공 후 리디렉션
        return NextResponse.redirect(`${origin}${next}`);

      } catch (e) {
        // 에러 처리
        console.error("Backend login/register error:", e);
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }
    }
  }

  // 에러 발생 시 리디렉션
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}