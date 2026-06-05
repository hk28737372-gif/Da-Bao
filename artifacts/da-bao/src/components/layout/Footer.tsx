import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card py-16 border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold">
                D
              </div>
              <span className="font-serif text-xl font-bold tracking-wider text-foreground">DA BAO</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              The Name of Quality. Relaxing ambiance and delicious Asian craft at Rovan Tower, Jeddah.
            </p>
          </div>
          
          <div>
            <h4 className="font-serif text-lg text-foreground mb-6">Explore</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/menu" className="text-muted-foreground hover:text-primary transition-colors">Menu</Link>
              </li>
              <li>
                <Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors">Order Now</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif text-lg text-foreground mb-6">Contact</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li>Rovan Tower, Ar Rawdah</li>
              <li>Jeddah, Saudi Arabia</li>
              <li>Open Daily until 3:00 AM</li>
              <li className="pt-2 text-primary">+966 56 516 1760</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Da Bao Restaurant. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
