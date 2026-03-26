'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface FormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  transactionId: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  category?: string;
  message?: string;
  transactionId?: string;
}

interface SubmissionState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  referenceId?: string;
  error?: string;
}

const MAX_MESSAGE_LENGTH = 1000;
const MAX_SUBJECT_LENGTH = 100;

const categories = [
  'Technical Issue',
  'Transaction Problem',
  'Account Access',
  'Security Concern',
  'General Inquiry',
  'Feature Request',
  'Bug Report'
];

export default function SupportForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    category: 'Technical Issue',
    message: '',
    transactionId: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: 'idle' });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length > MAX_SUBJECT_LENGTH) {
      newErrors.subject = `Subject must be ${MAX_SUBJECT_LENGTH} characters or less`;
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    } else if (formData.message.length > MAX_MESSAGE_LENGTH) {
      newErrors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or less`;
    }

    // Transaction ID is optional but if provided, should be valid format
    if (formData.transactionId.trim() && formData.transactionId.length < 10) {
      newErrors.transactionId = 'Transaction ID appears to be invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateReferenceId = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `NW-${timestamp}-${random}`.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmissionState({ status: 'submitting' });

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate random success/failure (90% success rate)
      if (Math.random() > 0.1) {
        const referenceId = generateReferenceId();
        setSubmissionState({
          status: 'success',
          referenceId
        });
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: 'Technical Issue',
          message: '',
          transactionId: ''
        });
      } else {
        throw new Error('Network error occurred');
      }
    } catch (error) {
      setSubmissionState({
        status: 'error',
        error: 'Failed to submit support request. Please try again later.'
      });
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setSubmissionState({ status: 'idle' });
    setErrors({});
  };

  if (submissionState.status === 'success') {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Support Request Submitted!</h2>
          <p className="text-slate-300 mb-4">
            Your support request has been successfully submitted.
          </p>
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-400 mb-1">Reference ID:</p>
            <p className="text-lg font-mono text-green-400">{submissionState.referenceId}</p>
          </div>
          <div className="text-left space-y-3 mb-6">
            <h3 className="font-semibold text-white">Next Steps:</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>You&apos;ll receive an email confirmation shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Our support team will review your request within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Keep your reference ID for future correspondence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>For urgent issues, please contact our live chat support</span>
              </li>
            </ul>
          </div>
          <Button onClick={resetForm} variant="secondary">
            Submit Another Request
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <h2 className="text-2xl font-bold text-white mb-6">Contact Support</h2>
        
        {submissionState.status === 'error' && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{submissionState.error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                  errors.name ? 'border-red-500/50' : 'border-white/10'
                } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                placeholder="Your full name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-2 text-sm text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                  errors.email ? 'border-red-500/50' : 'border-white/10'
                } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                placeholder="your.email@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-400">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                errors.category ? 'border-red-500/50' : 'border-white/10'
              } text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'category-error' : undefined}
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-dark-800">
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p id="category-error" className="mt-2 text-sm text-red-400">
                {errors.category}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
              Subject *
            </label>
            <input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              maxLength={MAX_SUBJECT_LENGTH}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                errors.subject ? 'border-red-500/50' : 'border-white/10'
              } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Brief description of your issue"
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? 'subject-error' : undefined}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.subject ? (
                <p id="subject-error" className="text-sm text-red-400">
                  {errors.subject}
                </p>
              ) : (
                <span className="text-sm text-slate-500">Required</span>
              )}
              <span className="text-sm text-slate-500">
                {formData.subject.length}/{MAX_SUBJECT_LENGTH}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="transactionId" className="block text-sm font-medium text-slate-300 mb-2">
              Transaction ID (if applicable)
            </label>
            <input
              id="transactionId"
              type="text"
              value={formData.transactionId}
              onChange={(e) => handleInputChange('transactionId', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                errors.transactionId ? 'border-red-500/50' : 'border-white/10'
              } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Optional: Transaction hash or ID"
              aria-invalid={!!errors.transactionId}
              aria-describedby={errors.transactionId ? 'transactionId-error' : undefined}
            />
            {errors.transactionId && (
              <p id="transactionId-error" className="mt-2 text-sm text-red-400">
                {errors.transactionId}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={6}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                errors.message ? 'border-red-500/50' : 'border-white/10'
              } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none`}
              placeholder="Please provide detailed information about your issue or question..."
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.message ? (
                <p id="message-error" className="text-sm text-red-400">
                  {errors.message}
                </p>
              ) : (
                <span className="text-sm text-slate-500">Please be as detailed as possible</span>
              )}
              <span className="text-sm text-slate-500">
                {formData.message.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-slate-400">
              * Required fields
            </p>
            <Button
              type="submit"
              disabled={submissionState.status === 'submitting'}
              className="min-w-[140px]"
            >
              {submissionState.status === 'submitting' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-3">Other Support Options</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Live Chat</p>
              <p className="text-slate-400 text-sm">Available 24/7 for urgent issues</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Email Support</p>
              <p className="text-slate-400 text-sm">support@neurowealth.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Community Forum</p>
              <p className="text-slate-400 text-sm">Get help from other users</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
