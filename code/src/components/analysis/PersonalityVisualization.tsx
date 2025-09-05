'use client';

import { PersonalityType } from '@/types';
import { Card } from '@/components/ui/card';

interface PersonalityVisualizationProps {
  personalityType: PersonalityType;
  strengths: string[];
  weaknesses: string[];
}

export function PersonalityVisualization({ personalityType, strengths, weaknesses }: PersonalityVisualizationProps) {
  const getPersonalityColor = (type: string) => {
    const colors = {
      'E': 'from-red-400 to-red-600',
      'I': 'from-blue-400 to-blue-600',
      'S': 'from-green-400 to-green-600',
      'N': 'from-purple-400 to-purple-600',
      'T': 'from-orange-400 to-orange-600',
      'F': 'from-pink-400 to-pink-600',
      'J': 'from-indigo-400 to-indigo-600',
      'P': 'from-yellow-400 to-yellow-600'
    };
    return colors[type[0] as keyof typeof colors] || 'from-gray-400 to-gray-600';
  };

  const strengthsPercentage = Math.min((strengths.length / 5) * 100, 100);
  const improvementPercentage = Math.min((weaknesses.length / 5) * 100, 100);

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50">
      <h3 className="text-xl font-bold mb-6 text-center">성격 유형 시각화</h3>
      
      {/* Personality Type Circle */}
      <div className="flex justify-center mb-8">
        <div className={`w-32 h-32 bg-gradient-to-br ${getPersonalityColor(personalityType.type)} rounded-full flex items-center justify-center shadow-lg`}>
          <span className="text-3xl font-bold text-white">{personalityType.type}</span>
        </div>
      </div>

      {/* Traits Visualization */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {personalityType.traits.map((trait, index) => (
          <div key={index} className="text-center p-3 bg-white rounded-lg border">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white text-sm font-bold">{trait[0]}</span>
            </div>
            <span className="text-sm font-medium text-gray-700">{trait}</span>
          </div>
        ))}
      </div>

      {/* Strengths vs Improvements Chart */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-green-700">강점</span>
            <span className="text-sm text-gray-500">{strengths.length}개</span>
          </div>
          <div className="w-full bg-green-100 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${strengthsPercentage}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-orange-700">개선점</span>
            <span className="text-sm text-gray-500">{weaknesses.length}개</span>
          </div>
          <div className="w-full bg-orange-100 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${improvementPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
}