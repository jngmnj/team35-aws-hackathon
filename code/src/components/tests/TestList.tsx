'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Brain, Users, Target, Heart } from 'lucide-react';

interface TestItem {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  externalUrl: string;
  icon: React.ReactNode;
}

const PERSONALITY_TESTS: TestItem[] = [
  {
    id: 'mbti',
    name: 'MBTI 성격유형검사',
    description: '16가지 성격 유형으로 자신의 성향을 파악하는 대표적인 성격검사',
    category: '성격유형',
    duration: '15-20분',
    externalUrl: 'https://www.16personalities.com/ko',
    icon: <Brain className="h-6 w-6" />
  },
  {
    id: 'disc',
    name: 'DISC 행동유형검사',
    description: '주도형, 사교형, 안정형, 신중형으로 행동 패턴을 분석',
    category: '행동유형',
    duration: '10-15분',
    externalUrl: 'https://www.discprofile.com/what-is-disc/overview/',
    icon: <Users className="h-6 w-6" />
  },
  {
    id: 'enneagram',
    name: '에니어그램',
    description: '9가지 성격 유형으로 내면의 동기와 두려움을 탐구',
    category: '성격유형',
    duration: '20-25분',
    externalUrl: 'https://www.enneagraminstitute.com/rheti',
    icon: <Target className="h-6 w-6" />
  },
  {
    id: 'big5',
    name: 'Big 5 성격검사',
    description: '개방성, 성실성, 외향성, 친화성, 신경성의 5가지 차원으로 성격 측정',
    category: '성격특성',
    duration: '10-15분',
    externalUrl: 'https://www.truity.com/test/big-five-personality-test',
    icon: <Heart className="h-6 w-6" />
  }
];

interface TestListProps {
  onTakeTest: (testType: string) => void;
}

export function TestList({ onTakeTest }: TestListProps) {
  const handleExternalTest = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">추천 성격 테스트</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PERSONALITY_TESTS.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {test.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {test.category} • {test.duration}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {test.description}
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExternalTest(test.externalUrl)}
                  className="flex-1"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  테스트 하러가기
                </Button>
                <Button
                  onClick={() => onTakeTest(test.name)}
                  className="flex-1"
                >
                  결과 입력
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}