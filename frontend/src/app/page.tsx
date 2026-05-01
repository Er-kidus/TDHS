'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Users, Shield, Activity, Heart, Clock, CheckCircle, AlertTriangle, TrendingUp, Package, BarChart3, Star, Award, Zap } from 'lucide-react';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Professional Medical Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    MedCore Pro
                  </h1>
                  <p className="text-slate-600 text-sm mt-1">
                    National Pharmacy Management System
                  </p>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-2">
              <Link
                href="/login"
                className="text-slate-600 hover:text-blue-600 font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:bg-blue-50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center space-y-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-2xl shadow-lg text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-white" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Healthcare Excellence
                </h2>
              </div>
              <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6">
                <p className="text-slate-700 text-lg leading-relaxed mb-6">
                  Advanced pharmacy management system designed for modern healthcare facilities.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="text-center">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-slate-800">10,000+</h3>
                      <p className="text-slate-600 text-sm">Healthcare Providers</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-slate-800">99.9%</h3>
                      <p className="text-slate-600 text-sm">Uptime Guarantee</p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-8c4e6c5a5a?auto=format&fit=crop&w=800&q=80"
                  alt="Pharmacy Management"
                  className="w-full h-96 object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Comprehensive Pharmacy Solutions
            </h2>
            <p className="text-slate-600 text-lg max-w-3xl mx-auto">
              Everything you need to manage your pharmacy operations efficiently and compliantly
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-2xl">
                <Package className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Inventory Management
                </h3>
              </div>
              <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6">
                <p className="text-slate-700 mb-6">
                  Real-time inventory tracking with low stock alerts and automated reordering.
                </p>
                <ul className="text-left text-slate-600 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span>Smart inventory tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span>Automatic reordering</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span>Expiry alerts</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-2xl">
                <Heart className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Patient Care
                </h3>
              </div>
              <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6">
                <p className="text-slate-700 mb-6">
                  Complete EMR integration with patient records and prescription history.
                </p>
                <ul className="text-left text-slate-600 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span>Digital patient records</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span>Prescription management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span>Care coordination</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-2xl">
                <BarChart3 className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Analytics & Reports
                </h3>
              </div>
              <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6">
                <p className="text-slate-700 mb-6">
                  Comprehensive analytics dashboard with real-time insights and compliance reporting.
                </p>
                <ul className="text-left text-slate-600 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span>Real-time analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span>Compliance reporting</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span>Business insights</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900">500K+</div>
                <p className="text-slate-600">Prescriptions Processed</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900">50K+</div>
                <p className="text-slate-600">Active Patients</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900">10M+</div>
                <p className="text-slate-600">Medications Tracked</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900">24/7</div>
                <p className="text-slate-600">Support Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Pharmacy?
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Join thousands of healthcare providers who trust MedCore Pro for their pharmacy Management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
              >
                Start Free Trial
              </Link>
              <Link
                href="#demo"
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 text-lg font-semibold border-2 border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <p className="text-slate-400 text-sm">MedCore Pro Pharmacy Management</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Inventory Management</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Patient Records</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Prescription Processing</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Analytics & Reporting</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Compliance Management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <p className="text-slate-400 text-sm">2024 MedCore Pro. All rights reserved.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">support@medcorepro.com</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">1-800-PHARMACY</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">24/7 Support</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Live Chat Available</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              2024 MedCore Pro. Trusted by healthcare providers nationwide. | HIPAA Compliant | SOC2 Certified
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
