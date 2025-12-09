import Header from '@/components/layout/Header';
import DeferredCartClient from '@/components/sections/Cart/DeferredCartClient';
import DeferredRouteLoader from '@/components/routing/DeferredRouteLoader';
import DeferredRouteResetter from '@/components/routing/DeferredRouteResetter';
import DeferredFooter from '@/components/layout/DeferredFooter';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  // Komponen ini sekarang server-side, SEO optimal
  return (
    <>
      <Header />
      <DeferredCartClient />
      <DeferredRouteLoader />
      <DeferredRouteResetter />
      <main className="min-h-screen">{children}</main>
      
      {/* Footer tetap di server untuk render cepat */}
      <DeferredFooter />
    </>
  );
}
