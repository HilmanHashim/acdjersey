import { Facebook, Instagram } from "lucide-react";

const Footer = () => (
  <footer className="py-10 bg-card border-t border-border">
    <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <p className="font-display text-xl text-gradient">ACD Jersey HQ</p>
        <p className="text-muted-foreground text-sm">Premium Sublimation Apparel · Shah Alam</p>
      </div>
      <div className="flex gap-4">
        <a href="https://www.facebook.com/p/ACD-Apparel-61558680565284/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
          <Facebook className="h-5 w-5" />
        </a>
        <a href="https://www.instagram.com/acdjersey/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
          <Instagram className="h-5 w-5" />
        </a>
        <a href="https://www.tiktok.com/@acdjersey" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.86a8.27 8.27 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.27z"/></svg>
        </a>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-muted-foreground text-xs">© 2026 ACD Jersey HQ. All rights reserved.</p>
        <a href="/crm" className="text-muted-foreground/40 hover:text-muted-foreground text-[10px] transition-colors">Admin</a>
      </div>
    </div>
  </footer>
);

export default Footer;
