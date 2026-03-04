import { CategoryId } from '@/types';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  color: string;
  icon: string;
  keywords: string[];
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'housing',
    label: 'Housing',
    color: '#6366f1',
    icon: '🏠',
    keywords: ['rent', 'mortgage', 'hoa', 'lease', 'apartment', 'property'],
  },
  {
    id: 'food',
    label: 'Food & Dining',
    color: '#f59e0b',
    icon: '🍔',
    keywords: [
      'restaurant', 'cafe', 'coffee', 'doordash', 'ubereats', 'grubhub',
      'mcdonald', 'starbucks', 'chipotle', 'grocery', 'whole foods', 'trader',
      'safeway', 'kroger', 'wegmans', 'pizza', 'sushi', 'food', 'dining',
      'eat', 'lunch', 'dinner', 'breakfast',
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    color: '#3b82f6',
    icon: '🚗',
    keywords: [
      'uber', 'lyft', 'gas', 'fuel', 'parking', 'metro', 'transit', 'bus',
      'train', 'amtrak', 'airline', 'delta', 'united', 'southwest', 'car',
      'auto', 'vehicle', 'toll', 'garage',
    ],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    color: '#ec4899',
    icon: '🎬',
    keywords: [
      'netflix', 'hulu', 'disney', 'hbo', 'spotify', 'apple music',
      'movie', 'cinema', 'theater', 'concert', 'event', 'ticket',
      'game', 'steam', 'playstation', 'xbox', 'amazon prime',
    ],
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    color: '#10b981',
    icon: '🏥',
    keywords: [
      'pharmacy', 'cvs', 'walgreens', 'doctor', 'hospital', 'clinic',
      'dental', 'vision', 'insurance', 'copay', 'prescription', 'health',
      'medical', 'therapy',
    ],
  },
  {
    id: 'shopping',
    label: 'Shopping',
    color: '#f97316',
    icon: '🛍️',
    keywords: [
      'amazon', 'walmart', 'target', 'costco', 'ebay', 'etsy', 'nike',
      'adidas', 'zara', 'h&m', 'gap', 'best buy', 'apple store',
      'shopping', 'store', 'retail',
    ],
  },
  {
    id: 'utilities',
    label: 'Utilities',
    color: '#64748b',
    icon: '⚡',
    keywords: [
      'electric', 'gas', 'water', 'internet', 'phone', 'verizon', 'att',
      'tmobile', 'comcast', 'xfinity', 'utility', 'bill', 'pge', 'con ed',
    ],
  },
  {
    id: 'education',
    label: 'Education',
    color: '#8b5cf6',
    icon: '📚',
    keywords: [
      'tuition', 'university', 'college', 'school', 'coursera', 'udemy',
      'books', 'textbook', 'course', 'student', 'loan',
    ],
  },
  {
    id: 'travel',
    label: 'Travel',
    color: '#06b6d4',
    icon: '✈️',
    keywords: [
      'hotel', 'airbnb', 'vrbo', 'booking', 'expedia', 'marriott', 'hilton',
      'resort', 'vacation', 'travel', 'trip', 'flight',
    ],
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    color: '#a855f7',
    icon: '🔄',
    keywords: [
      'subscription', 'membership', 'annual', 'monthly fee', 'gym', 'fitness',
      'peloton', 'planet fitness', 'adobe', 'microsoft', 'google',
    ],
  },
  {
    id: 'income',
    label: 'Income',
    color: '#16a34a',
    icon: '💰',
    keywords: [
      'salary', 'payroll', 'deposit', 'direct deposit', 'transfer in',
      'payment received', 'refund', 'reimbursement', 'dividend', 'interest',
    ],
  },
  {
    id: 'savings',
    label: 'Savings',
    color: '#0ea5e9',
    icon: '💳',
    keywords: ['savings', 'investment', 'brokerage', 'ira', '401k', 'vanguard', 'fidelity'],
  },
  {
    id: 'other',
    label: 'Other',
    color: '#94a3b8',
    icon: '📌',
    keywords: [],
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, CategoryMeta>;

export function getCategoryMeta(id: CategoryId): CategoryMeta {
  return CATEGORY_MAP[id] ?? CATEGORY_MAP['other'];
}

export function classifyCategory(description: string): CategoryId {
  const lower = description.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.id === 'other') continue;
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      return cat.id;
    }
  }
  return 'other';
}
