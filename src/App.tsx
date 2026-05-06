import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index.tsx";
import CRM from "./pages/CRM.tsx";
import Agents from "./pages/Agents.tsx";
import AboutUs from "./pages/AboutUs.tsx";
import Catalogue from "./pages/Catalogue.tsx";
import CatalogueCategory from "./pages/CatalogueCategory.tsx";
import Enquiry from "./pages/Enquiry.tsx";
import Shop from "./pages/Shop.tsx";
import ShopProduct from "./pages/ShopProduct.tsx";
import Checkout from "./pages/Checkout.tsx";
import OrderSubmitted from "./pages/OrderSubmitted.tsx";
// TEMP HIDDEN — uncomment to re-enable the Customize page
// import Customize from "./pages/Customize.tsx";
import EnquirySubmitted from "./pages/EnquirySubmitted.tsx";
import NotFound from "./pages/NotFound.tsx";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import FacebookPixel from "./components/FacebookPixel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <ScrollToTopButton />
          <FacebookPixel />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/catalogue/:slug" element={<CatalogueCategory />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:slug" element={<ShopProduct />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-submitted" element={<OrderSubmitted />} />
            {/* TEMP HIDDEN — uncomment to re-enable the Customize route */}
            {/* <Route path="/customize" element={<Customize />} /> */}
            <Route path="/enquiry" element={<Enquiry />} />
            <Route path="/enquiry-submitted" element={<EnquirySubmitted />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
