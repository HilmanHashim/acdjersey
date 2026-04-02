import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const agents = [
  {
    name: "Mr. Munir",
    phone: "60193396681",
    displayPhone: "019-339 6681",
    role: "Sales Manager",
  },
  {
    name: "Agent 2",
    phone: "60193396681",
    displayPhone: "019-339 6681",
    role: "Sales Executive",
  },
  {
    name: "Agent 3",
    phone: "60193396681",
    displayPhone: "019-339 6681",
    role: "Sales Executive",
  },
];

const Agents = () => (
  <div className="min-h-screen bg-background">
    <div className="surface-dark py-12">
      <div className="container">
        <Link to="/" className="text-muted-foreground hover:text-foreground text-sm mb-6 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-display text-gradient mb-3">Contact Our Team</h1>
        <p className="text-surface-dark-foreground/70 max-w-lg">
          Reach out to any of our agents directly via WhatsApp for enquiries, quotations, or orders.
        </p>
      </div>
    </div>

    <section className="py-16">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {agents.map((agent) => (
            <Card key={agent.name} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-2xl font-display text-foreground">
                    {agent.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">{agent.name}</h3>
                  <p className="text-muted-foreground text-sm">{agent.role}</p>
                  <p className="text-muted-foreground text-sm mt-1">{agent.displayPhone}</p>
                </div>
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <a href={`https://wa.me/${agent.phone}`} target="_blank" rel="noopener noreferrer">
                    <Phone className="mr-2 h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Agents;
