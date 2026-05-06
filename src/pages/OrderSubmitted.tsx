import { useSearchParams, Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const OrderSubmitted = () => {
  const [params] = useSearchParams();
  const orderNumber = params.get("order");
  useEffect(() => { document.title = "Order Submitted – ACD Jersey"; }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container max-w-2xl py-20 text-center space-y-6">
        <CheckCircle2 className="h-16 w-16 text-accent mx-auto" />
        <h1 className="text-3xl md:text-4xl font-display text-gradient">Order Received!</h1>
        {orderNumber && (
          <p className="text-sm text-muted-foreground">
            Order Number: <span className="font-mono text-foreground">{orderNumber}</span>
          </p>
        )}
        <p className="text-muted-foreground">
          Thank you! Our team will contact you shortly to confirm payment and shipping details.
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Button asChild variant="outline"><Link to="/shop">Continue Shopping</Link></Button>
          <Button asChild variant="hero"><Link to="/">Back Home</Link></Button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default OrderSubmitted;
