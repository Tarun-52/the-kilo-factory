"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { Phone, Mail, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-ivory pb-16 md:pb-0">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 md:py-16">
        {/* Back Button (Visible on Mobile) */}
        <button 
          onClick={() => router.back()}
          className="md:hidden flex items-center gap-2 text-gray-600 mb-6 font-medium hover:text-maroon transition-colors"
        >
          <ArrowLeft className="size-4" /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="font-royal text-4xl md:text-5xl font-bold text-maroon mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question about an order, a bulk inquiry, or just want to say hello? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-maroon rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="size-5 text-ivory" />
              </div>
              <div>
                <h3 className="font-royal text-lg text-bark font-semibold">Call Us</h3>
                <p className="text-gray-600 text-sm mt-1">For support & order inquiries</p>
                {/* UPDATED PHONE NUMBER */}
                <a href="tel:+919044865050" className="text-maroon font-medium hover:underline">+91 90448 65050</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-maroon rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="size-5 text-ivory" />
              </div>
              <div>
                <h3 className="font-royal text-lg text-bark font-semibold">Email Us</h3>
                <p className="text-gray-600 text-sm mt-1">For bulk orders & catering</p>
                <a href="mailto:support@thekilofactory.com" className="text-maroon font-medium hover:underline">support@thekilofactory.com</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-maroon rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="size-5 text-ivory" />
              </div>
              <div>
                <h3 className="font-royal text-lg text-bark font-semibold">Our Kitchen</h3>
                <p className="text-gray-600 text-sm mt-1">123 Culinary Street, Food District,</p>
                <p className="text-gray-600 text-sm">Mumbai, Maharashtra 400001</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-maroon rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="size-5 text-ivory" />
              </div>
              <div>
                <h3 className="font-royal text-lg text-bark font-semibold">Operating Hours</h3>
                <p className="text-gray-600 text-sm mt-1">Monday - Sunday</p>
                <p className="text-gray-600 text-sm">11:00 AM - 11:00 PM</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-royal text-2xl text-bark mb-4">Send a Message</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent! We will get back to you soon.'); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea required rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="w-full bg-maroon text-ivory font-bold py-3 rounded-lg hover:bg-maroon/90 transition-colors cursor-pointer">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}