import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useGetSettings, useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus, Trash2, ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { OrderInputOrderType } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart, itemCount } = useCart();
  const { data: settings } = useGetSettings();
  const createOrder = useCreateOrder();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+966");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const deliveryFee = orderType === "delivery" ? (settings?.deliveryFee || 0) : 0;
  const taxRate = settings?.taxEnabled ? (settings?.taxRate || 0.15) : 0;
  const taxableAmount = subtotal + deliveryFee;
  const tax = taxableAmount * taxRate;
  const total = taxableAmount + tax;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || (orderType === "delivery" && !address)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const orderPayload = {
        customerName: name,
        customerPhone: phone,
        orderType: orderType as OrderInputOrderType,
        address: orderType === "delivery" ? address : undefined,
        notes: notes || undefined,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      };

      const newOrder = await createOrder.mutateAsync({ data: orderPayload });
      toast.success("Order submitted successfully!");

      // Format WhatsApp message
      const itemsList = items.map(i => `▫️ ${i.quantity}x ${i.name} - ${i.price * i.quantity} SAR`).join('%0A');
      const whatsappText = `*New Order from Da Bao* 🥟%0A%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Type:* ${orderType.toUpperCase()}%0A${orderType === 'delivery' ? `*Address:* ${address}%0A` : ''}${notes ? `*Notes:* ${notes}%0A` : ''}%0A*Items:*%0A${itemsList}%0A%0A*Subtotal:* ${subtotal.toFixed(2)} SAR%0A*Delivery Fee:* ${deliveryFee.toFixed(2)} SAR%0A*VAT (${(taxRate * 100).toFixed(0)}%):* ${tax.toFixed(2)} SAR%0A*Total:* *${total.toFixed(2)} SAR*%0A%0A_Order ID: #${newOrder.id}_`;

      const whatsappUrl = `https://wa.me/${settings?.whatsappNumber || '966565161760'}?text=${whatsappText}`;
      window.open(whatsappUrl, '_blank');
      
      clearCart();

    } catch (err) {
      toast.error("Failed to submit order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Your Order</h1>

            {items.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-white/5 shadow-xl">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-10 h-10 border-2 border-dashed border-primary rounded-full opacity-50" />
                </div>
                <h2 className="text-2xl font-serif text-foreground mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">Looks like you haven't added any dishes yet.</p>
                <Link href="/menu">
                  <Button size="lg" className="rounded-full px-8">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Browse Menu
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Cart Items List */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-card rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-white/5">
                      <h2 className="text-xl font-bold font-serif">Selected Items ({itemCount})</h2>
                    </div>
                    <div className="divide-y divide-white/5">
                      {items.map((item) => (
                        <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 group">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-serif font-bold text-foreground">{item.name}</h3>
                            <p className="text-primary font-medium">{item.price} SAR</p>
                          </div>
                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-right sm:w-20 font-bold">
                              {(item.price * item.quantity).toFixed(2)}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Checkout Form */}
                <div className="lg:col-span-5">
                  <div className="bg-card rounded-2xl border border-white/5 shadow-xl sticky top-28">
                    <form onSubmit={handleCheckout} className="p-6 space-y-6">
                      <h2 className="text-xl font-bold font-serif mb-4">Checkout Details</h2>
                      
                      <RadioGroup 
                        value={orderType} 
                        onValueChange={(val) => setOrderType(val as "delivery" | "pickup")}
                        className="grid grid-cols-2 gap-4 mb-6"
                      >
                        <div>
                          <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                          <Label 
                            htmlFor="delivery" 
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-white/10 bg-transparent p-4 hover:bg-white/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                          >
                            <span className="font-semibold">Home Delivery</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                          <Label 
                            htmlFor="pickup" 
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-white/10 bg-transparent p-4 hover:bg-white/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                          >
                            <span className="font-semibold">Self-Pickup</span>
                          </Label>
                        </div>
                      </RadioGroup>

                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="bg-background/50 border-white/10 focus-visible:border-primary rounded-lg"
                            placeholder="e.g. Abdullah"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            className="bg-background/50 border-white/10 focus-visible:border-primary rounded-lg"
                            placeholder="+966 5X XXX XXXX"
                            required
                          />
                        </div>
                        
                        {orderType === "delivery" && (
                          <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="address">Delivery Address</Label>
                            <Textarea 
                              id="address" 
                              value={address} 
                              onChange={(e) => setAddress(e.target.value)} 
                              className="bg-background/50 border-white/10 focus-visible:border-primary rounded-lg resize-none"
                              placeholder="City, District, Street, Building..."
                              required
                            />
                          </div>
                        )}

                        <div className="grid gap-2">
                          <Label htmlFor="notes">Order Notes (Optional)</Label>
                          <Input 
                            id="notes" 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            className="bg-background/50 border-white/10 focus-visible:border-primary rounded-lg"
                            placeholder="Extra spicy, no peanuts, etc."
                          />
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>{subtotal.toFixed(2)} SAR</span>
                        </div>
                        {orderType === "delivery" && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Delivery Fee</span>
                            <span>{deliveryFee.toFixed(2)} SAR</span>
                          </div>
                        )}
                        {settings?.taxEnabled && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>VAT ({(taxRate * 100).toFixed(0)}%)</span>
                            <span>{tax.toFixed(2)} SAR</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-foreground pt-4 border-t border-white/10">
                          <span>Grand Total</span>
                          <span className="text-primary">{total.toFixed(2)} SAR</span>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-14 text-lg rounded-xl flex items-center justify-center gap-2 hover-elevate mt-6"
                        disabled={createOrder.isPending}
                      >
                        {createOrder.isPending ? "Processing..." : (
                          <>
                            Send Order to WhatsApp <Send className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground/70 mt-4">
                        You will be redirected to WhatsApp to finalize your order directly with our team.
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
