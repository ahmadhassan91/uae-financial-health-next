import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, MapPin } from '@phosphor-icons/react';
import { CustomerProfile } from '../lib/types';
import { useLocalization } from '@/contexts/LocalizationContext';
// import { LanguageSelector } from './LanguageSelector';

interface CustomerProfileFormProps {
  onComplete: (profile: CustomerProfile) => void;
  existingProfile?: CustomerProfile | null;
}

export function CustomerProfileForm({ onComplete, existingProfile }: CustomerProfileFormProps) {
  const { t, isRTL } = useLocalization();
  const [profile, setProfile] = useState<Partial<CustomerProfile>>(existingProfile || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!profile.name?.trim()) newErrors.name = t('name_required');
    if (!profile.age || profile.age < 18 || profile.age > 100) newErrors.age = t('valid_age_required');
    if (!profile.gender) newErrors.gender = t('gender_required');
    if (!profile.nationality?.trim()) newErrors.nationality = t('nationality_required');
    if (!profile.children) newErrors.children = t('children_required');
    if (!profile.employmentStatus?.trim()) newErrors.employmentStatus = t('employment_status_required');
    if (!profile.employmentSector?.trim()) newErrors.employmentSector = t('employment_sector_required');
    if (!profile.incomeRange?.trim()) newErrors.incomeRange = t('income_range_required');
    if (!profile.emailAddress?.trim() || !/\S+@\S+\.\S+/.test(profile.emailAddress)) {
      newErrors.emailAddress = t('valid_email_required');
    }
    if (!profile.residence?.trim()) newErrors.residence = t('residence_required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onComplete(profile as CustomerProfile);
    }
  };

  const updateField = (field: keyof CustomerProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">{t('step_1_of_2')}</Badge>
          <h1 className="text-3xl font-bold mb-2">{t('customer_profile')}</h1>
          <p className="text-muted-foreground">
            {t('provide_information_personalize')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('personal_information')}
              </CardTitle>
              <CardDescription>
                {t('basic_demographic_information')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')} *</Label>
                <Input
                  id="name"
                  value={profile.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{t('name_required')}</p>}
              </div>

              {/* Age and Gender */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">{t('age')} *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={profile.age || ''}
                    onChange={(e) => updateField('age', parseInt(e.target.value) || 0)}
                    className={errors.age ? 'border-destructive' : ''}
                  />
                  {errors.age && <p className="text-sm text-destructive">{t('valid_age_required')}</p>}
                </div>

                <div className="space-y-2">
                  <Label>{t('gender')} *</Label>
                  <RadioGroup
                    value={profile.gender || ''}
                    onValueChange={(value) => updateField('gender', value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Male" id="male" />
                      <Label htmlFor="male">{t('male')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Female" id="female" />
                      <Label htmlFor="female">{t('female')}</Label>
                    </div>
                  </RadioGroup>
                  {errors.gender && <p className="text-sm text-destructive">{t('gender_required')}</p>}
                </div>
              </div>

              {/* Nationality and Children */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">{t('nationality')} *</Label>
                  <Input
                    id="nationality"
                    value={profile.nationality || ''}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    placeholder={t('nationality_placeholder')}
                    className={errors.nationality ? 'border-destructive' : ''}
                  />
                  {errors.nationality && <p className="text-sm text-destructive">{t('nationality_required')}</p>}
                </div>

                <div className="space-y-2">
                  <Label>{t('do_you_have_children')} *</Label>
                  <RadioGroup
                    value={profile.children || ''}
                    onValueChange={(value) => updateField('children', value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="children-yes" />
                      <Label htmlFor="children-yes">{t('yes')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="children-no" />
                      <Label htmlFor="children-no">{t('no')}</Label>
                    </div>
                  </RadioGroup>
                  {errors.children && <p className="text-sm text-destructive">{t('children_required')}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                {t('employment_information')}
              </CardTitle>
              <CardDescription>
                {t('professional_financial_background')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Employment Status */}
              <div className="space-y-2">
                <Label htmlFor="employment-status" className="text-[#505d68] font-normal text-sm">{t('employment_status')} *</Label>
                <Select value={profile.employmentStatus || ''} onValueChange={(value) => updateField('employmentStatus', value)}>
                  <SelectTrigger className={`h-12 ${errors.employmentStatus ? 'border-destructive' : 'border-[#c2d1d9]'}`}>
                    <SelectValue placeholder={t('select_employment_status')} className="text-[#a1aeb7]" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employed Full-time">{t('employed_full_time')}</SelectItem>
                    <SelectItem value="Employed Part-time">{t('employed_part_time')}</SelectItem>
                    <SelectItem value="Self-employed">{t('self_employed')}</SelectItem>
                    <SelectItem value="Business Owner">{t('business_owner')}</SelectItem>
                    <SelectItem value="Freelancer">{t('freelancer')}</SelectItem>
                    <SelectItem value="Student">{t('student')}</SelectItem>
                    <SelectItem value="Retired">{t('retired')}</SelectItem>
                    <SelectItem value="Unemployed">{t('unemployed')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employmentStatus && <p className="text-sm text-destructive">{t('employment_status_required')}</p>}
              </div>

              {/* Employment Sector */}
              <div className="space-y-2">
                <Label htmlFor="employment-sector" className="text-[#505d68] font-normal text-sm">{t('employment_sector')} *</Label>
                <Select value={profile.employmentSector || ''} onValueChange={(value) => updateField('employmentSector', value)}>
                  <SelectTrigger className={`h-12 ${errors.employmentSector ? 'border-destructive' : 'border-[#c2d1d9]'}`}>
                    <SelectValue placeholder={t('select_employment_sector')} className="text-[#a1aeb7]" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Government">{t('government')}</SelectItem>
                    <SelectItem value="Banking & Finance">{t('banking_finance')}</SelectItem>
                    <SelectItem value="Oil & Gas">{t('oil_gas')}</SelectItem>
                    <SelectItem value="Healthcare">{t('healthcare')}</SelectItem>
                    <SelectItem value="Education">{t('education')}</SelectItem>
                    <SelectItem value="Technology">{t('technology')}</SelectItem>
                    <SelectItem value="Construction">{t('construction')}</SelectItem>
                    <SelectItem value="Retail">{t('retail')}</SelectItem>
                    <SelectItem value="Tourism & Hospitality">{t('tourism_hospitality')}</SelectItem>
                    <SelectItem value="Other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employmentSector && <p className="text-sm text-destructive">{t('employment_sector_required')}</p>}
              </div>

              {/* Income Range */}
              <div className="space-y-2">
                <Label htmlFor="income-range" className="text-[#505d68] font-normal text-sm">{t('monthly_income_range')} *</Label>
                <Select value={profile.incomeRange || ''} onValueChange={(value) => updateField('incomeRange', value)}>
                  <SelectTrigger className={`h-12 ${errors.incomeRange ? 'border-destructive' : 'border-[#c2d1d9]'}`}>
                    <SelectValue placeholder={t('select_income_range')} className="text-[#a1aeb7]" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Below 5,000">{t('below_5000')}</SelectItem>
                    <SelectItem value="5,000 - 10,000">{t('5000_10000')}</SelectItem>
                    <SelectItem value="10,000 - 20,000">{t('10000_20000')}</SelectItem>
                    <SelectItem value="20,000 - 30,000">{t('20000_30000')}</SelectItem>
                    <SelectItem value="30,000 - 50,000">{t('30000_50000')}</SelectItem>
                    <SelectItem value="50,000 - 100,000">{t('50000_100000')}</SelectItem>
                    <SelectItem value="Above 100,000">{t('above_100000')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.incomeRange && <p className="text-sm text-destructive">{t('income_range_required')}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {t('contact_information')}
              </CardTitle>
              <CardDescription>
                {t('contact_details_location')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('email_address')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.emailAddress || ''}
                  onChange={(e) => updateField('emailAddress', e.target.value)}
                  placeholder={t('email_placeholder')}
                  className={errors.emailAddress ? 'border-destructive' : ''}
                />
                {errors.emailAddress && <p className="text-sm text-destructive">{t('valid_email_required')}</p>}
              </div>

              {/* Residence */}
              <div className="space-y-2">
                <Label htmlFor="residence" className="text-[#505d68] font-normal text-sm">{t('residence')} *</Label>
                <Select value={profile.residence || ''} onValueChange={(value) => updateField('residence', value)}>
                  <SelectTrigger className={`h-12 ${errors.residence ? 'border-destructive' : 'border-[#c2d1d9]'}`}>
                    <SelectValue placeholder={t('select_residence')} className="text-[#a1aeb7]" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Abu Dhabi">{t('abu_dhabi')}</SelectItem>
                    <SelectItem value="Dubai">{t('dubai')}</SelectItem>
                    <SelectItem value="Sharjah">{t('sharjah')}</SelectItem>
                    <SelectItem value="Ajman">{t('ajman')}</SelectItem>
                    <SelectItem value="Ras Al Khaimah">{t('ras_al_khaimah')}</SelectItem>
                    <SelectItem value="Fujairah">{t('fujairah')}</SelectItem>
                    <SelectItem value="Umm Al Quwain">{t('umm_al_quwain')}</SelectItem>
                    <SelectItem value="Other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.residence && <p className="text-sm text-destructive">{t('residence_required')}</p>}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex justify-center">
            <Button type="submit" size="lg" className="px-8">
              {t('continue_to_assessment')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
