'use client';

import { JobCategory } from '@/types';
import { Card } from '@/components/ui/card';

interface JobCategorySelectorProps {
  onSelect: (category: JobCategory) => void;
  selectedCategory?: JobCategory;
}

const JOB_CATEGORIES = [
  { 
    value: 'developer' as JobCategory, 
    label: '개발자',
    description: '소프트웨어 개발 및 프로그래밍',
    icon: '💻'
  },
  { 
    value: 'pm' as JobCategory, 
    label: '프로덕트 매니저',
    description: '제품 기획 및 프로젝트 관리',
    icon: '📈'
  },
  { 
    value: 'designer' as JobCategory, 
    label: '디자이너',
    description: 'UI/UX 디자인 및 브랜딩',
    icon: '🎨'
  },
  { 
    value: 'marketer' as JobCategory, 
    label: '마케터',
    description: '마케팅 전략 및 브랜드 관리',
    icon: '📢'
  },
  { 
    value: 'data' as JobCategory, 
    label: '데이터 사이언티스트',
    description: '데이터 분석 및 머신러닝',
    icon: '📊'
  }
];

export function JobCategorySelector({ onSelect, selectedCategory }: JobCategorySelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {JOB_CATEGORIES.map((category) => (
        <Card 
          key={category.value}
          className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
            selectedCategory === category.value 
              ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
              : 'hover:bg-gray-50 border-gray-200'
          }`}
          onClick={() => onSelect(category.value)}
        >
          <div className="text-center">
            <div className="text-4xl mb-3">{category.icon}</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">{category.label}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}