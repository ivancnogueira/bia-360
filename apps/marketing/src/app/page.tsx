import { JsonLd } from '../components/JsonLd';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Experience } from '../components/Experience';
import { Features } from '../components/Features';
import { ForWhom } from '../components/ForWhom';
import { Pricing } from '../components/Pricing';
import { Roadmap } from '../components/Roadmap';
import { FAQ } from '../components/FAQ';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';

export default function Page() {
  return (
    <>
      <JsonLd />
      <Header />
      <main id="inicio">
        <Hero />
        <Experience />
        <Features />
        <ForWhom />
        <Pricing />
        <Roadmap />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
