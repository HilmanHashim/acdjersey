import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const EnquirySubmitted = () => (
  <>
    <Navbar />
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md animate-slide-up">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-display text-gradient">Thank You!</h1>
        <p className="text-muted-foreground">
          Your enquiry has been submitted successfully. Our team will contact you shortly!
        </p>
        <Button variant="hero" asChild>
          <Link to="/enquiry">Submit Another Enquiry</Link>
        </Button>
      </div>
    </section>
    <Footer />
  </>
);

export default EnquirySubmitted;
