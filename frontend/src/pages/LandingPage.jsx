
import React from 'react';
import { ArrowRight, Check, Mail, Calendar, Grid, Shield, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Grid className="w-8 h-8 text-emerald-800" />
          <span className="text-xl font-semibold text-emerald-800">Aflow</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-gray-600 hover:text-gray-900">Product</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Use Case</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Solutions</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Careers</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-700 hover:text-gray-900">Login</button>
          <button className="bg-emerald-800 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-emerald-50 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-white rounded-full px-4 py-1 mb-6">
            <span className="text-sm font-medium">#1 Workflow Automation Tools</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Harness the Power ⚡ of Automation<br />
            to Optimize Your Business 💼
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Eliminate manual tasks and optimize your processes with our workflow
            automation solution. Save time, reduce errors, and improve efficiency.
          </p>
          <button className="bg-emerald-800 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-emerald-700 inline-flex items-center gap-2">
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-8 rounded-xl">
            <h3 className="text-2xl font-semibold mb-4">Loop and Branch</h3>
            <p className="text-gray-600 mb-4">
              The workflow automation process can be enhanced by adding more branches.
            </p>
            <div className="flex items-center gap-4">
              <Mail className="w-8 h-8 text-emerald-800" />
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <Calendar className="w-8 h-8 text-emerald-800" />
            </div>
          </div>
          
          <div className="bg-emerald-800 text-white p-8 rounded-xl">
            <h3 className="text-2xl font-semibold mb-4">500K++</h3>
            <p className="opacity-90">
              A lot of tasks have been automated and our users are able to work more
              efficiently.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-xl">
            <h3 className="text-2xl font-semibold mb-4">The Best Security</h3>
            <p className="text-gray-600">
              Aflow is a Trusted Cloud certified service.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-800" />
              <span className="text-sm">All connected data are save</span>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-xl">
            <h3 className="text-2xl font-semibold mb-4">400+ Apps Integration</h3>
            <p className="text-gray-600">
              Aflow supports more apps than any other platform.
            </p>
            <div className="mt-4 grid grid-cols-6 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-emerald-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Transparent pricing 💰 for automation
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-800" />
                <span>Multiple step</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-800" />
                <span>Include code editor</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-800" />
                <span>Unlimited automation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-800" />
                <span>Custom notifications</span>
              </div>
            </div>
            <div className="bg-emerald-800 text-white p-8 rounded-xl">
              <div className="text-sm mb-2">Professional</div>
              <div className="text-4xl font-bold mb-4">$20.9 <span className="text-lg font-normal">/Month</span></div>
              <p className="opacity-90">Take your business to new heights with our professional pricing plan for workflow automation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-gray-900">About us</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">Blog</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">Careers</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">Press</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-gray-900">Contact us</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">Online Chat</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">Whatsapp</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">Telegram</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">FAQ</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-gray-900">Account</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">Workflow</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">Payments</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">Returns</a>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Grid className="w-6 h-6 text-emerald-800" />
                <span className="font-semibold text-emerald-800">Aflow</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Be the first one to know about discounts, offers, news, giveaways and events
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              © 2023. All Rights Reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
