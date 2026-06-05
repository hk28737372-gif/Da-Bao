import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, ArrowRight, Star, Clock, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[90vh] min-h-[600px] flex items-center pt-20">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/hero-bg.png" 
              alt="Da Bao Interior" 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          </div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h2 className="text-primary font-medium tracking-widest uppercase mb-4 text-sm md:text-base">
                Rovan Tower, Jeddah
              </h2>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground leading-[1.1] mb-6">
                The Name of <br />
                <span className="text-primary italic">Quality.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
                Relaxing ambiance, delicious Asian craft. Experience sophisticated late-night dining until 3:00 AM.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/menu">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-none">
                    View Menu <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-none border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
                    Order Online
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
                <a href="tel:+966565161760" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
                <a href="https://wa.me/966565161760" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#25D366] transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1 grid grid-cols-2 gap-4">
                <img src="/images/bao.png" alt="Dim Sum Bao" className="rounded-lg object-cover aspect-square w-full shadow-2xl" />
                <img src="/images/noodles.png" alt="Asian Noodles" className="rounded-lg object-cover aspect-square w-full shadow-2xl mt-8" />
              </div>
              <div className="order-1 md:order-2 space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 fill-mode-both">
                <h3 className="text-3xl md:text-5xl font-serif font-bold text-foreground">
                  Masterfully Crafted
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Every dish at Da Bao is a testament to culinary dedication. From our hand-folded dim sum to our deeply flavorful broths, we bring the authentic taste of luxury Asian dining to the heart of Jeddah.
                </p>
                
                <div className="bg-card/50 p-6 md:p-8 rounded-xl border border-white/5 relative">
                  <Star className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
                  <div className="flex gap-1 text-primary mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-foreground/90 font-serif text-lg md:text-xl italic mb-4">
                    "Absolutely breathtaking atmosphere and the best Bao I've ever had in Saudi Arabia. Perfect spot for late-night cravings."
                  </p>
                  <p className="text-primary text-sm font-medium">— Sarah A., Jeddah</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info & Location Section */}
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-4 md:px-6">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="space-y-12 lg:col-span-1">
                <div>
                  <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
                    <Clock className="w-6 h-6 text-primary" />
                    Opening Hours
                  </h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p className="flex justify-between border-b border-white/10 pb-2">
                      <span>Everyday</span>
                      <span className="text-foreground">Open until 3:00 AM</span>
                    </p>
                    <p className="pt-2 italic text-sm">Perfect for late-night dining</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-primary" />
                    Location
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p className="text-foreground font-medium">Rovan Tower</p>
                    <p>Prince Saud Al Faisal</p>
                    <p>Ar Rawdah, Jeddah</p>
                    <p>Saudi Arabia</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 h-[400px] rounded-xl overflow-hidden border border-white/10 shadow-2xl relative bg-muted">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3711.144136262972!2d39.14156681084224!3d21.54117866996683!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c3d01cc2ba2bf1%3A0x6bd708a3d5f57342!2sRovan%20Tower!5e0!3m2!1sen!2sus!4v1709664539825!5m2!1sen!2sus" 
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Da Bao Location"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
