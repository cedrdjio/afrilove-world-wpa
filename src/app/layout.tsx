import type { Metadata, Viewport } from "next";
import { Nunito, Plus_Jakarta_Sans } from "next/font/google";

import { OfflineBanner } from "@/components/layout/offline-banner";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { SplashScreen } from "@/components/pwa/splash-screen";
import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/*
 * CSS critique du splash de démarrage, INLINE (et non dans globals.css) : il
 * s'applique dès le 1er octet, sans attendre le téléchargement d'une feuille
 * de style séparée — donc aucun flash d'écran « brut » avant le splash stylé.
 * La règle [data-splash="seen"] masque le splash entre les pages (garde de
 * session). Aucun emoji, 100 % vectoriel.
 */
const SPLASH_CSS = `
#app-splash{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);background:radial-gradient(125% 85% at 50% -10%,#6a4fc0 0%,transparent 58%),radial-gradient(110% 75% at 50% 112%,#8b69d6 0%,transparent 55%),linear-gradient(158deg,#2e2440 0%,#1d1530 100%);opacity:1;transition:opacity .55s ease,visibility .55s ease}
#app-splash.af-splash-hide{opacity:0;visibility:hidden;pointer-events:none}
html[data-splash="seen"] #app-splash{display:none!important}
.af-splash-inner{display:flex;flex-direction:column;align-items:center;gap:1.1rem;animation:af-splash-in .7s cubic-bezier(.23,1,.32,1) both}
.af-splash-badge{position:relative;display:grid;place-items:center}
.af-splash-halo{position:absolute;width:230px;height:230px;border-radius:9999px;background:radial-gradient(circle,rgba(155,126,222,.6) 0%,transparent 68%);filter:blur(6px);animation:af-splash-pulse 2.4s ease-in-out infinite}
.af-splash-logo{position:relative;width:128px;height:128px;border-radius:30px;background-image:url("/brand/logo.png");background-size:cover;background-position:center;box-shadow:0 22px 60px -14px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.1),inset 0 0 0 1px rgba(255,255,255,.06);animation:af-splash-float 3.6s ease-in-out .7s infinite}
.af-splash-logo::after{content:"";position:absolute;inset:-2px;border-radius:32px;padding:2px;background:linear-gradient(140deg,rgba(255,255,255,.55),rgba(155,126,222,0) 45%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.af-splash-text{display:flex;flex-direction:column;align-items:center;gap:.25rem}
.af-splash-title{font-family:var(--font-jakarta),system-ui,sans-serif;font-weight:800;letter-spacing:-.01em;font-size:1.15rem;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.4);animation:af-splash-rise .6s ease .32s both}
.af-splash-tagline{font-family:var(--font-nunito),system-ui,sans-serif;font-size:.82rem;color:rgba(255,255,255,.72);animation:af-splash-rise .6s ease .46s both}
.af-splash-dots{display:flex;gap:.42rem;margin-top:.55rem}
.af-splash-dots span{width:7px;height:7px;border-radius:9999px;background:rgba(255,255,255,.9);animation:af-splash-bounce 1.1s ease-in-out infinite}
.af-splash-dots span:nth-child(2){animation-delay:.15s}
.af-splash-dots span:nth-child(3){animation-delay:.3s}
@keyframes af-splash-in{from{opacity:0;transform:scale(.84)}to{opacity:1;transform:scale(1)}}
@keyframes af-splash-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes af-splash-pulse{0%,100%{opacity:.5;transform:scale(.9)}50%{opacity:.95;transform:scale(1.1)}}
@keyframes af-splash-rise{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
@keyframes af-splash-bounce{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-5px);opacity:1}}
@media(prefers-reduced-motion:reduce){.af-splash-inner,.af-splash-logo,.af-splash-halo,.af-splash-title,.af-splash-tagline,.af-splash-dots span{animation:none!important}}
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.creator }],
  category: "social",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.shortName,
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // gère l'encoche / les zones sûres iPhone
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: siteConfig.themeColor.light,
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: siteConfig.themeColor.dark,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={siteConfig.locale}
      suppressHydrationWarning
      className={`${jakarta.variable} ${nunito.variable} h-full`}
    >
      <body className="min-h-dvh antialiased">
        {/* CSS critique du splash, inline → appliqué avant toute peinture. */}
        <style dangerouslySetInnerHTML={{ __html: SPLASH_CSS }} />
        {/* Garde de session : si le splash a déjà été montré durant cette
            session (onglet / app ouverte), on pose l'attribut AVANT que
            #app-splash soit analysé → il n'est jamais peint entre les pages.
            Il ne réapparaît qu'à une nouvelle ouverture (session vierge). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('afl-splash-seen'))document.documentElement.setAttribute('data-splash','seen')}catch(e){}",
          }}
        />
        {/* Splash de démarrage — peint dès le 1er rendu serveur, animé en CSS
            pur, puis retiré par <SplashScreen> une fois l'app prête. */}
        <div id="app-splash" aria-hidden="true">
          <div className="af-splash-inner">
            <div className="af-splash-badge">
              <span className="af-splash-halo" />
              <div
                className="af-splash-logo"
                role="img"
                aria-label="AfriLove World"
              />
            </div>
            <div className="af-splash-text">
              <span className="af-splash-title">AfriLove World</span>
              <span className="af-splash-tagline">
                L&apos;amour sans frontières
              </span>
            </div>
            <div className="af-splash-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
        <a
          href="#contenu"
          className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2"
        >
          Aller au contenu
        </a>
        <AppProviders>
          <OfflineBanner />
          <div id="contenu">{children}</div>
          <InstallPrompt />
          <ServiceWorkerRegister />
          <SplashScreen />
        </AppProviders>
      </body>
    </html>
  );
}
