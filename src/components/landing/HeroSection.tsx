export function HeroSection() {
  return (
    <section className="bg-cream pt-6 pb-8 md:pt-10 md:pb-10 lg:pt-10 lg:pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy leading-tight">
            No matter where you want to go,{" "}
            <span className="text-coral">Pointly</span> gets you there
          </h1>
          <div className="mt-6">
            <a
              href="/onboarding"
              className="inline-block bg-navy text-white px-8 py-3.5 rounded-pill text-base font-semibold hover:bg-navy-dark transition-colors"
            >
              Get started
            </a>
          </div>
        </div>

        <div className="hidden md:flex justify-center lg:justify-end">
          <img
            src="/images/hero-illustration.png"
            alt="Couple choosing travel destination on a globe"
            className="w-full max-w-md lg:max-w-lg"
          />
        </div>
      </div>
    </section>
  );
}
