import React from 'react';
// Corrected imports with valid Font Awesome icons
import { 
  FaChartLine, 
  FaBullseye, 
  FaGlobe, 
  FaRocket, 
  FaRegHandshake, 
  FaMicrophone 
} from 'react-icons/fa';

function About() {
  return (
    <div className="bg-white min-h-screen">
      {/* HERO SECTION: The Identity */}
      <section className="relative py-24 bg-slate-950 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <h2 className="text-indigo-400 font-bold uppercase tracking-[0.5em] text-xs mb-6">The Global Vanguard</h2>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter text-wrap">
            HERALD <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-400">SPHERE.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-2xl leading-relaxed max-w-3xl mx-auto font-medium">
            A premium digital ecosystem where sophisticated journalism meets the pulse of global innovation. We don't just report the news; we decipher the future.
          </p>
        </div>
      </section>

      {/* CORE OFFERINGS: Editorial Excellence */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h3 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">
              Integrity in every <span className="text-indigo-600 border-b-4 border-indigo-100">byte.</span>
            </h3>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Founded on the principles of precision and depth, Herald Sphere serves as a definitive resource for professionals, visionaries, and enthusiasts alike.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Global Insights', desc: 'Unbiased reporting from every corner of the digital frontier.', icon: <FaGlobe className="text-indigo-500 mb-2" /> },
                { title: 'Deep Analysis', desc: 'Moving beyond headlines to uncover the "why" behind the what.', icon: <FaMicrophone className="text-indigo-500 mb-2" /> },
                { title: 'Future-Proof', desc: 'Curated content designed to keep you ahead of market shifts.', icon: <FaRocket className="text-indigo-500 mb-2" /> },
                { title: 'Community', desc: 'A hub for high-level intellectual discourse.', icon: <FaRegHandshake className="text-indigo-500 mb-2" /> }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                  {item.icon}
                  <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-2">{item.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-indigo-500/10 rounded-[2.5rem] blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
            <div className="relative bg-slate-900 rounded-4xl p-12 overflow-hidden shadow-2xl min-h-100 flex flex-col justify-center border border-slate-800">
               <span className="text-slate-700 font-black text-9xl absolute -bottom-10 -right-10 opacity-20 select-none">SPHERE</span>
               <h3 className="text-white text-3xl font-black mb-4">Quality Above All.</h3>
               <p className="text-slate-400 text-sm leading-relaxed mb-6">
                 Every article published on the Sphere undergoes a rigorous editorial review to ensure that our readers receive only the most credible and impactful information.
               </p>
               <div className="flex gap-2">
                 <div className="h-1 w-20 bg-indigo-600 rounded-full"></div>
                 <div className="h-1 w-8 bg-slate-700 rounded-full"></div>
                 <div className="h-1 w-4 bg-slate-700 rounded-full"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADVERTISING SECTION */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/5 blur-[120px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-indigo-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Partnership Opportunities</h2>
            <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              Accelerate Your <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">Brand Growth.</span>
            </h3>
            <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
              Place your business in front of an engaged, global audience of decision-makers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Native Dispatches */}
            <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/10 transition-all group">
              <FaRocket className="text-indigo-500 text-4xl mb-6 mx-auto group-hover:scale-110 transition-transform" />
              <h4 className="text-white text-xl font-black mb-4 uppercase">Native Dispatches</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Integrate your brand story seamlessly within our editorial flow via sponsored dispatches.
              </p>
            </div>

            {/* Strategic Banners */}
            <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/10 transition-all group border-t-indigo-500">
              <FaChartLine className="text-indigo-500 text-4xl mb-6 mx-auto group-hover:scale-110 transition-transform" />
              <h4 className="text-white text-xl font-black mb-4 uppercase">Display Architecture</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Premium visual placement across our highest traffic articles and category archives.
              </p>
            </div>

            {/* Newsletter Access */}
            <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/10 transition-all group">
              <FaBullseye className="text-indigo-500 text-4xl mb-6 mx-auto group-hover:scale-110 transition-transform" />
              <h4 className="text-white text-xl font-black mb-4 uppercase">Direct Inboxes</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Reach our community directly through high-open-rate weekly newsletters.
              </p>
            </div>
          </div>

          {/* CTA FOR ADVERTISERS */}
          <div className="mt-20 p-12 bg-linear-to-r from-indigo-600 to-purple-600 rounded-[3rem] text-center shadow-2xl">
             <h3 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase tracking-tight">Ready to expand your reach?</h3>
             <button className="bg-white text-indigo-600 px-12 py-5 rounded-full font-black uppercase text-sm tracking-widest hover:bg-slate-100 transition-all shadow-xl hover:-translate-y-1">
                Download Media Kit
             </button>
             <p className="text-indigo-200 text-[10px] mt-6 uppercase font-bold tracking-[0.2em]">Our team responds to all inquiries within 12 hours.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;