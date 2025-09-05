import { PersonalityType } from '@/types';
import { Card } from '@/components/ui/card';

interface PersonalityCardProps {
  personalityType: PersonalityType;
  strengths: string[];
  weaknesses: string[];
}

export function PersonalityCard({ personalityType, strengths, weaknesses }: PersonalityCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl font-bold text-white" aria-label={`성격 유형 ${personalityType.type}`}>{personalityType.type}</span>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">{personalityType.type}</h2>
        <p className="text-gray-600 leading-relaxed">{personalityType.description}</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-green-700 mb-3 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            강점
          </h3>
          <ul className="space-y-2" role="list">
            {strengths.map((strength, index) => (
              <li key={index} className="text-sm bg-green-50 p-3 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-orange-700 mb-3 flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            개선점
          </h3>
          <ul className="space-y-2" role="list">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="text-sm bg-orange-50 p-3 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors">
                {weakness}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-blue-700 mb-3 flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            특성
          </h3>
          <div className="flex flex-wrap gap-2" role="list">
            {personalityType.traits.map((trait, index) => (
              <span key={index} className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors">
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}