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
    <div className="auth-page">
      {/* Warm background gradient */}
      <div className="auth-background" />
      
      <div className="auth-container">
        <div className={`auth-content ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Flow</h1>
            <p className="auth-subtitle">
              Where words find their rhythm and stories discover their soul
            </p>
          </div>

          {/* Auth Form */}
          <div className="auth-form-container">
            <div className="auth-warm">
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#E89B7B',
                        brandAccent: '#D88B6B',
                        brandButtonText: 'white',
                        defaultButtonBackground: '#FAF8F3',
                        defaultButtonBackgroundHover: '#F5F1E8',
                        defaultButtonBorder: 'rgba(0, 0, 0, 0.04)',
                        defaultButtonText: '#3D3B37',
                        dividerBackground: 'rgba(0, 0, 0, 0.06)',
                        inputBackground: '#FAF8F3',
                        inputBorder: 'rgba(0, 0, 0, 0.04)',
                        inputBorderHover: 'rgba(0, 0, 0, 0.08)',
                        inputBorderFocus: '#E89B7B',
                        inputText: '#3D3B37',
                        inputLabelText: '#6B6966',
                        inputPlaceholder: '#9B9895',
                        messageText: '#6B6966',
                        messageTextDanger: '#EF4444',
                        anchorTextColor: '#E89B7B',
                        anchorTextHoverColor: '#D88B6B',
                      },
                      space: {
                        spaceSmall: '12px',
                        spaceMedium: '20px',
                        spaceLarge: '32px',
                        labelBottomMargin: '10px',
                        anchorBottomMargin: '10px',
                        emailInputSpacing: '10px',
                        socialAuthSpacing: '10px',
                        buttonPadding: '16px 32px',
                        inputPadding: '16px 20px',
                      },
                      fontSizes: {
                        baseBodySize: '16px',
                        baseInputSize: '17px',
                        baseLabelSize: '14px',
                        baseButtonSize: '16px',
                      },
                      fonts: {
                        bodyFontFamily: `'EB Garamond', Georgia, serif`,
                        buttonFontFamily: `'Instrument Sans', -apple-system, sans-serif`,
                        inputFontFamily: `'EB Garamond', Georgia, serif`,
                        labelFontFamily: `'Instrument Sans', -apple-system, sans-serif`,
                      },
                      borderWidths: {
                        buttonBorderWidth: '1px',
                        inputBorderWidth: '1px',
                      },
                      radii: {
                        borderRadiusButton: '16px',
                        buttonBorderRadius: '16px',
                        inputBorderRadius: '16px',
                      },
                    },
                  },
                  style: {
                    button: {
                      fontWeight: '600',
                      letterSpacing: '0.02em',
                      textTransform: 'none',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    },
                    anchor: {
                      fontSize: '15px',
                      textDecoration: 'none',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                    },
                    container: {
                      gap: '24px',
                    },
                    divider: {
                      margin: '32px 0',
                      textTransform: 'none',
                      fontSize: '14px',
                      fontWeight: '400',
                      fontFamily: `'Instrument Sans', -apple-system, sans-serif`,
                    },
                    label: {
                      fontWeight: '600',
                      fontSize: '14px',
                      marginBottom: '10px',
                      letterSpacing: '0.02em',
                    },
                    input: {
                      fontSize: '17px',
                      letterSpacing: '-0.003em',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    },
                    message: {
                      fontSize: '15px',
                      lineHeight: '1.5',
                      borderRadius: '12px',
                      padding: '16px 20px',
                    },
                  },
                }}
                localization={{
                  variables: {
                    sign_in: {
                      email_label: 'Email',
                      password_label: 'Password',
                      button_label: 'Start Writing',
                      loading_button_label: 'Opening your workspace...',
                      social_provider_text: 'Continue with {{provider}}',
                      link_text: 'New to Flow? Create account',
                    },
                    sign_up: {
                      email_label: 'Email',
                      password_label: 'Create password',
                      button_label: 'Join Flow',
                      loading_button_label: 'Setting up your space...',
                      social_provider_text: 'Continue with {{provider}}',
                      link_text: 'Already have an account? Sign in',
                    },
                  },
                }}
                providers={['google']}
                redirectTo={process.env.NEXT_PUBLIC_APP_URL}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Your words are safe with us • Privacy-first writing
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="auth-decoration auth-decoration-1" />
        <div className="auth-decoration auth-decoration-2" />
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&family=Instrument+Sans:wght@400;500;600;700&family=Space+Mono:wght@400&display=swap');
        
        .auth-page {
          min-height: 100vh;
          background: #FAF8F3;
          position: relative;
          overflow: hidden;
        }
        
        .auth-background {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(232, 155, 123, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(232, 155, 123, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(232, 155, 123, 0.04) 0%, transparent 70%);
        }
        
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          z-index: 10;
        }
        
        .auth-content {
          width: 100%;
          max-width: 480px;
          position: relative;
        }
        
        .auth-header {
          text-align: center;
          margin-bottom: 48px;
        }
        
        .auth-title {
          font-size: 64px;
          font-weight: 700;
          color: #3D3B37;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
          font-family: 'Instrument Sans', sans-serif;
          opacity: 0.9;
        }
        
        .auth-subtitle {
          font-size: 20px;
          color: #6B6966;
          font-weight: 400;
          font-family: 'EB Garamond', serif;
          font-style: italic;
          opacity: 0.8;
          line-height: 1.6;
        }
        
        .auth-form-container {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 24px;
          box-shadow: 
            0 1px 2px rgba(0, 0, 0, 0.04),
            0 4px 16px -2px rgba(0, 0, 0, 0.06);
          padding: 48px 40px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .auth-form-container:hover {
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.06),
            0 8px 24px -4px rgba(0, 0, 0, 0.08);
        }
        
        .auth-footer {
          text-align: center;
          margin-top: 32px;
        }
        
        .auth-footer-text {
          font-size: 13px;
          color: #9B9895;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.02em;
        }
        
        .auth-decoration {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232, 155, 123, 0.1) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }
        
        .auth-decoration-1 {
          top: -100px;
          left: -100px;
          animation: float 20s infinite ease-in-out;
        }
        
        .auth-decoration-2 {
          bottom: -100px;
          right: -100px;
          animation: float 20s infinite ease-in-out reverse;
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
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* Auth component overrides */
        .auth-warm :global(.supabase-auth-ui_ui-button) {
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-button:hover) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(232, 155, 123, 0.3);
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-button[type="submit"]) {
          background: #E89B7B;
          border: 1px solid #E89B7B;
          color: white;
          font-weight: 600;
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-button[type="submit"]:hover) {
          background: #D88B6B;
          border-color: #D88B6B;
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-button.supabase-auth-ui_ui-button--social) {
          background: #FAF8F3;
          border: 1px solid rgba(0, 0, 0, 0.04);
          color: #3D3B37;
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-button.supabase-auth-ui_ui-button--social:hover) {
          background: #F5F1E8;
          border-color: rgba(0, 0, 0, 0.08);
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-input) {
          background: #FAF8F3;
          border: 1px solid rgba(0, 0, 0, 0.04);
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 17px;
          letter-spacing: -0.003em;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          caret-color: #E89B7B;
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-input:hover) {
          border-color: rgba(0, 0, 0, 0.08);
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-input:focus) {
          border-color: #E89B7B;
          box-shadow: 0 0 0 3px rgba(232, 155, 123, 0.1);
          outline: none;
          background: white;
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-label) {
          font-family: 'Instrument Sans', -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #6B6966;
          letter-spacing: 0.02em;
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-anchor) {
          color: #E89B7B;
          font-weight: 500;
          transition: all 0.2s ease;
          font-family: 'Instrument Sans', -apple-system, sans-serif;
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-anchor:hover) {
          color: #D88B6B;
          text-decoration: underline;
          text-decoration-color: rgba(232, 155, 123, 0.3);
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-divider) {
          color: #9B9895;
          font-size: 14px;
          font-weight: 400;
          font-family: 'Instrument Sans', -apple-system, sans-serif;
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-message) {
          font-family: 'EB Garamond', serif;
        }
        
        .auth-warm :global(.supabase-auth-ui_ui-container) {
          animation: fadeIn 0.6s ease-out 0.2s both;
        }
        
        /* Selection color */
        ::selection {
          background: rgba(232, 155, 123, 0.2);
          color: #3D3B37;
        }
        
        @media (max-width: 640px) {
          .auth-title {
            font-size: 48px;
          }
          
          .auth-form-container {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
}
