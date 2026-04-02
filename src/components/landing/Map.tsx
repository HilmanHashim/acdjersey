const Map = () => (
  <section className="py-20 bg-card">
    <div className="container">
      <h2 className="text-4xl font-display text-gradient text-center mb-10">Find Us</h2>
      <div className="rounded-lg overflow-hidden border border-border aspect-video max-w-4xl mx-auto">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.2!2d101.6!3d3.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAman+Putri%2C+Shah+Alam!5e0!3m2!1sen!2smy!4v1700000000000"
          title="ACD Jersey HQ Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <p className="text-center text-muted-foreground text-sm mt-4">
        U17, H, Aman Putri, 6-17-1A, Jalan Aman Damai, 40160 Shah Alam, Selangor
      </p>
    </div>
  </section>
);

export default Map;
