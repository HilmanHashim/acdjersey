import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-white.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/agents", label: "Contact Us" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

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
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
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
