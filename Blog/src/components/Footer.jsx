import React from 'react'
import { useState, useRef } from 'react';
import api from './Api'
import { Link } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
function Footer() {
    const categories = ['Science', 'Business', 'Technology', 'Health', 'Sports', 'Opinion'];
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState({ type: '', msg: '' }); // 'loading', 'success', 'error'
    const [loading, setLoading] = useState(false);
    const footerRef = useRef(null);
    const socialLinks = [
    { name: 'Twitter', href: '#', icon: FaTwitter },
    { name: 'Instagram', href: '#', icon: FaInstagram },
    { name: 'LinkedIn', href: '#', icon: FaLinkedinIn },
    { name: 'Github', href: '#', icon: FaGithub },
    ];
    
    // GSAP Entrance Animation
  useGSAP(() => {
    gsap.from(".footer-col", {
      y: 50,
      opacity: 0,
      stagger: 0.2,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 90%",
      }
    });
  }, { scope: footerRef });

     const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      await api.post('/api/posts/subscribe', { email });
      setStatus({ type: 'success', msg: 'Welcome to the Sphere!' });
      setEmail('');
    } catch (err) {
       const serverMessage = err.response?.data?.message || 'Something went wrong';
      setStatus({ 
        type: 'error', 
         msg: serverMessage  
      });
      console.error("Server rejected request:", serverMessage);
    } finally {
      setLoading(false);
    }
  };
    
  // return (
  //   <footer ref={footerRef} className="bg-slate-950 text-slate-300 overflow-hidden">
  //       {/* TOP SECTION: Branding & Newsletter */}
  //     <div className="max-w-7xl mx-auto px-4 pt-16 pb-12 sm:px-6 lg:px-8">
  //       <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
  //         {/* Column 1: Branding */}
  //         <div className="col-span-1 lg:col-span-1">
  //           <Link to="/" className="flex items-center gap-3 mb-6 group">
  //             <img src="/logo.webp" alt="Logo" className="w-20 h-20 grayscale brightness-200" />
  //             <div className="flex flex-col">
  //               <span className="text-xl font-black tracking-tighter text-black">
  //                 HERALD<span className="text-indigo-500">SPHERE</span>
  //               </span>
  //               <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-slate-500">
  //                 Global Dispatch
  //               </span>
  //             </div>
  //           </Link>
  //           <p className="text-sm leading-relaxed text-slate-400 mb-8">
  //             The digital heartbeat of global stories. We bring you curated insights from the intersection of technology, culture, and business.
  //           </p>
            
  //           <div className="flex space-x-4">
  //               {socialLinks.map((social) => (
  //                   <a key={social.name} href={social.href} className="...">
  //                   <social.icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
  //                   </a>
  //               ))}
  //           </div>
  //         </div>

  //         {/* Column 2: Quick Links */}
  //         <div>
  //           <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Explore</h3>
  //           <ul className="space-y-4 text-sm">
  //             <li><Link to="/" className="hover:text-indigo-400 transition">Home</Link></li>
  //             <li><Link to="/posts" className="hover:text-indigo-400 transition">All Posts</Link></li>
  //             <li><Link to="/about" className="hover:text-indigo-400 transition">Our Story</Link></li>
  //             <li><Link to="/contact" className="hover:text-indigo-400 transition">Contact</Link></li>
  //           </ul>
  //         </div>

  //         {/* Column 3: Categories */}
  //         <div>
  //           <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Categories</h3>
  //           <ul className="grid grid-cols-1 gap-4 text-sm">
  //             {categories.map(cat => (
  //               <li key={cat}>
  //                 <Link to={`/posts/category/${cat}`} className="hover:text-indigo-400 transition">
  //                   {cat}
  //                 </Link>
  //               </li>
  //             ))}
  //           </ul>
  //         </div>

  //         {/* Column 4: Newsletter */}
  //         <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
  //           <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">The Weekly Sphere</h3>
  //           <p className="text-xs text-white mb-4">Join 25,000+ readers. Get the most important stories delivered to your inbox.</p>
  //           <form onSubmit={handleSubscribe} className="space-y-3">
  //             <input 
  //               type="email" 
  //                value={email}
  //                 onChange={(e) => setEmail(e.target.value)}
  //                 required
  //               placeholder="email@example.com" 
  //               className="w-full bg- to-blue-100 border border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
  //             />
  //             <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white 
  //             font-bold py-2.5 rounded-lg text-xs uppercase tracking-widest transition 
  //             shadow-lg shadow-indigo-600/20">
  //               {loading ? 'Processing...' : 'Secure Access'}
  //             </button>
  //              {status.msg && (
  //                 <p className={`text-[10px] font-bold uppercase tracking-tighter text-center mt-2 ${
  //                   status.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
  //                 }`}>
  //                   {status.msg}
  //                 </p>
  //               )}
  //           </form>
  //         </div>

  //       </div>
  //     </div>

  //     {/* BOTTOM BAR: Copyright & Legal */}
  //     <div className="border-t border-slate-900">
  //       <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
  //         <p className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
  //           © {new Date().getFullYear()} Herald Sphere Media Group. All rights reserved.
  //         </p>
  //         <div className="flex space-x-6 text-[10px] uppercase tracking-widest font-bold text-slate-500">
  //           <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
  //           <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
  //           <Link to="/cookies" className="hover:text-white transition">Cookies</Link>
  //         </div>
  //       </div>
  //     </div>
  //   </footer>
  // )
  return (
    <footer ref={footerRef} className="bg-slate-950 text-slate-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          
          {/* Column 1: Branding */}
          <div className="footer-col">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img src="/logo.webp" alt="Logo" className="relative w-14 h-14 brightness-200" />
              </div>
              <div className="flex flex-col border-l border-slate-800 pl-4">
                <span className="text-2xl font-black tracking-tighter text-white leading-none">
                  HERALD<span className="text-indigo-500">SPHERE</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-slate-500 mt-1">
                  Global Dispatch
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 mb-8">
              Deciphering the digital landscape. Curated insights at the intersection of technology, culture, and business.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name} 
                  href={social.href} 
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-600 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <social.icon className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="footer-col">
            <h3 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8 underline decoration-indigo-500 underline-offset-8">Explore</h3>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home Portal</Link></li>
              <li><Link to="/posts" className="hover:text-indigo-400 transition-colors">Archives</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">The Mission</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Connect</Link></li>
            </ul>
          </div>

          {/* Column 3: Topics */}
          <div className="footer-col">
            <h3 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8 underline decoration-indigo-500 underline-offset-8">Topics</h3>
            <ul className="grid grid-cols-1 gap-4 text-sm font-bold">
              {categories.map(cat => (
                <li key={cat}>
                  <Link to={`/posts/category/${cat}`} className="hover:text-indigo-400 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="footer-col relative">
            <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl">
              <h3 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-4">Newsletter</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">Join the Sphere. Get the week's most critical dispatches.</p>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                  {loading ? 'Transmitting...' : 'Join the Sphere'}
                </button>
                {status.msg && (
                  <p className={`text-[10px] font-black uppercase text-center mt-4 ${status.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {status.msg}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-600 font-black">
            © {new Date().getFullYear()} Herald Sphere Media. Global Dispatch.
          </p>
          <div className="flex space-x-8 text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer