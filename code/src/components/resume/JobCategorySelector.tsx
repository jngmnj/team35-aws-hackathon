'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type JobCategory = 'developer' | 'pm' | 'designer' | 'marketer' | 'data';

interface JobCategorySelectorProps {
  onSelect: (category: JobCategory) => void;
  selectedCategory?: JobCategory;
}

const JOB_CATEGORIES = [
  { value: 'developer' as JobCategory, label: '개발자' },
  { value: 'pm' as JobCategory, label: '프로덕트 매니저' },
  { value: 'designer' as JobCategory, label: '디자이너' },
  { value: 'marketer' as JobCategory, label: '마케터' },
  { value: 'data' as JobCategory, label: '데이터 사이언티스트' }
];

export function JobCategorySelector({ onSelect, selectedCategory }: JobCategorySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">직무 카테고리</label>
      <Select value={selectedCategory} onValueChange={onSelect}>
        <SelectTrigger>
          <SelectValue placeholder="직무를 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          {JOB_CATEGORIES.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}