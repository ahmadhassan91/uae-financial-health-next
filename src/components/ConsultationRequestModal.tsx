'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalization } from '@/contexts/LocalizationContext';
import { X, Phone, Mail, MessageCircle, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ConsultationRequestModalProps {
  onClose: () => void;
  isOpen: boolean;
}

interface ConsultationFormData {
  name: string;
  email: string;
  phone_number: string;
  message: string;
  preferred_contact_method: 'email' | 'phone' | 'whatsapp';
  preferred_time: 'morning' | 'afternoon' | 'evening';
}

export function ConsultationRequestModal({ onClose, isOpen }: ConsultationRequestModalProps) {
  const { language } = useLocalization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<ConsultationFormData>({
    name: '',
    email: '',
    phone_number: '',
    message: '',
    preferred_contact_method: 'email',
    preferred_time: 'morning'
  });

  // Auto-populate form with user data if logged in OR from profile
  useEffect(() => {
    if (isOpen) {
      try {
        // First, try to get data from logged-in user session
        const userSession = localStorage.getItem('simpleAuthSession');
        if (userSession) {
          const userData = JSON.parse(userSession);
          setFormData(prev => ({
            ...prev,
            name: userData.full_name || userData.name || '',
            email: userData.email || '',
            phone_number: userData.phone || userData.phone_number || ''
          }));
        } else {
          // If not logged in, try to get data from Financial Clinic profile
          const profileData = localStorage.getItem('financialClinicProfile');
          if (profileData) {
            const profile = JSON.parse(profileData);
            setFormData(prev => ({
              ...prev,
              name: profile.name || '',
              email: profile.email || '',
              phone_number: profile.mobile_number || profile.phone_number || ''
            }));
          }
        }
      } catch (error) {
        console.warn('Could not load user data:', error);
      }
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof ConsultationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error(language === 'ar' ? 'الاسم مطلوب' : 'Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error(language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error(language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address');
      return false;
    }
    if (!formData.phone_number.trim()) {
      toast.error(language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/v1/consultations/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'financial_clinic_results'
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        toast.success(
          language === 'ar' 
            ? 'تم إرسال طلب الاستشارة بنجاح. سنتواصل معك قريباً!'
            : 'Consultation request sent successfully. We will contact you soon!'
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error(
            language === 'ar'
              ? 'لقد أرسلت طلب استشارة مؤخراً. يرجى المحاولة مرة أخرى بعد 24 ساعة.'
              : 'You have recently submitted a consultation request. Please try again after 24 hours.'
          );
        } else {
          throw new Error(errorData.message || 'Failed to submit request');
        }
      }
    } catch (error) {
      console.error('Consultation request error:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.'
          : 'An error occurred while submitting your request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({
      name: '',
      email: '',
      phone_number: '',
      message: '',
      preferred_contact_method: 'email',
      preferred_time: 'morning'
    });
    onClose();
  };

  if (!isOpen) return null;

  // Success state
  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {language === 'ar' ? 'تم الإرسال بنجاح!' : 'Successfully Sent!'}
            </h3>
            <p className="text-gray-600">
              {language === 'ar'
                ? 'شكراً لك على طلب الاستشارة. سيتواصل معك فريقنا خلال يوم عمل واحد.'
                : 'Thank you for your consultation request. Our team will contact you within one business day.'
              }
            </p>
          </div>
          <Button 
            onClick={handleClose}
            className="w-full bg-[#3fab4c] hover:bg-[#3fab4c]/90"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {language === 'ar' ? 'احجز استشارة مجانية' : 'Book a Free Consultation'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'ar'
                ? 'احصل على استشارة شخصية مع خبرائنا الماليين'
                : 'Get personalized advice from our financial experts'
              }
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              {language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              className="mt-1"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              {language === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
              className="mt-1"
              required
            />
          </div>

          {/* Phone Field */}
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              {language === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              placeholder={language === 'ar' ? '+971XXXXXXXXX' : '+971XXXXXXXXX'}
              className="mt-1"
              required
            />
          </div>

          {/* Preferred Contact Method */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              {language === 'ar' ? 'طريقة التواصل المفضلة' : 'Preferred Contact Method'}
            </Label>
            <RadioGroup
              value={formData.preferred_contact_method}
              onValueChange={(value) => handleInputChange('preferred_contact_method', value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="email" id="email-method" />
                <Label htmlFor="email-method" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4" />
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="phone" id="phone-method" />
                <Label htmlFor="phone-method" className="flex items-center gap-2 cursor-pointer">
                  <Phone className="w-4 h-4" />
                  {language === 'ar' ? 'مكالمة هاتفية' : 'Phone Call'}
                </Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="whatsapp" id="whatsapp-method" />
                <Label htmlFor="whatsapp-method" className="flex items-center gap-2 cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                  {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Preferred Time */}
          <div>
            <Label htmlFor="preferred-time" className="text-sm font-medium text-gray-700">
              {language === 'ar' ? 'الوقت المفضل' : 'Preferred Time'}
            </Label>
            <Select value={formData.preferred_time} onValueChange={(value) => handleInputChange('preferred_time', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={language === 'ar' ? 'اختر الوقت المفضل' : 'Select preferred time'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {language === 'ar' ? 'صباحاً (9 ص - 12 ظ)' : 'Morning (9 AM - 12 PM)'}
                  </div>
                </SelectItem>
                <SelectItem value="afternoon">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {language === 'ar' ? 'ظهراً (12 ظ - 5 م)' : 'Afternoon (12 PM - 5 PM)'}
                  </div>
                </SelectItem>
                <SelectItem value="evening">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {language === 'ar' ? 'مساءً (5 م - 8 م)' : 'Evening (5 PM - 8 PM)'}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message Field */}
          <div>
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              {language === 'ar' ? 'رسالة إضافية (اختيارية)' : 'Additional Message (Optional)'}
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={language === 'ar' 
                ? 'أخبرنا عن أهدافك المالية أو أي أسئلة محددة لديك'
                : 'Tell us about your financial goals or any specific questions you have'
              }
              className="mt-1 min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#3fab4c] hover:bg-[#3fab4c]/90"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                : (language === 'ar' ? 'إرسال الطلب' : 'Send Request')
              }
            </Button>
          </div>
        </form>

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            {language === 'ar'
              ? 'سيتواصل معك فريق الاستشارات المالية خلال يوم عمل واحد. الاستشارة مجانية تماماً.'
              : 'Our financial advisory team will contact you within one business day. The consultation is completely free.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
