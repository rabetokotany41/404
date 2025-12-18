import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  UserPlus, 
  CheckCircle,
  Phone,
  Globe,
  Building,
  Briefcase,
  Sparkles,
  Trophy,
  Zap,
  Users
} from 'lucide-react';

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form
  const [hoverEffect, setHoverEffect] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value)) strength += 25;
      if (/[^A-Za-z0-9]/.test(value)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const getStrengthColor = (strength) => {
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-accent-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (!agreed) {
      alert('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          company: formData.company || null,
          position: formData.position || null,
          industry: formData.industry || null,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userData', JSON.stringify(data.user));
        const role = data.user.role || 'user';
        localStorage.setItem('userRole', role);
        
        if (onLogin) {
          onLogin(data.user);
        }
      } else {
        alert(data.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-primary-300/20 to-accent-300/20 rounded-full blur-3xl dark:from-primary-500/10 dark:to-accent-500/10"></div>
        <div className="absolute bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-secondary-300/20 to-primary-300/20 rounded-full blur-3xl dark:from-secondary-500/10 dark:to-primary-500/10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-accent-300/10 to-secondary-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Benefits */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="relative bg-gradient-to-br from-white/80 to-white/20 dark:from-neutral-900/80 dark:to-neutral-900/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-neutral-800/50 overflow-hidden">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shine"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-accent-500 to-primary-500 flex items-center justify-center shadow-lg">
                      <Trophy className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-600 to-primary-600 bg-clip-text text-transparent">
                        Premium Features
                      </h1>
                      <p className="text-neutral-600 dark:text-neutral-400">Unlock exclusive benefits</p>
                    </div>
                  </div>

                  {/* Progress Steps */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Registration Progress
                      </div>
                      <div className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        Step {step} of 3
                      </div>
                    </div>
                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className={`text-xs ${step >= 1 ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-neutral-500'}`}>
                        Personal Info
                      </div>
                      <div className={`text-xs ${step >= 2 ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-neutral-500'}`}>
                        Company Details
                      </div>
                      <div className={`text-xs ${step >= 3 ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-neutral-500'}`}>
                        Security
                      </div>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 rounded-2xl p-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center mb-3">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Lightning Fast</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Instant access to all features</p>
                    </div>

                    <div className="bg-gradient-to-br from-accent-50 to-accent-100/50 dark:from-accent-900/30 dark:to-accent-800/20 rounded-2xl p-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 flex items-center justify-center mb-3">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">AI Powered</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Smart recommendations</p>
                    </div>

                    <div className="bg-gradient-to-br from-secondary-50 to-secondary-100/50 dark:from-secondary-900/30 dark:to-secondary-800/20 rounded-2xl p-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 flex items-center justify-center mb-3">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Team Ready</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Collaborate seamlessly</p>
                    </div>

                    <div className="bg-gradient-to-br from-primary-50/50 to-accent-50/50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center mb-3">
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Global Access</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Available worldwide</p>
                    </div>
                  </div>

                  {/* Testimonials */}
                  <div className="mt-8 pt-8 border-t border-neutral-200/50 dark:border-neutral-800/50">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                        <span className="font-bold text-white">JD</span>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">
                          "The registration process was seamless. I was up and running in minutes!"
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">— John Doe, CEO at TechCorp</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 h-20 w-20 bg-gradient-to-r from-accent-400 to-primary-400 rounded-2xl rotate-12 opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-2xl -rotate-12 opacity-20 blur-xl"></div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="relative">
            <div className={`relative bg-gradient-to-br from-white/90 to-white/70 dark:from-neutral-900/90 dark:to-neutral-900/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-neutral-800/50 transition-all duration-500 ${hoverEffect ? 'scale-[1.02]' : ''}`}
                 onMouseEnter={() => setHoverEffect(true)}
                 onMouseLeave={() => setHoverEffect(false)}>
              
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-accent-500/20 via-primary-500/20 to-secondary-500/20 rounded-3xl blur-xl opacity-70"></div>
              
              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-accent-500 to-primary-500 mb-4 shadow-lg">
                    <UserPlus className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
                    Join Our Community
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                    Create your premium account in {3 - step} steps
                  </p>
                </div>

                {/* Multi-step Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Step 1: Personal Info */}
                  {step === 1 && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="group">
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            First Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                              name="firstName"
                              type="text"
                              required
                              value={formData.firstName}
                              onChange={handleChange}
                              className="pl-12 block w-full px-4 py-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-all duration-300"
                              placeholder="John"
                            />
                          </div>
                        </div>

                        <div className="group">
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Last Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                              name="lastName"
                              type="text"
                              required
                              value={formData.lastName}
                              onChange={handleChange}
                              className="pl-12 block w-full px-4 py-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-all duration-300"
                              placeholder="Doe"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                          </div>
                          <input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-12 block w-full px-4 py-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-all duration-300"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                          </div>
                          <input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            className="pl-12 block w-full px-4 py-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-all duration-300"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Company Details */}
                  {step === 2 && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="group">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Company Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                          </div>
                          <input
                            name="company"
                            type="text"
                            value={formData.company}
                            onChange={handleChange}
                            className="pl-12 block w-full px-4 py-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-all duration-300"
                            placeholder="TechCorp Inc."
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Position/Role
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Briefcase className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                          </div>
                          <input
                            name="position"
                            type="text"
                            value={formData.position}
                            onChange={handleChange}
                            className="pl-12 block w-full px-4 py-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-all duration-300"
                            placeholder="Software Engineer"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Industry
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Globe className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                          </div>
                          <select
                            className="pl-12 block w-full px-4 py-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-all duration-300 appearance-none"
                          >
                            <option value="">Select Industry</option>
                            <option value="tech">Technology</option>
                            <option value="finance">Finance</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                            <option value="other">Other</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Security */}
                  {step === 3 && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="group">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                          </div>
                          <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-12 pr-12 block w-full px-4 py-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-all duration-300"
                            placeholder="Create a strong password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                            ) : (
                              <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                            )}
                          </button>
                        </div>
                        
                        {/* Password Strength */}
                        {formData.password && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-neutral-600 dark:text-neutral-400">Password Strength</span>
                              <span className={`text-xs font-bold ${passwordStrength < 50 ? 'text-red-500' : passwordStrength < 75 ? 'text-yellow-500' : 'text-accent-500'}`}>
                                {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Good' : 'Strong'}
                              </span>
                            </div>
                            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getStrengthColor(passwordStrength)} transition-all duration-500`}
                                style={{ width: `${passwordStrength}%` }}
                              ></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className={`flex items-center text-xs ${formData.password.length >= 8 ? 'text-accent-500' : 'text-neutral-500'}`}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Min 8 characters
                              </div>
                              <div className={`flex items-center text-xs ${/[A-Z]/.test(formData.password) ? 'text-accent-500' : 'text-neutral-500'}`}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Uppercase letter
                              </div>
                              <div className={`flex items-center text-xs ${/[0-9]/.test(formData.password) ? 'text-accent-500' : 'text-neutral-500'}`}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Number
                              </div>
                              <div className={`flex items-center text-xs ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-accent-500' : 'text-neutral-500'}`}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Special character
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                          </div>
                          <input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="pl-12 pr-12 block w-full px-4 py-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-all duration-300"
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                            ) : (
                              <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                            )}
                          </button>
                        </div>
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                          <p className="mt-2 text-sm text-accent-500 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Passwords match
                          </p>
                        )}
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="agreed"
                            name="agreed"
                            type="checkbox"
                            checked={agreed}
                            onChange={() => setAgreed(!agreed)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-colors"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="agreed" className="text-neutral-700 dark:text-neutral-300">
                            I agree to the{' '}
                            <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                              Privacy Policy
                            </Link>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 border-2 border-neutral-300 dark:border-neutral-700 rounded-2xl text-neutral-700 dark:text-neutral-300 font-medium hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
                      >
                        ← Back
                      </button>
                    ) : (
                      <div></div>
                    )}

                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium hover:from-primary-600 hover:to-accent-600 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25"
                      >
                        Continue →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading || !agreed}
                        className="group relative px-8 py-4 rounded-2xl text-white font-medium bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/25"
                      >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                          {loading ? (
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <UserPlus className="h-5 w-5 text-white" />
                          )}
                        </span>
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </button>
                    )}
                  </div>

                  {/* Login Link */}
                  <div className="text-center pt-6 border-t border-neutral-200/50 dark:border-neutral-800/50">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Already have an account?{' '}
                      <Link
                        to="/login"
                        className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors group"
                      >
                        Sign in here
                        <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-accent-400 rounded-full animate-float"></div>
      <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-primary-400 rounded-full animate-float animation-delay-1000"></div>
      <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-secondary-400 rounded-full animate-float animation-delay-2000"></div>
    </div>
  );
};

export default Register;