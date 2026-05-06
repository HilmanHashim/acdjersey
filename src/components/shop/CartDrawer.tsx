import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

const CartDrawer = () => {
  const { items, isOpen, setOpen, removeItem, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Your Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 border-b border-border pb-4">
                {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm truncate">{item.name}</p>
                  {Object.entries(item.selectedOptions).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(" • ")}
                    </p>
                  )}
                  <p className="text-sm text-accent mt-1">RM {item.unitPrice.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto text-destructive" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between font-display">
              <span>Subtotal</span>
              <span className="text-accent">RM {subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping calculated at next step.</p>
            <Button className="w-full" variant="hero" onClick={handleCheckout}>Checkout</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
