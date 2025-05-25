'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignInAlt, 
  faInfoCircle, 
  faChartLine, 
  faBell, 
  faMobileAlt, 
  faChartBar, 
  faClipboardList, 
  faLock,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin
} from '@fortawesome/free-brands-svg-icons';

export default function Home() {
  const pathname = usePathname();
  const counterSectionRef = useRef(null);
  const backToTopRef = useRef(null);
  const navbarTogglerRef = useRef(null);
  const navbarCollapseRef = useRef(null);

  const animateCounter = (elementId, targetValue) => {
    const counterElement = document.getElementById(elementId);
    let currentValue = 0;
    const increment = Math.ceil(targetValue / 100);
    const duration = 2000;
    const interval = duration / (targetValue / increment);

    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        clearInterval(timer);
        counterElement.textContent = targetValue;
      } else {
        counterElement.textContent = currentValue;
      }
    }, interval);
  };

  useEffect(() => {
    // Handle scroll for back-to-top button
    const handleScroll = () => {
      if (window.scrollY > 300) {
        backToTopRef.current?.classList.add('opacity-100');
        backToTopRef.current?.classList.remove('opacity-0');
      } else {
        backToTopRef.current?.classList.add('opacity-0');
        backToTopRef.current?.classList.remove('opacity-100');
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for counter animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter('studentCounter', 1000);
            animateCounter('moduleCounter', 32);
            animateCounter('facultyCounter', 54);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (counterSectionRef.current) {
      observer.observe(counterSectionRef.current);
    }

    // Smooth scrolling for anchor links
    const handleAnchorClick = (e) => {
      const href = e.currentTarget.getAttribute('href');
      if (href.startsWith('#') && href !== '#') {
        e.preventDefault();
        const targetId = href.slice(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth',
          });

          // Close navbar on mobile if open
          if (navbarCollapseRef.current?.classList.contains('show')) {
            navbarTogglerRef.current?.click();
          }
        }
      }
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((anchor) => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      anchors.forEach((anchor) => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
    };
  }, []);

  return (
    <div className="font-sans bg-gray-100">
      {/* Navbar */}
      <nav className="bg-[#2c3e50] py-3 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="#home" className="flex items-center text-white text-lg font-semibold">
              <Image
                src="/images/logo.png"
                alt="College Logo"
                width={40}
                height={40}
                className="mr-2 rounded-full"
              />
              College of Science and Technology
            </Link>
            <button
              ref={navbarTogglerRef}
              className="lg:hidden text-white focus:outline-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <div ref={navbarCollapseRef} className="hidden lg:flex lg:items-center lg:ml-auto" id="navbarNav">
              <ul className="flex flex-col lg:flex-row lg:space-x-4">
                {['Home', 'Login', 'About', 'Features', 'Contact'].map((item) => (
                  <li key={item} className="nav-item">
                    <Link
                      href={item === 'Login' ? '/login' : `#${item.toLowerCase()}`}
                      className={`text-white px-4 py-2 relative hover:text-[#3498db] transition-colors duration-300 ${
                        pathname === (item === 'Login' ? '/login' : `#${item.toLowerCase()}`) ? 'after:w-full' : ''
                      } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#3498db] after:w-0 after:transition-all after:duration-300 hover:after:w-full`}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="bg-[linear-gradient(rgba(44,62,80,0.8),rgba(44,62,80,0.8)),url('/images/background.JPG')] bg-cover bg-center h-[400px] flex items-center text-white relative"
>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl animate-fadeIn">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Track Your Attendance With Ease</h1>
            <p className="text-lg md:text-xl mb-6">
              A comprehensive system for Information Technology Department students to monitor their attendance across all modules.
            </p>
            <div className="flex space-x-4">
              <Link href="/login" className="bg-[#3498db] text-white px-6 py-3 rounded hover:bg-[#2980b9] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> Login Now
              </Link>
              <Link href="#features" className="border border-white text-white px-6 py-3 rounded hover:bg-white hover:text-[#2c3e50] transition-all duration-300">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2" /> Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Counter Section */}
      <section ref={counterSectionRef} className="bg-[#2c3e50] text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'studentCounter', value: '0', text: 'Students' },
              { id: 'moduleCounter', value: '0', text: 'Modules' },
              { id: 'facultyCounter', value: '0', text: 'Faculty Members' },
            ].map((counter) => (
              <div key={counter.id} className="text-center p-5">
                <div id={counter.id} className="text-4xl font-bold text-[#3498db] mb-2">{counter.value}</div>
                <div className="text-lg">{counter.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8">
            <div>
              <h2 className="text-3xl text-black font-bold mb-4">About Our Attendance System</h2>
              <p className="text-black text-lg mb-4">
                Designed specifically for the Information Technology Department, our attendance system provides a comprehensive solution for tracking and managing student attendance.
              </p>
              <p className="text-black mb-4">
                Our system ensures that students can maintain the required 90% attendance across all six modules, helping them stay on track with their academic requirements. Faculty members can easily record attendance, while students can monitor their progress in real-time.
              </p>
              <p className='text-black'>
                The system was developed with the goal of promoting accountability and ensuring academic success through regular attendance.
              </p>
            </div>
            <div>
              <Image
                src="/images/System.png"
                alt="Attendance System Screenshot"
                width={600}
                height={400}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Key Features</h2>
          <div className="text-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: faChartLine, title: 'Real-time Attendance Tracking', text: 'Monitor your attendance in real-time across all six modules of the Information Technology Department.' },
              { icon: faBell, title: 'Attendance Alerts', text: 'Receive alerts when your attendance falls below the required 90% threshold in any module.' },
              { icon: faMobileAlt, title: 'Mobile Responsive', text: 'Access your attendance information from any device, anytime, anywhere.' },
              { icon: faChartBar, title: 'Detailed Analytics', text: 'View graphical representation of your attendance patterns and trends.' },
              { icon: faClipboardList, title: 'Module Overview', text: 'Get a comprehensive view of all modules and your attendance status for each.' },
              { icon: faLock, title: 'Secure Access', text: 'Access your attendance records securely with personal login credentials.' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-lg shadow-lg p-6 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <FontAwesomeIcon icon={feature.icon} className="text-4xl text-[#3498db] mb-4" />
                <h5 className="text-xl font-semibold mb-2">{feature.title}</h5>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl text-black font-bold mb-4">Stay on Track with Your Academic Progress</h2>
          <p className="text-lg text-black mb-6">
            Maintaining 90% attendance is essential for all modules. Login now to check your status!
          </p>
          <Link href="/login" className="bg-white text-[#2c3e50] px-6 py-3 rounded hover:bg-gray-100 transition-all duration-300">
            <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> Login Now
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 text-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {[
                { icon: faMapMarkerAlt, title: 'Address', text: 'Kharpandi, Phuntsholing Bhutan' },
                { icon: faPhone, title: 'Phone', text: '+975 17771234' },
                { icon: faEnvelope, title: 'Email', text: 'CSTcollege@attendance.com' },
              ].map((contact) => (
                <div key={contact.title} className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-[#3498db] text-white rounded-full flex items-center justify-center mr-4">
                    <FontAwesomeIcon icon={contact.icon} />
                  </div>
                  <div>
                    <h5 className="font-semibold">{contact.title}</h5>
                    <p>{contact.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2c3e50] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h5 className="text-lg font-semibold mb-2">College of Science and Technology</h5>
              <p className="mb-4">
                A comprehensive attendance tracking system for students of the Information Technology Department.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: faFacebook, name: 'facebook' },
                  { icon: faTwitter, name: 'twitter' },
                  { icon: faInstagram, name: 'instagram' },
                  { icon: faLinkedin, name: 'linkedin' }
                ].map((social) => (
                  <Link key={social.name} href="#" className="text-white text-xl hover:text-[#3498db] transition-colors duration-300">
                    <FontAwesomeIcon icon={social.icon} />
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex justify-end items-center">
              <div>
                <div className="mb-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                  Kharpandi, Phuntsholing Bhutan
                </div>
                <div className="mb-2">
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  +975 17771234
                </div>
                <div>
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  CST@collegeattendance.com
                </div>
              </div>
            </div>
          </div>
          <hr className="my-6 border-white" />
          <div className="text-center">
            <p>© 2025 College of Science and Technology. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <Link
        ref={backToTopRef}
        href="#"
        className="fixed bottom-5 right-5 bg-[#3498db] text-white w-10 h-10 rounded-full flex items-center justify-center text-lg opacity-0 transition-opacity duration-300"
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </Link>
    </div>
  );
}