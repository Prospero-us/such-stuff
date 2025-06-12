import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function AuthPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated background shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className={`max-w-md w-full space-y-8 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
          {/* Logo and heading */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-full w-20 h-20 flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
              Flow
            </h1>
            <p className="text-xl text-purple-100 font-light">
              Where words come alive
            </p>
          </div>

          {/* Auth card with glassmorphism */}
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Welcome back
                </h2>
                <p className="text-purple-100">
                  Sign in to continue your writing journey
                </p>
              </div>

              {/* Custom themed Auth component */}
              <div className="auth-wrapper">
                <Auth
                  supabaseClient={supabase}
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: '#8b5cf6',
                          brandAccent: '#7c3aed',
                          brandButtonText: 'white',
                          defaultButtonBackground: 'rgba(255, 255, 255, 0.1)',
                          defaultButtonBackgroundHover: 'rgba(255, 255, 255, 0.2)',
                          defaultButtonBorder: 'rgba(255, 255, 255, 0.2)',
                          defaultButtonText: 'white',
                          dividerBackground: 'rgba(255, 255, 255, 0.2)',
                          inputBackground: 'rgba(255, 255, 255, 0.1)',
                          inputBorder: 'rgba(255, 255, 255, 0.2)',
                          inputBorderHover: 'rgba(255, 255, 255, 0.4)',
                          inputBorderFocus: '#8b5cf6',
                          inputText: 'white',
                          inputLabelText: 'rgba(255, 255, 255, 0.8)',
                          inputPlaceholder: 'rgba(255, 255, 255, 0.5)',
                          messageText: 'rgba(255, 255, 255, 0.9)',
                          messageTextDanger: '#ef4444',
                          anchorTextColor: '#c084fc',
                          anchorTextHoverColor: '#e9d5ff',
                        },
                        space: {
                          spaceSmall: '4px',
                          spaceMedium: '8px',
                          spaceLarge: '16px',
                          labelBottomMargin: '8px',
                          anchorBottomMargin: '4px',
                          emailInputSpacing: '4px',
                          socialAuthSpacing: '4px',
                          buttonPadding: '12px 16px',
                          inputPadding: '12px 16px',
                        },
                        fontSizes: {
                          baseBodySize: '14px',
                          baseInputSize: '14px',
                          baseLabelSize: '14px',
                          baseButtonSize: '14px',
                        },
                        fonts: {
                          bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                          buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                          inputFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                          labelFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                        },
                        borderWidths: {
                          buttonBorderWidth: '1px',
                          inputBorderWidth: '1px',
                        },
                        radii: {
                          borderRadiusButton: '8px',
                          buttonBorderRadius: '8px',
                          inputBorderRadius: '8px',
                        },
                      },
                    },
                    style: {
                      button: {
                        fontWeight: '500',
                      },
                      anchor: {
                        fontWeight: '500',
                      },
                      container: {
                        color: 'white',
                      },
                      divider: {
                        color: 'rgba(255, 255, 255, 0.6)',
                      },
                      label: {
                        fontWeight: '500',
                      },
                      input: {
                        backdropFilter: 'blur(10px)',
                      },
                      message: {
                        fontSize: '14px',
                      },
                    },
                  }}
                  providers={['google', 'github']}
                  redirectTo={process.env.NEXT_PUBLIC_APP_URL}
                />
              </div>
            </div>
          </div>

          {/* Footer text */}
          <p className="text-center text-purple-200 text-sm">
            By signing in, you agree to our{' '}
            <a href="#" className="text-purple-300 hover:text-white transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-300 hover:text-white transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        .auth-wrapper :global(.supabase-auth-ui_ui-divider) {
          margin: 24px 0;
        }
        .auth-wrapper :global(.supabase-auth-ui_ui-button) {
          transition: all 0.2s ease;
        }
        .auth-wrapper :global(.supabase-auth-ui_ui-button:hover) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </div>
  );
}
