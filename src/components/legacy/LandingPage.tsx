import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ChartLine, Users, FileText, Gear, SignOut, User, Calendar } from '@phosphor-icons/react';
import { NationalBondsLogo } from '../NationalBondsLogo';
import { LanguageSelector } from '../LanguageSelector';
import { useLocalization } from '@/contexts/LocalizationContext';

interface SimpleUser {
  id: number;
  email: string;
  dateOfBirth: string;
  surveyHistory?: unknown[];
}

interface LandingPageProps {
  onStartSurvey: () => void;
  onAdminAccess?: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
  user?: SimpleUser | null;
}

export function LandingPage({ onStartSurvey, onAdminAccess, onLogin, onLogout, user }: LandingPageProps) {
  const [showAdminButton, setShowAdminButton] = useState(false);
  const { t, isRTL } = useLocalization();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Show admin button when Ctrl+Shift+A is pressed
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdminButton(true);
        setTimeout(() => setShowAdminButton(false), 10000); // Hide after 10 seconds
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary/20">
      {/* Header with Authentication */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <NationalBondsLogo className="h-12" width={220} height={55} variant="primary" />
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageSelector variant="compact" />
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{t('welcome_back')}</span>
                </div>
                <Button variant="outline" size="sm" onClick={onLogout} className="flex items-center gap-2">
                  <SignOut className="w-4 h-4" />
                  {t('sign_out')}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onLogin} className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('access_previous_results')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className={`text-center mb-16 ${isRTL ? 'rtl-content' : ''}`}>
          <div className="mb-6">
            <h1 className={`text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight ${
              isRTL ? 'font-arabic rtl-gradient' : ''
            }`}>
              {t('financial_health_assessment')}
            </h1>
            <p className={`text-xl text-muted-foreground max-w-2xl mx-auto mb-8 ${
              isRTL ? 'leading-relaxed' : ''
            }`}>
              {t('trusted_uae_institution')} {t('get_personalized_insights')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onStartSurvey}
              size="lg" 
              className="text-lg px-8 py-6 button-gradient hover:button-gradient border-0 shadow-lg"
            >
              {user ? t('continue_assessment') : t('start_survey')}
            </Button>
            {!user && (
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 hover:bg-primary/10" onClick={onLogin}>
                <Calendar className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('view_previous_results')}
              </Button>
            )}
            {showAdminButton && onAdminAccess && (
              <Button 
                variant="secondary" 
                size="lg" 
                className="text-lg px-8 py-6 flex items-center gap-2"
                onClick={onAdminAccess}
              >
                <Gear className="w-5 h-5" />
                {t('admin_dashboard')}
              </Button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-none shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ChartLine className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{t('transparent_scoring')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {t('transparent_scoring_description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-lg">{t('privacy_protected')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {t('privacy_protected_description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <CardTitle className="text-lg">{t('personalized_insights')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {t('personalized_insights_description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle className="text-lg">{t('progress_tracking')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {t('progress_tracking_description')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className={`text-3xl font-bold mb-6 text-center ${isRTL ? 'font-arabic' : ''}`}>
            {t('about_financial_health_assessment')}
          </h2>
          <div className={`grid md:grid-cols-2 gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div>
              <h3 className="text-xl font-semibold mb-4">{t('science_based_methodology')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('science_based_methodology_description')}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• {t('budgeting_expense_management')}</li>
                <li>• {t('savings_emergency_funds')}</li>
                <li>• {t('debt_management_pillar')}</li>
                <li>• {t('financial_planning_goals')}</li>
                <li>• {t('investment_wealth_building')}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">{t('uae_specific_insights')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('uae_specific_insights_description')}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• {t('uae_banking_products_services')}</li>
                <li>• {t('adcb_emirates_nbd_partnerships')}</li>
                <li>• {t('sharia_compliant_options')}</li>
                <li>• {t('expat_specific_considerations')}</li>
                <li>• {t('local_investment_opportunities')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border/50">
            <h2 className={`text-2xl font-bold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
              {t('ready_to_improve')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t('join_thousands')}
              {!user && ` ${t('save_results_no_passwords')}`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onStartSurvey}
                size="lg" 
                className="text-lg px-8 py-6 button-gradient hover:button-gradient border-0 shadow-lg"
              >
                {user ? t('continue_your_journey') : t('begin_assessment_now')}
              </Button>
              {!user && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 hover:bg-primary/10"
                  onClick={onLogin}
                >
                  <Calendar className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('access_previous_results')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}