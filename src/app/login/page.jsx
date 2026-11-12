'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shirt, Lock, Mail, User, Building, Home, Phone, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { readApiResponse } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Register form state
  const [regForm, setRegForm] = useState({
    name: '',
    registrationNumber: '',
    email: '',
    password: '',
    hostel: '',
    block: '',
    roomNumber: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail
        ? { email: identifier, password }
        : { registrationNumber: identifier, password };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await readApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      setSuccessMsg('Login successful! Redirecting...');
      setTimeout(() => {
        if (data.user?.role === 'staff' || data.user?.role === 'admin') {
          router.push('/staff/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      }, 500);
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (regForm.password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);

    try {
      const { confirmPassword: _confirmPassword, ...registrationData } = regForm;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      const data = await readApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccessMsg('Account registered successfully! Redirecting to student dashboard...');
      setTimeout(() => {
        router.push('/student/dashboard');
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon */}
        <div className="w-14 h-14 bg-[#1b4332] text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Shirt size={28} />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
          LaundryMate Portal
        </h2>
        <p className="mt-1 text-center text-xs text-gray-500">
          Hostel Laundry Management System
        </p>

      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-2xl sm:px-10">
          {/* Tabs for Login vs Register */}
          <div className="flex border-b border-gray-100 mb-6">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition ${
                tab === 'login'
                  ? 'border-[#1b4332] text-[#1b4332]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition ${
                tab === 'register'
                  ? 'border-[#1b4332] text-[#1b4332]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Student Register
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5 text-xs text-green-700">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email or Registration Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={17} />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Your email or registration number"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332] focus:border-[#1b4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-gray-400" size={17} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332] focus:border-[#1b4332]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="e.g. Aarav Patel"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Registration No.
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.registrationNumber}
                    onChange={(e) => setRegForm({ ...regForm, registrationNumber: e.target.value })}
                    placeholder="2023BCE0101"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="9123456780"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Student Email
                </label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="aarav@student.edu"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hostel</label>
                  <input
                    type="text"
                    required
                    value={regForm.hostel}
                    onChange={(e) => setRegForm({ ...regForm, hostel: e.target.value })}
                    placeholder="Hostel name"
                    className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Block / Wing</label>
                  <input
                    type="text"
                    required
                    value={regForm.block}
                    onChange={(e) => setRegForm({ ...regForm, block: e.target.value })}
                    placeholder="Block or wing"
                    className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Room No.</label>
                  <input
                    type="text"
                    required
                    value={regForm.roomNumber}
                    onChange={(e) => setRegForm({ ...regForm, roomNumber: e.target.value })}
                    placeholder="Room number"
                    className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                    minLength={8}
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition disabled:opacity-60"
              >
                {loading ? 'Creating Student Account...' : 'Register as Student'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
