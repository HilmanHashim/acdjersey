import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-white.png";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/catalogue", label: "Catalogue" },
  // TEMP HIDDEN — uncomment to re-enable Customize page in nav
  // { to: "/customize", label: "Customize" },
  { to: "/enquiry", label: "Enquiry" },
  { to: "/about", label: "About Us" },
  { to: "/agents", label: "Contact Us" },
  { to: "/shop", label: "Shop" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { count, setOpen: setCartOpen } = useCart();

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/20 bg-gradient-to-r from-background via-card to-background backdrop-blur-md">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="group">
          <img src={logo} alt="ACD Jersey" className="h-8" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "relative font-display text-sm uppercase tracking-[0.2em] px-4 py-2 rounded-md transition-all duration-300",
                pathname === link.to
                  ? "text-primary-foreground bg-gradient-to-r from-primary to-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => setCartOpen(true)}
            className="relative ml-2 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>

        {/* Mobile right side */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 text-foreground"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <button
            className="text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-primary/20 bg-card/95 backdrop-blur-md">
          <div className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "font-display text-sm uppercase tracking-[0.2em] px-4 py-2.5 rounded-md transition-all duration-300",
                  pathname === link.to
                    ? "text-primary-foreground bg-gradient-to-r from-primary to-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
