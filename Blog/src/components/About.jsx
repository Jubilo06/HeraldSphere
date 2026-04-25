import React from 'react'

function About() {
  return (
    <div>
        
        <div>
        <nav className='bg-amber-300 w-full h-15 flex flex-wrap place-items-center-safe justify-around'>
            <div><a href='#'>TemmyDeBlogger</a></div>
            <ul className='flex flex-wrap justify-between  w-[320px]' >
            <li><a href='#home'>Home</a></li>
            <li><a href='#about'>About</a></li>
            <li><a href='#contact'>Contact</a></li>
            </ul>
            <div><input className='w-[50] h-[50] border round border-amber-900' type='search' /></div>
        </nav>

        <div className=' w-full h-60  justify-center place-content-center'>
            <div className='border-blue-500 w-80 flex flex-wrap justify-center  border-2  place-self-center'>
            <span className='text-3xl '>Hi I am Temiloluwa.</span> 
        <br/> A web developer and content creator</div></div> 
        
        <div className='w-full h-120  flex  justify-center place-content-center'>
            <div className='w-100 h-100 border-2 border-amber-900 place-self-center'>
            <img className='w-full h-full' src='hero1.webp' />
            </div>
        </div>
        <section className='w-full h-100 border-2 border-amber-950'>
            <div>
            <h1>Latest Post</h1>
            <ul>
                <li>Title</li>
                <li>Content</li>
                <li>Date</li>
            </ul>
            <div><button><a>&lt; View older posts</a></button></div>
            </div>
        </section>
        </div> 
        <div>No posts published yet.</div>;
        
        </div>
  )
}

export default About