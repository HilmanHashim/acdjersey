import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-white.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/about", label: "About Us" },
  { to: "/agents", label: "Contact Us" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.35)]"
          : "bg-background/70 backdrop-blur-sm"
      )}
    >
      <div
        className={cn(
          "container flex items-center justify-between transition-all duration-300",
          scrolled ? "h-16" : "h-20"
        )}
      >
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <img
            src={logo}
            alt="ACD Jersey"
            className={cn(
              "transition-all duration-300 group-hover:scale-105",
              scrolled ? "h-8" : "h-10"
            )}
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "group relative px-4 py-2 font-display text-[13px] font-bold uppercase tracking-[0.25em] transition-colors duration-300",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative inline-flex items-center gap-2">
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                  )}
                  {link.label}
                </span>
                <span
                  className={cn(
                    "pointer-events-none absolute left-3 right-3 -bottom-0.5 h-[2px] origin-left bg-gradient-to-r from-primary to-accent transition-transform duration-300 ease-out",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}

          {/* Divider + CTA */}
          <span className="mx-3 h-6 w-px bg-border/70" aria-hidden />
          <Button
            asChild
            variant="hero"
            size="sm"
            className="rounded-full px-5 text-[12px] tracking-[0.25em]"
          >
            <Link to="/enquiry">Get A Quote</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            className="text-foreground p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Athletic accent strip */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-primary/10 bg-background/98 backdrop-blur-md animate-fade-in">
          <div className="container py-6 flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group relative px-3 py-3 font-display text-sm font-bold uppercase tracking-[0.25em] border-l-2 transition-all duration-300",
                    active
                      ? "border-primary text-foreground bg-muted/40"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/60 hover:bg-muted/20"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    {link.label}
                  </span>
                </Link>
              );
            })}
            <Button
              asChild
              variant="hero"
              className="mt-4 rounded-full tracking-[0.25em]"
              onClick={() => setOpen(false)}
            >
              <Link to="/enquiry">Get A Quote</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
