'use client';

import { JobCategory } from '@/types';
import { Card } from '@/components/ui/card';

interface ResumeTemplatesProps {
  selectedCategory: JobCategory;
  onSelectTemplate: (templateId: string) => void;
  selectedTemplate?: string;
}

const TEMPLATES = {
  developer: [
    { id: 'dev-modern', name: '모던 개발자', description: '깔끔하고 기술 중심적인 레이아웃' },
    { id: 'dev-creative', name: '크리에이티브 개발자', description: '창의적이고 시각적인 디자인' }
  ],
  pm: [
    { id: 'pm-executive', name: '임원급 PM', description: '전략적 사고와 리더십 강조' },
    { id: 'pm-startup', name: '스타트업 PM', description: '빠른 실행력과 다재다능함 강조' }
  ],
  designer: [
    { id: 'design-portfolio', name: '포트폴리오 중심', description: '작품과 프로젝트 중심 구성' },
    { id: 'design-minimal', name: '미니멀 디자인', description: '깔끔하고 세련된 레이아웃' }
  ],
  marketer: [
    { id: 'marketing-growth', name: '그로스 마케터', description: '성과와 데이터 중심 구성' },
    { id: 'marketing-brand', name: '브랜드 마케터', description: '브랜딩과 창의성 강조' }
  ],
  data: [
    { id: 'data-analyst', name: '데이터 분석가', description: '분석 능력과 인사이트 강조' },
    { id: 'data-scientist', name: '데이터 사이언티스트', description: '기술적 전문성과 연구 경험 강조' }
  ]
};

export function ResumeTemplates({ selectedCategory, onSelectTemplate, selectedTemplate }: ResumeTemplatesProps) {
  const templates = TEMPLATES[selectedCategory] || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">템플릿 선택</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-primary bg-accent' 
                : 'hover:bg-accent'
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <h4 className="font-semibold mb-2 text-foreground">{template.name}</h4>
            <p className="text-sm text-muted-foreground">{template.description}</p>
            <div className="mt-3 h-16 bg-muted rounded border-2 border-dashed border-border flex items-center justify-center">
              <span className="text-xs text-muted-foreground">템플릿 미리보기</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}