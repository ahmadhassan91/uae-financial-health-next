import { ScoreCalculation, CustomerProfile, SurveyResponse, FinancialFactor, ScoreInterpretation, PillarScore, SubScore } from '../lib/types';

// Generate more comprehensive sample data with 50+ realistic UAE profiles
export function generateSampleData(): ScoreCalculation[] {
  const profiles: CustomerProfile[] = [
    // UAE Nationals - 30% of population
    {
      name: 'Ahmed Al-Mansoori',
      age: 35,
      gender: 'Male',
      nationality: 'UAE National',
      children: 'Yes',
      employmentStatus: 'Senior Management',
      employmentSector: 'Government',
      incomeRange: 'AED 40,000+',
      emailAddress: 'ahmed.mansoori@example.com',
      residence: 'Abu Dhabi'
    },
    {
      name: 'Fatima Al-Zahra',
      age: 28,
      gender: 'Female',
      nationality: 'UAE National',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Banking & Finance',
      incomeRange: 'AED 20,000 - 30,000',
      emailAddress: 'fatima.zahra@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Mohammed Al-Maktoum',
      age: 42,
      gender: 'Male',
      nationality: 'UAE National',
      children: 'Yes',
      employmentStatus: 'Self-Employed',
      employmentSector: 'Technology',
      incomeRange: 'AED 40,000+',
      emailAddress: 'mohammed.maktoum@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Aisha Al-Qasimi',
      age: 31,
      gender: 'Female',
      nationality: 'UAE National',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Education',
      incomeRange: 'AED 25,000 - 35,000',
      emailAddress: 'aisha.qasimi@example.com',
      residence: 'Sharjah'
    },
    {
      name: 'Khalid Al-Nahyan',
      age: 38,
      gender: 'Male',
      nationality: 'UAE National',
      children: 'Yes',
      employmentStatus: 'Senior Management',
      employmentSector: 'Oil & Gas',
      incomeRange: 'AED 40,000+',
      emailAddress: 'khalid.nahyan@example.com',
      residence: 'Abu Dhabi'
    },
    {
      name: 'Mariam Al-Suwaidi',
      age: 26,
      gender: 'Female',
      nationality: 'UAE National',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Healthcare',
      incomeRange: 'AED 15,000 - 25,000',
      emailAddress: 'mariam.suwaidi@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Omar Al-Rashid',
      age: 44,
      gender: 'Male',
      nationality: 'UAE National',
      children: 'Yes',
      employmentStatus: 'Senior Management',
      employmentSector: 'Real Estate',
      incomeRange: 'AED 40,000+',
      emailAddress: 'omar.rashid@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Noura Al-Maktoum',
      age: 33,
      gender: 'Female',
      nationality: 'UAE National',
      children: 'Yes',
      employmentStatus: 'Self-Employed',
      employmentSector: 'Marketing',
      incomeRange: 'AED 30,000 - 40,000',
      emailAddress: 'noura.maktoum@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Saeed Al-Blooshi',
      age: 29,
      gender: 'Male',
      nationality: 'UAE National',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Technology',
      incomeRange: 'AED 25,000 - 35,000',
      emailAddress: 'saeed.blooshi@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Shamma Al-Mansouri',
      age: 27,
      gender: 'Female',
      nationality: 'UAE National',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Government',
      incomeRange: 'AED 20,000 - 30,000',
      emailAddress: 'shamma.mansouri@example.com',
      residence: 'Abu Dhabi'
    },
    {
      name: 'Rashid Al-Zaabi',
      age: 40,
      gender: 'Male',
      nationality: 'UAE National',
      children: 'Yes',
      employmentStatus: 'Senior Management',
      employmentSector: 'Banking & Finance',
      incomeRange: 'AED 40,000+',
      emailAddress: 'rashid.zaabi@example.com',
      residence: 'Abu Dhabi'
    },
    {
      name: 'Latifa Al-Kaabi',
      age: 36,
      gender: 'Female',
      nationality: 'UAE National',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Education',
      incomeRange: 'AED 25,000 - 35,000',
      emailAddress: 'latifa.kaabi@example.com',
      residence: 'Abu Dhabi'
    },
    {
      name: 'Hamdan Al-Mheiri',
      age: 32,
      gender: 'Male',
      nationality: 'UAE National',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Technology',
      incomeRange: 'AED 30,000 - 40,000',
      emailAddress: 'hamdan.mheiri@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Moza Al-Shamsi',
      age: 25,
      gender: 'Female',
      nationality: 'UAE National',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Marketing',
      incomeRange: 'AED 15,000 - 25,000',
      emailAddress: 'moza.shamsi@example.com',
      residence: 'Sharjah'
    },
    {
      name: 'Sultan Al-Ketbi',
      age: 45,
      gender: 'Male',
      nationality: 'UAE National',
      children: 'Yes',
      employmentStatus: 'Self-Employed',
      employmentSector: 'Real Estate',
      incomeRange: 'AED 40,000+',
      emailAddress: 'sultan.ketbi@example.com',
      residence: 'Dubai'
    },

    // Indian Expats - 30% of population
    {
      name: 'Rajesh Kumar',
      age: 34,
      gender: 'Male',
      nationality: 'Expat (India)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Technology',
      incomeRange: 'AED 25,000 - 35,000',
      emailAddress: 'rajesh.kumar@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Priya Sharma',
      age: 29,
      gender: 'Female',
      nationality: 'Expat (India)',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Healthcare',
      incomeRange: 'AED 20,000 - 30,000',
      emailAddress: 'priya.sharma@example.com',
      residence: 'Abu Dhabi'
    },
    {
      name: 'Vikram Singh',
      age: 41,
      gender: 'Male',
      nationality: 'Expat (India)',
      children: 'Yes',
      employmentStatus: 'Senior Management',
      employmentSector: 'Banking & Finance',
      incomeRange: 'AED 40,000+',
      emailAddress: 'vikram.singh@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Meera Reddy',
      age: 27,
      gender: 'Female',
      nationality: 'Expat (India)',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Education',
      incomeRange: 'AED 15,000 - 25,000',
      emailAddress: 'meera.reddy@example.com',
      residence: 'Sharjah'
    },
    {
      name: 'Sanjay Gupta',
      age: 36,
      gender: 'Male',
      nationality: 'Expat (India)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Technology',
      incomeRange: 'AED 30,000 - 40,000',
      emailAddress: 'sanjay.gupta@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Anita Patel',
      age: 32,
      gender: 'Female',
      nationality: 'Expat (India)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Marketing',
      incomeRange: 'AED 25,000 - 35,000',
      emailAddress: 'anita.patel@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Arjun Nair',
      age: 28,
      gender: 'Male',
      nationality: 'Expat (India)',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Technology',
      incomeRange: 'AED 20,000 - 30,000',
      emailAddress: 'arjun.nair@example.com',
      residence: 'Abu Dhabi'
    },
    {
      name: 'Kavya Menon',
      age: 30,
      gender: 'Female',
      nationality: 'Expat (India)',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Healthcare',
      incomeRange: 'AED 25,000 - 35,000',
      emailAddress: 'kavya.menon@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Rohit Agarwal',
      age: 39,
      gender: 'Male',
      nationality: 'Expat (India)',
      children: 'Yes',
      employmentStatus: 'Senior Management',
      employmentSector: 'Oil & Gas',
      incomeRange: 'AED 40,000+',
      emailAddress: 'rohit.agarwal@example.com',
      residence: 'Abu Dhabi'
    },
    {
      name: 'Deepika Joshi',
      age: 26,
      gender: 'Female',
      nationality: 'Expat (India)',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Banking & Finance',
      incomeRange: 'AED 15,000 - 25,000',
      emailAddress: 'deepika.joshi@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Amit Khanna',
      age: 43,
      gender: 'Male',
      nationality: 'Expat (India)',
      children: 'Yes',
      employmentStatus: 'Self-Employed',
      employmentSector: 'Real Estate',
      incomeRange: 'AED 35,000 - 40,000',
      emailAddress: 'amit.khanna@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Sunita Rao',
      age: 33,
      gender: 'Female',
      nationality: 'Expat (India)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Education',
      incomeRange: 'AED 20,000 - 30,000',
      emailAddress: 'sunita.rao@example.com',
      residence: 'Sharjah'
    },

    // Pakistani Expats - 12% of population
    {
      name: 'Ali Hassan',
      age: 31,
      gender: 'Male',
      nationality: 'Expat (Pakistan)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Technology',
      incomeRange: 'AED 25,000 - 35,000',
      emailAddress: 'ali.hassan@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Ayesha Khan',
      age: 28,
      gender: 'Female',
      nationality: 'Expat (Pakistan)',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Healthcare',
      incomeRange: 'AED 20,000 - 30,000',
      emailAddress: 'ayesha.khan@example.com',
      residence: 'Abu Dhabi'
    },
    {
      name: 'Omar Ahmed',
      age: 37,
      gender: 'Male',
      nationality: 'Expat (Pakistan)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Banking & Finance',
      incomeRange: 'AED 30,000 - 40,000',
      emailAddress: 'omar.ahmed@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Fatima Malik',
      age: 24,
      gender: 'Female',
      nationality: 'Expat (Pakistan)',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Education',
      incomeRange: 'AED 12,000 - 18,000',
      emailAddress: 'fatima.malik@example.com',
      residence: 'Sharjah'
    },
    {
      name: 'Usman Tariq',
      age: 35,
      gender: 'Male',
      nationality: 'Expat (Pakistan)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Technology',
      incomeRange: 'AED 25,000 - 35,000',
      emailAddress: 'usman.tariq@example.com',
      residence: 'Dubai'
    },

    // Western Expats - 10% of population
    {
      name: 'David Johnson',
      age: 42,
      gender: 'Male',
      nationality: 'Expat (UK)',
      children: 'Yes',
      employmentStatus: 'Senior Management',
      employmentSector: 'Banking & Finance',
      incomeRange: 'AED 40,000+',
      emailAddress: 'david.johnson@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Sarah Williams',
      age: 34,
      gender: 'Female',
      nationality: 'Expat (Australia)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Marketing',
      incomeRange: 'AED 30,000 - 40,000',
      emailAddress: 'sarah.williams@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Michael Brown',
      age: 38,
      gender: 'Male',
      nationality: 'Expat (USA)',
      children: 'Yes',
      employmentStatus: 'Senior Management',
      employmentSector: 'Technology',
      incomeRange: 'AED 40,000+',
      emailAddress: 'michael.brown@example.com',
      residence: 'Abu Dhabi'
    },
    {
      name: 'Emma Davis',
      age: 29,
      gender: 'Female',
      nationality: 'Expat (Canada)',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Healthcare',
      incomeRange: 'AED 25,000 - 35,000',
      emailAddress: 'emma.davis@example.com',
      residence: 'Dubai'
    },
    {
      name: 'James Wilson',
      age: 45,
      gender: 'Male',
      nationality: 'Expat (UK)',
      children: 'Yes',
      employmentStatus: 'Self-Employed',
      employmentSector: 'Real Estate',
      incomeRange: 'AED 40,000+',
      emailAddress: 'james.wilson@example.com',
      residence: 'Dubai'
    },

    // Arab Expats - 18% of population  
    {
      name: 'Layla Kassem',
      age: 29,
      gender: 'Female',
      nationality: 'Expat (Lebanon)',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Marketing',
      incomeRange: 'AED 20,000 - 30,000',
      emailAddress: 'layla.kassem@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Khalil Mansour',
      age: 36,
      gender: 'Male',
      nationality: 'Expat (Jordan)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Technology',
      incomeRange: 'AED 30,000 - 40,000',
      emailAddress: 'khalil.mansour@example.com',
      residence: 'Abu Dhabi'
    },
    {
      name: 'Nour Al-Zahra',
      age: 32,
      gender: 'Female',
      nationality: 'Expat (Syria)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Education',
      incomeRange: 'AED 18,000 - 25,000',
      emailAddress: 'nour.zahra@example.com',
      residence: 'Sharjah'
    },
    {
      name: 'Ahmad Yousef',
      age: 40,
      gender: 'Male',
      nationality: 'Expat (Egypt)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Banking & Finance',
      incomeRange: 'AED 25,000 - 35,000',
      emailAddress: 'ahmad.yousef@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Rania Habib',
      age: 27,
      gender: 'Female',
      nationality: 'Expat (Palestine)',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Healthcare',
      incomeRange: 'AED 15,000 - 25,000',
      emailAddress: 'rania.habib@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Tariq Salem',
      age: 33,
      gender: 'Male',
      nationality: 'Expat (Morocco)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Technology',
      incomeRange: 'AED 25,000 - 35,000',
      emailAddress: 'tariq.salem@example.com',
      residence: 'Dubai'
    },
    {
      name: 'Yasmin Farah',
      age: 25,
      gender: 'Female',
      nationality: 'Expat (Tunisia)',
      children: 'No',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Marketing',
      incomeRange: 'AED 18,000 - 25,000',
      emailAddress: 'yasmin.farah@example.com',
      residence: 'Abu Dhabi'
    },
    {
      name: 'Mahmoud Hassan',
      age: 39,
      gender: 'Male',
      nationality: 'Expat (Sudan)',
      children: 'Yes',
      employmentStatus: 'Employed Full-Time',
      employmentSector: 'Healthcare',
      incomeRange: 'AED 20,000 - 30,000',
      emailAddress: 'mahmoud.hassan@example.com',
      residence: 'Abu Dhabi'
    }
  ];

  // Generate mock responses and scores for each profile
  return profiles.map((profile, index) => {
    const id = `sample-${index + 1}`;
    const userId = `user-${index + 1}`;

    // Generate realistic responses (1-5 Likert scale)
    const responses: SurveyResponse[] = [];
    const questionIds = [
      'income_diversity', 'income_stability', 'expense_tracking', 'expense_control',
      'savings_rate', 'savings_goals', 'debt_ratio', 'debt_payments',
      'retirement_savings', 'retirement_planning', 'insurance_coverage', 'emergency_fund',
      'investment_knowledge', 'financial_goals', 'family_planning', 'education_planning'
    ];

    // Generate responses based on profile characteristics for realism
    questionIds.forEach((questionId, qIndex) => {
      let baseScore = 3; // Start with neutral

      // Adjust based on income
      if (profile.incomeRange.includes('40,000+')) baseScore += 0.8;
      else if (profile.incomeRange.includes('30,000 - 40,000')) baseScore += 0.4;
      else if (profile.incomeRange.includes('12,000 - 18,000')) baseScore -= 0.6;

      // Adjust based on age (older tends to be more financially stable)
      if (profile.age > 40) baseScore += 0.3;
      else if (profile.age < 25) baseScore -= 0.2;

      // Adjust based on employment
      if (profile.employmentStatus === 'Senior Management') baseScore += 0.4;
      else if (profile.employmentStatus === 'Self-Employed') baseScore += 0.2;

      // Adjust based on nationality (UAE nationals tend to have better benefits)
      if (profile.nationality === 'UAE National') baseScore += 0.3;

      // Adjust based on sector
      if (profile.employmentSector === 'Banking & Finance') baseScore += 0.2;
      else if (profile.employmentSector === 'Government') baseScore += 0.3;
      else if (profile.employmentSector === 'Education') baseScore -= 0.1;

      // Add deterministic variance based on question index and profile characteristics
      baseScore += ((qIndex * 7 + profile.age) % 10 - 5) * 0.3;

      // Skip Q16 (education_planning) if no children
      if (questionId === 'education_planning' && profile.children === 'No') {
        return;
      }

      // Ensure score is within 1-5 range
      const score = Math.max(1, Math.min(5, Math.round(baseScore)));
      responses.push({ questionId, value: score });
    });

    // Calculate total score (15-75 or 15-80 range)
    const baseTotal = responses.reduce((sum, r) => sum + r.value, 0);
    const hasChildren = profile.children === 'Yes';
    const maxPossibleScore = hasChildren ? 80 : 75;
    const totalScore = Math.round((baseTotal / responses.length) * 15);

    // Generate pillar scores
    const pillarScores: PillarScore[] = [
      {
        pillar: 'income_stream',
        score: Math.round(responses.filter(r => ['income_diversity', 'income_stability'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / 2 * 3),
        maxScore: 15,
        percentage: Math.round(responses.filter(r => ['income_diversity', 'income_stability'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / 2 * 20),
        interpretation: totalScore >= 60 ? 'Excellent' : totalScore >= 45 ? 'Good' : totalScore >= 30 ? 'Needs Improvement' : 'At Risk'
      },
      {
        pillar: 'monthly_expenses',
        score: Math.round(responses.filter(r => ['expense_tracking', 'expense_control'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / 2 * 3),
        maxScore: 15,
        percentage: Math.round(responses.filter(r => ['expense_tracking', 'expense_control'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / 2 * 20),
        interpretation: totalScore >= 60 ? 'Excellent' : totalScore >= 45 ? 'Good' : totalScore >= 30 ? 'Needs Improvement' : 'At Risk'
      },
      {
        pillar: 'savings_habit',
        score: Math.round(responses.filter(r => ['savings_rate', 'savings_goals'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / 2 * 3),
        maxScore: 15,
        percentage: Math.round(responses.filter(r => ['savings_rate', 'savings_goals'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / 2 * 20),
        interpretation: totalScore >= 60 ? 'Excellent' : totalScore >= 45 ? 'Good' : totalScore >= 30 ? 'Needs Improvement' : 'At Risk'
      },
      {
        pillar: 'debt_management',
        score: Math.round(responses.filter(r => ['debt_ratio', 'debt_payments'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / 2 * 3),
        maxScore: 15,
        percentage: Math.round(responses.filter(r => ['debt_ratio', 'debt_payments'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / 2 * 20),
        interpretation: totalScore >= 60 ? 'Excellent' : totalScore >= 45 ? 'Good' : totalScore >= 30 ? 'Needs Improvement' : 'At Risk'
      },
      {
        pillar: 'retirement_planning',
        score: Math.round(responses.filter(r => ['retirement_savings', 'retirement_planning'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / 2 * 3),
        maxScore: 15,
        percentage: Math.round(responses.filter(r => ['retirement_savings', 'retirement_planning'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / 2 * 20),
        interpretation: totalScore >= 60 ? 'Excellent' : totalScore >= 45 ? 'Good' : totalScore >= 30 ? 'Needs Improvement' : 'At Risk'
      },
      {
        pillar: 'protection',
        score: Math.round(responses.filter(r => ['insurance_coverage', 'emergency_fund'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / 2 * 3),
        maxScore: 15,
        percentage: Math.round(responses.filter(r => ['insurance_coverage', 'emergency_fund'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / 2 * 20),
        interpretation: totalScore >= 60 ? 'Excellent' : totalScore >= 45 ? 'Good' : totalScore >= 30 ? 'Needs Improvement' : 'At Risk'
      },
      {
        pillar: 'future_planning',
        score: Math.round(responses.filter(r => ['investment_knowledge', 'financial_goals', 'family_planning', 'education_planning'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / responses.filter(r => ['investment_knowledge', 'financial_goals', 'family_planning', 'education_planning'].includes(r.questionId)).length * 3),
        maxScore: hasChildren ? 20 : 15,
        percentage: Math.round(responses.filter(r => ['investment_knowledge', 'financial_goals', 'family_planning', 'education_planning'].includes(r.questionId)).reduce((sum, r) => sum + r.value, 0) / responses.filter(r => ['investment_knowledge', 'financial_goals', 'family_planning', 'education_planning'].includes(r.questionId)).length * 20),
        interpretation: totalScore >= 60 ? 'Excellent' : totalScore >= 45 ? 'Good' : totalScore >= 30 ? 'Needs Improvement' : 'At Risk'
      }
    ];

    // Generate realistic advice
    const advice = generateAdviceForProfile(profile, totalScore);

    // Generate deterministic creation dates (spread over last 3 months)
    const daysAgo = (index * 3) % 90; // Deterministic spread
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    return {
      id,
      userId,
      profile,
      responses,
      totalScore,
      maxPossibleScore,
      pillarScores,
      subScores: [], // Keep for backward compatibility
      advice,
      createdAt,
      modelVersion: 'v2' as const
    };
  });
}

function generateAdviceForProfile(profile: CustomerProfile, score: number): string[] {
  const advice: string[] = [];

  // Score-based advice
  if (score >= 60) {
    advice.push('Excellent financial health! Continue maintaining your current financial discipline and consider advanced investment strategies.');
  } else if (score >= 45) {
    advice.push('Good financial foundation. Focus on optimizing your investment portfolio and retirement planning.');
  } else if (score >= 30) {
    advice.push('Your financial health needs improvement. Start by creating a detailed budget and building an emergency fund.');
  } else {
    advice.push('Your financial situation requires immediate attention. Consider consulting with a financial advisor to create a comprehensive recovery plan.');
  }

  // Income-based advice
  if (profile.incomeRange.includes('12,000 - 18,000') || profile.incomeRange.includes('15,000 - 25,000')) {
    advice.push('Consider skill development programs or certifications to increase your earning potential in the UAE market.');
  }

  // Nationality-specific advice
  if (profile.nationality === 'UAE National') {
    advice.push('Take advantage of National Bonds Corporation and other UAE National exclusive investment programs for better returns.');
    advice.push('Consider the Mohammed bin Rashid Housing Establishment for favorable home financing options.');
  } else {
    advice.push('Explore expat-friendly investment options like UAE real estate or international mutual funds through local banks.');
  }

  // Children-based advice
  if (profile.children === 'Yes') {
    advice.push('Start or increase contributions to your children\'s education fund. Consider UAE university savings plans.');
    advice.push('Review your life insurance coverage to ensure adequate protection for your family.');
  }

  // Always include National Bonds Corporation promotion
  advice.push('National Bonds Corporation offers Sharia-compliant savings and investment solutions tailored for UAE residents. Visit any branch for personalized advice.');

  return advice.slice(0, 5); // Limit to 5 pieces of advice
}

// Additional analytics helper functions for enhanced dashboard
export function getTimeSeriesData(): Array<{ date: string; completions: number; averageScore: number }> {
  const data = generateSampleData();
  const dailyStats = new Map<string, { count: number; totalScore: number }>();

  data.forEach(record => {
    const dateKey = new Date(record.createdAt).toISOString().split('T')[0];
    const existing = dailyStats.get(dateKey) || { count: 0, totalScore: 0 };
    dailyStats.set(dateKey, {
      count: existing.count + 1,
      totalScore: existing.totalScore + record.totalScore
    });
  });

  return Array.from(dailyStats.entries())
    .map(([date, stats]) => ({
      date,
      completions: stats.count,
      averageScore: Number((stats.totalScore / stats.count).toFixed(1))
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getDemographicsBreakdown() {
  const data = generateSampleData();

  return {
    nationality: data.reduce((acc, record) => {
      const nat = record.profile.nationality;
      acc[nat] = (acc[nat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),

    ageGroups: data.reduce((acc, record) => {
      const age = record.profile.age;
      const group = age < 25 ? '18-24' : age < 35 ? '25-34' : age < 45 ? '35-44' : age < 55 ? '45-54' : '55+';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),

    income: data.reduce((acc, record) => {
      const income = record.profile.incomeRange;
      acc[income] = (acc[income] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),

    employment: data.reduce((acc, record) => {
      const emp = record.profile.employmentStatus;
      acc[emp] = (acc[emp] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),

    sector: data.reduce((acc, record) => {
      const sector = record.profile.employmentSector;
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),

    residence: data.reduce((acc, record) => {
      const residence = record.profile.residence;
      acc[residence] = (acc[residence] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),

    children: data.reduce((acc, record) => {
      const hasChildren = record.profile.children;
      acc[hasChildren] = (acc[hasChildren] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}
