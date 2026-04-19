import { Briefcase, Home, Users, Shield, FileText } from 'lucide-react';

import { suggestedQuestions } from '../data/suggestedQuestions';

export const SUGGESTED_QUESTIONS = suggestedQuestions;

export const CATEGORY_CARDS = [
  {
    id: 'admin',
    label: 'مسطرة إدارية',
    icon: FileText,
    openingMessage: 'بغيت نعرف على المساطر الإدارية — شنو هي وكيفاش نبدا؟',
  },
  {
    id: 'work',
    label: 'حقوق الشغل',
    icon: Briefcase,
    openingMessage: 'شرح ليا حقوقي كخادم في القانون المغربي.',
  },
  {
    id: 'family',
    label: 'قانون الأسرة',
    icon: Users,
    openingMessage: 'بغيت نعرف على قانون الأسرة المغربي — الطلاق، النفقة، والحضانة.',
  },
  {
    id: 'rent',
    label: 'قانون الكراء',
    icon: Home,
    openingMessage: 'شرح ليا حقوقي كمكتري في القانون المغربي.',
  },
];
