import React from "react";

const differentiators = [
  { title: "AI Intelligence", desc: "Learns from patterns in the data to recommend better routes over time." },
  { title: "Context-Aware Routes", desc: "Factors in time of day, crowd levels, and surroundings, not just distance." },
  { title: "Data-Driven Safety", desc: "Draws on historical safety data instead of guesswork." },
  { title: "Emergency Assistance", desc: "One-tap SOS puts trusted contacts in the loop instantly." },
  { title: "Battery Awareness", desc: "Warns you before your phone dies mid-journey." },
  { title: "Nearby Safe Places", desc: "Always know where the closest police station or hospital is." },
];

const audiences = ["Students", "Travelers", "Families", "Daily Commuters"];

const AboutUs = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-cyan-400 text-sm font-medium mb-3 uppercase tracking-widest">About SafePath AI</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          Travel shouldn't just be fast.
          <br />
          It should be safer.
        </h1>
        <p className="text-white/60 max-w-xl mx-auto mb-8">
          SafePath AI is an intelligent safety-navigation platform designed to help people make
          safer travel decisions using data, AI and real-world context.
        </p>
        <button className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold">
          Explore SafePath
        </button>
      </div>

      <div className="glass rounded-2xl p-8 mb-16 text-center">
        <h2 className="text-xl font-semibold mb-3 text-cyan-400">Our Vision</h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          A future where navigation systems understand not only roads and destinations, but also
          the safety conditions surrounding every journey.
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-6 text-center">What Makes Us Different</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-16">
        {differentiators.map((d) => (
          <div key={d.title} className="glass rounded-xl p-5">
            <p className="font-medium text-cyan-400 mb-2">{d.title}</p>
            <p className="text-sm text-white/60">{d.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-6 text-center">Built for Real Life</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {audiences.map((a) => (
          <span key={a} className="glass px-5 py-3 rounded-full text-sm">
            {a}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
