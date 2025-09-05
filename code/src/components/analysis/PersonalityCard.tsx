import { PersonalityType } from '@/types';
import { Card } from '@/components/ui/card';

interface PersonalityCardProps {
  personalityType: PersonalityType;
  strengths: string[];
  weaknesses: string[];
}

export function PersonalityCard({ personalityType, strengths, weaknesses }: PersonalityCardProps) {
  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-blue-600">{personalityType.type}</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">{personalityType.type}</h2>
        <p className="text-gray-600">{personalityType.description}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-green-600 mb-2">강점</h3>
          <ul className="space-y-1">
            {strengths.map((strength, index) => (
              <li key={index} className="text-sm bg-green-50 p-2 rounded">
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-orange-600 mb-2">개선점</h3>
          <ul className="space-y-1">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="text-sm bg-orange-50 p-2 rounded">
                {weakness}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-blue-600 mb-2">특성</h3>
          <div className="flex flex-wrap gap-2">
            {personalityType.traits.map((trait, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}