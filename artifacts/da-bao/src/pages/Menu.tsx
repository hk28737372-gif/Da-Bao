import { useState } from "react";
import { useListCategories, useListMenuItems } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function Menu() {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  const { data: menuItems, isLoading: isLoadingItems } = useListMenuItems({ categoryId: activeCategoryId || undefined });
  const { addToCart } = useCart();

  const handleCategoryClick = (id: number | null) => {
    setActiveCategoryId(id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Our Menu</h1>
            <p className="text-muted-foreground">Discover the true essence of Asian culinary arts. Every dish is meticulously prepared to order.</p>
          </div>

          {/* Categories Navigation */}
          <div className="flex overflow-x-auto pb-4 mb-8 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar gap-2 justify-start md:justify-center animate-in fade-in duration-700 delay-150">
            <Button
              variant={activeCategoryId === null ? "default" : "outline"}
              className={`rounded-full whitespace-nowrap ${activeCategoryId === null ? "" : "border-white/10"}`}
              onClick={() => handleCategoryClick(null)}
            >
              All Items
            </Button>
            {isLoadingCategories ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full" />
              ))
            ) : (
              categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategoryId === category.id ? "default" : "outline"}
                  className={`rounded-full whitespace-nowrap ${activeCategoryId === category.id ? "" : "border-white/10"}`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                </Button>
              ))
            )}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {isLoadingItems ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-white/5 h-[400px] flex flex-col">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-6 flex flex-col flex-1">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="mt-auto flex justify-between items-center">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-10 w-28 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : menuItems?.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                <p>No items found in this category.</p>
              </div>
            ) : (
              menuItems?.filter(item => item.isAvailable).map((item, index) => (
                <div 
                  key={item.id} 
                  className="group bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 flex flex-col animate-in fade-in slide-in-from-bottom-8"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                >
                  <div className="h-56 overflow-hidden relative bg-muted">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif text-2xl bg-white/5">
                        Da Bao
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-80" />
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1 relative -mt-6 bg-card rounded-t-2xl">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h3 className="text-xl font-serif font-bold text-foreground leading-tight">{item.name}</h3>
                      <span className="text-primary font-bold whitespace-nowrap">{item.price} SAR</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                    
                    {item.ingredients && (
                      <p className="text-xs text-muted-foreground/70 mb-6 italic">
                        Contains: {item.ingredients}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-4 border-t border-white/5">
                      <Button 
                        onClick={() => addToCart(item)}
                        className="w-full rounded-xl hover-elevate group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                        variant="secondary"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
