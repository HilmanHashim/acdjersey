import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send, Sparkles } from "lucide-react";

const jerseyTypes = [
  "Running Jersey",
  "Football Jersey",
  "Cycling Jersey",
  "Corporate Polo",
  "Baju Sukan",
  "Hoodie",
  "Jacket",
  "Custom Design",
  "Others",
];

type CustomDesignState = {
  jerseyType: string;
  jerseyTypeLabel: string;
  summary: string;
  previewDataUrl: string;
};

const Enquiry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const customDesign = (location.state as { customDesign?: CustomDesignState } | null)?.customDesign || null;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    organisation: customDesign ? customDesign.summary : "",
    estimated_quantity: "",
    jersey_type: customDesign ? "Custom Design" : "",
  });

  useEffect(() => {
    if (customDesign) {
      setForm((f) => ({
        ...f,
        organisation: customDesign.summary,
        jersey_type: "Custom Design",
      }));
    }
  }, [customDesign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please fill in your name and phone number");
      return;
    }
    const phoneDigits = form.phone.replace(/[^0-9]/g, "");
    if (!phoneDigits.startsWith("6") || phoneDigits.length < 10) {
      toast.error("Phone number must start with country code 6 (e.g. 60195716707)");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("enquiries").insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        organisation: form.organisation.trim() || null,
        estimated_quantity: form.estimated_quantity ? parseInt(form.estimated_quantity) : null,
        jersey_type: form.jersey_type || null,
      });
      if (error) throw error;
      navigate("/enquiry-submitted");
    } catch (err: any) {
      toast.error("Failed to submit enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Navbar />
      <section className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg space-y-8 animate-slide-up">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-display text-gradient title-glow inline-block">Get A Quote</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Interested in custom jerseys? Fill in the form below and our team will get back to you!
            </p>
          </div>

          {customDesign && (
            <div className="bg-card border-2 border-accent/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <p className="font-display uppercase tracking-[0.2em] text-xs text-accent">
                  Your Custom Design
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <img
                  src={customDesign.previewDataUrl}
                  alt="Your custom jersey design"
                  className="w-24 h-30 object-contain rounded-md border border-border bg-muted/30"
                />
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans flex-1">
                  {customDesign.summary}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground">
                Your design details have been added to the form below — just fill in your contact info!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Your Name *</label>
              <Input
                placeholder="e.g. Ahmad Razif"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Your Phone Number *</label>
              <Input
                placeholder="e.g. 60123456789"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                maxLength={20}
                pattern="^\+?6[0-9]{9,}$"
                title="Phone number must start with country code 6 (e.g. 60195716707)"
              />
              <p className="text-xs text-muted-foreground">Must start with country code 6, e.g. 60195716707 (not 0195716707)</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Organisation / Team</label>
              <Input
                placeholder="e.g. Falcon FC"
                value={form.organisation}
                onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                maxLength={200}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Estimation of Quantity</label>
              <Input
                type="number"
                placeholder="e.g. 50"
                min="1"
                value={form.estimated_quantity}
                onChange={(e) => setForm({ ...form, estimated_quantity: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Jersey / Shirt Type</label>
              <Select value={form.jersey_type} onValueChange={(v) => setForm({ ...form, jersey_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {jerseyTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={loading}>
              <Send className="h-5 w-5 mr-2" />
              {loading ? "Submitting..." : "Submit Now — We'll Contact You!"}
            </Button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Enquiry;
