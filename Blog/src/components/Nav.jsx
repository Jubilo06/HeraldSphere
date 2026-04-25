import React from 'react'
import { useState, useContext } from 'react'
import { AuthContext } from './AuthContext';
import { Link, NavLink } from 'react-router-dom';

function Nav() {
    const { isAuthenticated, isAdmin, logout, user, register, login } = useContext(AuthContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const categories = ['Science', 'Business', 'Technology', 'Health', 'Sports', 'Opinion'];
    const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
    }`;
//   return (
//         <nav className='flex  w-full h-25' >
//             <img src='/logo.webp' className='w-20 h-20 ' />  
//             <div className='grid grid-cols-5 w-100 border-amber-600 border-2'>
//                 <NavLink to="/">Home</NavLink>
//                 <NavLink to="/posts">All Posts</NavLink> {/* Public blog list */}
//                 {/* {categories.map(cat => (
//                 <Link 
//                 key={cat} 
//                 to={`/posts/category/${cat}`}
//                 className="px-4 py-2 bg-gray-200 rounded-full hover:bg-blue-500 hover:text-white whitespace-nowrap"
//                 >
//                 {cat}
//                 </Link>
//             ))} */}
//             {/* DROPDOWN CATEGORY MENU */}
//             <div 
//             className=" pr-4 group"
//             onMouseEnter={() => setIsDropdownOpen(true)}
//             onMouseLeave={() => setIsDropdownOpen(false)}
//             >
//             {/* The "Button" that looks like a NavLink */}
//             <button 
//                 className="flex items-center font-bold hover:text-blue-600 focus:outline-none"
//                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             >
//                 Categories
//                 <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                 </svg>
//             </button>

//             {/* The Actual Dropdown Menu */}
//             {isDropdownOpen && (
//                 <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 shadow-xl rounded-lg py-2">
//                 {categories.map((cat) => (
//                     <Link
//                     key={cat}
//                     to={`/posts/category/${cat}`}
//                     className="block px-4 py-2 text-gray-700 hover:bg-blue-500 hover:text-white transition-colors"
//                     onClick={() => setIsDropdownOpen(false)} // Close menu after clicking
//                     >
//                     {cat}
//                     </Link>
//                 ))}
//                 <div className="border-t border-gray-100 my-1"></div>
//                 <Link 
//                     to="/posts" 
//                     className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
//                     onClick={() => setIsDropdownOpen(false)}
//                 >
//                     View All
//                 </Link>
//                 </div>
//             )}
//             </div>

//         {isAuthenticated ? (
//           <>
//             <li style={{ marginLeft: 'auto', marginRight: '10px', fontWeight: 'bold' }}>
//               Welcome, {user?.username}! ({user?.role})
//             </li>
//             {isAdmin && <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>}
//             {/* Link for non-admin content writers to their dashboard */}
//             {!isAdmin && <li><Link to="/writer/dashboard">My Contributions</Link></li>} 
//             <li><button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>Logout</button></li>
//           </>
//         ) : (
//           <>
//             <NavLink to="/login" className='ml-6'>Login</NavLink>
//             <NavLink to="/register">Register</NavLink>
//           </>
//         )}
//       </div>
//     </nav>

//   )
// }

// export default Nav
return(
<nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* LEFT SIDE: Logo & Main Desktop Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="shrink-0">
              <img src="/logo.webp" alt="Logo" className="w-16 h-16 object-contain" />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/" className={navLinkClass}>Home</NavLink>
              <NavLink to="/posts" className={navLinkClass}>All Posts</NavLink>

              {/* DROPDOWN: Categories */}
              <div 
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Categories
                  <svg className={`ml-1 w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-2 z-50">
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/posts/category/${cat}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {cat}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link to="/posts" className="block px-4 py-2 text-xs font-bold text-blue-600 hover:bg-gray-50 text-center">View All</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Auth / User Info */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 italic">
                  Hi, <span className="font-bold text-gray-900">{user?.username}</span>
                </span>
                
                {isAdmin ? (
                  <Link to="/admin/dashboard" className="text-sm font-medium text-indigo-600 hover:underline">Admin</Link>
                ) : (
                  <Link to="/writer/dashboard" className="text-sm font-medium text-indigo-600 hover:underline">Dashboard</Link>
                )}

                <button 
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">Login</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-md">Register</Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-2 shadow-inner">
          <NavLink to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/posts" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>All Posts</NavLink>
          
          <div className="py-2">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categories</p>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {categories.slice(0, 4).map(cat => (
                <Link key={cat} to={`/posts/category/${cat}`} className="px-3 py-1 text-sm text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>{cat}</Link>
              ))}
            </div>
          </div>

          <hr className="border-gray-100 my-2" />

          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="px-3 py-2 text-sm text-gray-500 italic">User: {user?.username}</div>
              {isAdmin ? (
                <Link to="/admin/dashboard" className="block px-3 py-2 text-base font-medium text-indigo-600" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
              ) : (
                <Link to="/writer/dashboard" className="block px-3 py-2 text-base font-medium text-indigo-600" onClick={() => setIsMobileMenuOpen(false)}>My Contributions</Link>
              )}
              <button onClick={logout} className="w-full text-left px-3 py-2 text-base font-medium text-red-600">Logout</button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link to="/login" className="text-center px-3 py-2 rounded-md text-base font-medium text-gray-700 border border-gray-200" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="text-center px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Nav;