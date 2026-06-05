import { useState } from "react";
import { Link } from "wouter";
import {
  useListCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useListMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useGetSettings,
  useUpdateSettings,
  useListOrders,
  useUpdateOrderStatus,
  useGetAnalyticsSummary,
  useGetOrdersByDay,
  useGetTopItems,
  getListCategoriesQueryKey,
  getListMenuItemsQueryKey,
  getListOrdersQueryKey,
  getGetSettingsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from "sonner";
import { format } from "date-fns";
import { OrderStatusUpdateStatus, OrderOrderType } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Admin() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "dabao2024") {
      setIsUnlocked(true);
    } else {
      toast.error("Incorrect passphrase");
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary mx-auto flex items-center justify-center text-primary-foreground font-serif font-bold text-3xl mb-4">
              D
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Admin Portal</h1>
            <p className="text-muted-foreground mt-2">Enter passphrase to access Da Bao management</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Passphrase"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-white/10 h-12 text-center text-lg tracking-widest focus-visible:border-primary"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg">Unlock</Button>
          </form>
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              &larr; Back to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="bg-card border-b border-white/5 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-sm">
              D
            </div>
            <span className="font-serif font-bold tracking-widest">DA BAO ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-white/10">View Site</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setIsUnlocked(false)}>Lock</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="bg-card border border-white/5 p-1">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="animate-in fade-in duration-500">
            <OrdersManager />
          </TabsContent>

          <TabsContent value="menu" className="animate-in fade-in duration-500">
            <MenuManager />
          </TabsContent>

          <TabsContent value="categories" className="animate-in fade-in duration-500">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="analytics" className="animate-in fade-in duration-500">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="settings" className="animate-in fade-in duration-500">
            <SettingsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function OrdersManager() {
  const { data: orders, isLoading } = useListOrders();
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  const handleStatusChange = async (id: number, status: OrderStatusUpdateStatus) => {
    try {
      await updateStatus.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'preparing': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'ready': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'delivered': return 'bg-white/10 text-white/50 border-white/20';
      case 'cancelled': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="bg-card border-white/5">
      <CardHeader>
        <CardTitle className="font-serif">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id} className="border-white/5 hover:bg-white/5">
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>
                  <div>{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                </TableCell>
                <TableCell className="capitalize">{order.orderType}</TableCell>
                <TableCell>{order.total} SAR</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(order.createdAt), "MMM d, h:mm a")}
                </TableCell>
                <TableCell className="text-right">
                  <Select 
                    value={order.status} 
                    onValueChange={(val) => handleStatusChange(order.id, val as OrderStatusUpdateStatus)}
                  >
                    <SelectTrigger className="w-[130px] h-8 bg-background border-white/10 ml-auto">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {orders?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function MenuManager() {
  const { data: items, isLoading } = useListMenuItems();
  const { data: categories } = useListCategories();
  const queryClient = useQueryClient();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "", description: "", ingredients: "", price: "", categoryId: "", imageUrl: "", isAvailable: true, isFeatured: false
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", ingredients: "", price: "", categoryId: "", imageUrl: "", isAvailable: true, isFeatured: false });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || "",
      ingredients: item.ingredients || "",
      price: item.price.toString(),
      categoryId: item.categoryId?.toString() || "",
      imageUrl: item.imageUrl || "",
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        description: formData.description || null,
        ingredients: formData.ingredients || null,
        imageUrl: formData.imageUrl || null,
        isAvailable: formData.isAvailable,
        isFeatured: formData.isFeatured
      };

      if (editingId) {
        await updateItem.mutateAsync({ id: editingId, data: payload });
        toast.success("Menu item updated");
      } else {
        await createItem.mutateAsync({ data: payload });
        toast.success("Menu item created");
      }
      queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
      resetForm();
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure?")) {
      try {
        await deleteItem.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
        toast.success("Item deleted");
      } catch {
        toast.error("Failed to delete");
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-1 bg-card border-white/5 h-fit">
        <CardHeader>
          <CardTitle className="font-serif">{editingId ? "Edit Item" : "Add New Item"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-background border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Price (SAR)</Label>
              <Input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-background border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.categoryId} onValueChange={val => setFormData({...formData, categoryId: val})}>
                <SelectTrigger className="bg-background border-white/10">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Image URL (Optional)</Label>
              <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="bg-background border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Ingredients (Optional)</Label>
              <Input value={formData.ingredients} onChange={e => setFormData({...formData, ingredients: e.target.value})} className="bg-background border-white/10" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <Label>Available</Label>
              <Switch checked={formData.isAvailable} onCheckedChange={c => setFormData({...formData, isAvailable: c})} />
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <Label>Featured</Label>
              <Switch checked={formData.isFeatured} onCheckedChange={c => setFormData({...formData, isFeatured: c})} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">{editingId ? "Update" : "Create"}</Button>
              {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 bg-card border-white/5">
        <CardHeader>
          <CardTitle className="font-serif">Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((item) => (
                <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && <img src={item.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />}
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.categoryName || "-"}</TableCell>
                  <TableCell>{item.price} SAR</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={item.isAvailable ? "text-green-500 border-green-500/30 bg-green-500/10" : "text-muted-foreground border-white/10"}>
                      {item.isAvailable ? "Available" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>Del</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriesManager() {
  const { data: categories, isLoading } = useListCategories();
  const queryClient = useQueryClient();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", sortOrder: "0" });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", sortOrder: "0" });
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, sortOrder: cat.sortOrder.toString() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name: formData.name, sortOrder: Number(formData.sortOrder) };
      if (editingId) {
        await updateCategory.mutateAsync({ id: editingId, data: payload });
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync({ data: payload });
        toast.success("Category created");
      }
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      resetForm();
    } catch {
      toast.error("Error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    if(confirm("Delete category? Items within will lose this category.")) {
      try {
        await deleteCategory.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        toast.success("Deleted");
      } catch {
        toast.error("Failed to delete");
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="bg-card border-white/5 h-fit">
        <CardHeader>
          <CardTitle className="font-serif">{editingId ? "Edit Category" : "Add Category"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-background border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" required value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: e.target.value})} className="bg-background border-white/10" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">{editingId ? "Update" : "Create"}</Button>
              {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card border-white/5">
        <CardHeader>
          <CardTitle className="font-serif">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((c) => (
                <TableRow key={c.id} className="border-white/5 hover:bg-white/5">
                  <TableCell>{c.sortOrder}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(c.id)}>Del</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsManager() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    restaurantName: "", phone: "", whatsappNumber: "", address: "", openingHours: "", 
    deliveryFee: "0", taxRate: "0.15", taxEnabled: true
  });

  // Init
  const initialized = React.useRef(false);
  React.useEffect(() => {
    if (settings && !initialized.current) {
      setFormData({
        restaurantName: settings.restaurantName,
        phone: settings.phone,
        whatsappNumber: settings.whatsappNumber,
        address: settings.address,
        openingHours: settings.openingHours,
        deliveryFee: settings.deliveryFee.toString(),
        taxRate: settings.taxRate.toString(),
        taxEnabled: settings.taxEnabled
      });
      initialized.current = true;
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync({
        data: {
          restaurantName: formData.restaurantName,
          phone: formData.phone,
          whatsappNumber: formData.whatsappNumber,
          address: formData.address,
          openingHours: formData.openingHours,
          deliveryFee: Number(formData.deliveryFee),
          taxRate: Number(formData.taxRate),
          taxEnabled: formData.taxEnabled
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="bg-card border-white/5 max-w-2xl">
      <CardHeader>
        <CardTitle className="font-serif">General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Restaurant Name</Label>
              <Input required value={formData.restaurantName} onChange={e => setFormData({...formData, restaurantName: e.target.value})} className="bg-background border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-background border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number (for orders)</Label>
              <Input required value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} className="bg-background border-white/10" placeholder="9665XXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label>Opening Hours</Label>
              <Input required value={formData.openingHours} onChange={e => setFormData({...formData, openingHours: e.target.value})} className="bg-background border-white/10" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="bg-background border-white/10" />
          </div>

          <div className="border-t border-white/5 pt-6 grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Delivery Fee (SAR)</Label>
              <Input type="number" step="0.01" required value={formData.deliveryFee} onChange={e => setFormData({...formData, deliveryFee: e.target.value})} className="bg-background border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Tax Rate (e.g. 0.15 for 15%)</Label>
              <Input type="number" step="0.01" required value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: e.target.value})} className="bg-background border-white/10" />
            </div>
          </div>

          <div className="flex items-center space-x-2 border border-white/10 p-4 rounded-lg bg-background/50">
            <Switch id="tax" checked={formData.taxEnabled} onCheckedChange={c => setFormData({...formData, taxEnabled: c})} />
            <Label htmlFor="tax" className="font-medium cursor-pointer">Enable Tax Calculation</Label>
          </div>

          <Button type="submit" className="w-full">Save Settings</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AnalyticsDashboard() {
  const { data: summary, isLoading: loading1 } = useGetAnalyticsSummary();
  const { data: ordersByDay, isLoading: loading2 } = useGetOrdersByDay();
  const { data: topItems, isLoading: loading3 } = useGetTopItems();

  if (loading1 || loading2 || loading3) return <div>Loading Analytics...</div>;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-white/5">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-primary">{summary?.totalRevenue.toFixed(0)} SAR</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/5">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total Orders</div>
            <div className="text-3xl font-bold text-foreground">{summary?.totalOrders}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/5">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Today's Revenue</div>
            <div className="text-3xl font-bold text-foreground">{summary?.todayRevenue.toFixed(0)} SAR</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/5">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Avg Order Value</div>
            <div className="text-3xl font-bold text-foreground">{summary?.avgOrderValue.toFixed(0)} SAR</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-card border-white/5">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Orders (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tickFormatter={(val) => format(new Date(val), "MMM d")} />
                  <YAxis stroke="rgba(255,255,255,0.5)" allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1C1C1C', borderColor: 'rgba(255,255,255,0.1)', color: '#F5F0E8' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Top 5 Items (All Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems || []} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.8)" width={100} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1C1C1C', borderColor: 'rgba(255,255,255,0.1)', color: '#F5F0E8' }}
                  />
                  <Bar dataKey="totalOrdered" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
