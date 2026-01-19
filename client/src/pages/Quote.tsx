import Header from "@/components/Header";
import QuoteCalculator from "@/components/QuoteCalculator";

export default function Quote() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Header />

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-lg text-gray-600 mb-4">How it works:</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
              We calculate your rate in real time, so you can get covered in 10 minutes
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Answer a few simple questions and get your personalized quote instantly. No medical exam required.
            </p>
          </div>

          <QuoteCalculator />
        </div>
      </section>
    </div>
  );
}
