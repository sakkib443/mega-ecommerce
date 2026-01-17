import {
  Hero,
  HomeCategory,
  PopularProducts,
  NewProducts,
  BlogSection,
  Support
} from '@/components/home';
import PromoBanner from '@/components/home/PromoBanner';
import TwoBanners from '@/components/home/TwoBanners';

export default function Home() {
  return (
    <>
      <Hero />
      <PromoBanner />
      <HomeCategory />
      <PopularProducts />
      <TwoBanners />
      <NewProducts />
      <BlogSection />
      <Support />
    </>
  );
}
