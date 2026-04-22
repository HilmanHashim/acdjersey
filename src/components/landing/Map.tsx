import { useInView } from "@/hooks/use-in-view";

const Map = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section className="py-20 bg-card">
      <div ref={ref} className="container">
        <h2 className={`text-4xl font-display text-gradient text-center mb-10 reveal ${inView ? "in-view" : ""}`}>Find Us</h2>
        <div
          className={`rounded-lg overflow-hidden border border-border aspect-video max-w-4xl mx-auto reveal ${inView ? "in-view" : ""}`}
          style={{ animationDelay: "0.15s" }}
        >
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5347.682213332698!2d101.52070847611866!3d3.2171282527286515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc5b9be84e28f9%3A0xfcfde2aec34bc253!2sACD%20Jersey%20HQ!5e1!3m2!1sen!2smy!4v1775117788417!5m2!1sen!2smy" title="ACD Jersey HQ Location" width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
            }}
          />
        </div>
        <p className={`text-center text-muted-foreground text-sm mt-4 reveal ${inView ? "in-view" : ""}`} style={{ animationDelay: "0.3s" }}>
          U17, H, Aman Putri, 6-17-1A, Jalan Aman Damai, 40160 Shah Alam, Selangor
        </p>
      </div>
    </section>
  );
};

export default Map;
