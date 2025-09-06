'use client';

import { JobCategory } from '@/types';
import { Card } from '@/components/ui/card';
import { Code, TrendingUp, Palette, Megaphone, BarChart3 } from 'lucide-react';

interface JobCategorySelectorProps {
  onSelect: (category: JobCategory) => void;
  selectedCategory?: JobCategory;
}

const JOB_CATEGORIES = [
  { 
    value: 'developer' as JobCategory, 
    label: '개발자',
    description: '소프트웨어 개발 및 프로그래밍',
    icon: Code
  },
  { 
    value: 'pm' as JobCategory, 
    label: '프로덕트 매니저',
    description: '제품 기획 및 프로젝트 관리',
    icon: TrendingUp
  },
  { 
    value: 'designer' as JobCategory, 
    label: '디자이너',
    description: 'UI/UX 디자인 및 브랜딩',
    icon: Palette
  },
  { 
    value: 'marketer' as JobCategory, 
    label: '마케터',
    description: '마케팅 전략 및 브랜드 관리',
    icon: Megaphone
  },
  { 
    value: 'data' as JobCategory, 
    label: '데이터 사이언티스트',
    description: '데이터 분석 및 머신러닝',
    icon: BarChart3
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
              ? 'ring-2 ring-primary bg-accent border-primary' 
              : 'hover:bg-accent border-border'
          }`}
          onClick={() => onSelect(category.value)}
        >
          <div className="text-center">
            <div className="mb-3 flex justify-center">
              <category.icon className="h-12 w-12 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">{category.label}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}