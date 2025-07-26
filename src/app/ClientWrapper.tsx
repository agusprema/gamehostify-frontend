import Header from '@/components/layout/Header';
import RouteLoader from '@/components/routing/RouteLoader';
import RouteResetter from '@/components/routing/RouteResetter';
import Footer from '@/components/layout/Footer';
import CartClient, { openCart } from '@/components/sections/Cart/CartClient';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  // Komponen ini sekarang server-side, SEO optimal
  return (
    <>
      <Header onCartClick={openCart} />
      <CartClient />
      <RouteLoader />
      <RouteResetter />
      <main className="min-h-screen">{children}</main>
      
      {/* Footer tetap di server untuk render cepat */}
      <Footer />
    </>
  );
}
