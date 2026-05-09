import React from 'react'

function About() {
     const founder = {
    name: "Amusan Temiloluwa",
    role: "Editor-in-Chief & Founder",
    image: "hero1.webp", // Replace with your actual profile picture path
    bio: "A visionary digital developer dedicated to uncovering the stories that shape our global landscape. With a background in technology and culture, Temmy founded Herald Sphere to bridge the gap between complex global events and the digital audience."
  };
  return (
    <div className="bg-white min-h-screen">
      {/* HERO SECTION */}
      <section className="relative py-20 bg-slate-950 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-indigo-400 font-bold uppercase tracking-[0.4em] text-xs mb-4">Our Essence</h2>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            The Voice of the <span className="text-indigo-500">Sphere.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
            Herald Sphere is more than a blog. It is a digital platform for those who seek to understand the pulse of our changing world.
          </p>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-3xl font-black text-slate-900 mb-6">Integrity in every <span className="text-indigo-600">byte.</span></h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Founded in 2026, Herald Sphere emerged from a simple realization: in an era of noise, clarity is the ultimate luxury. We cut through the static to deliver curated insights across Science, Technology, Business, Sports, Health and other important Topics.
            </p>
            <div className="space-y-4">
              {['Global Perspectives', 'Unbiased Reporting', 'Deep Analysis'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                  <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-100 rounded-3xl h-100 flex items-center justify-center border border-slate-200 shadow-inner">
             {/* Large Icon or Brand Graphic */}
             <span className="text-8xl font-black text-slate-200 select-none">HERALD</span>
          </div>
        </div>
      </section>

      {/* FOUNDER SECTION */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-[0.3em] mb-3">The Visionary</h2>
          <h3 className="text-4xl font-black text-slate-900">Behind the Sphere</h3>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-[3rem] shadow-xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 border border-slate-100">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <img 
                src={founder.image} 
                alt={founder.name} 
                className="relative w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-8 border-slate-50 shadow-lg"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-3xl font-black text-slate-900 mb-1">{founder.name}</h4>
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-6">{founder.role}</p>
              <p className="text-slate-500 leading-relaxed italic">
                "{founder.bio}"
              </p>
              <div className="mt-8 flex justify-center md:justify-start gap-4">
                {/* Social links placeholder */}
                {/* <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-indigo-600 transition cursor-pointer font-bold">in</div> */}
                {/* <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-indigo-600 transition cursor-pointer font-bold">X</div> */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About