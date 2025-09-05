import { PersonalityType, StrengthItem, WeaknessItem } from '@/types';
import { Card } from '@/components/ui/card';

interface PersonalityCardProps {
  personalityType?: PersonalityType;
  strengths?: StrengthItem[];
  weaknesses?: WeaknessItem[];
}

export function PersonalityCard({ personalityType, strengths = [], weaknesses = [] }: PersonalityCardProps) {
  if (!personalityType) {
    return null;
  }

  return (
    <Card className="p-6 bg-accent border-accent">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl font-bold text-primary-foreground" aria-label={`성격 유형 ${personalityType?.type || 'Unknown'}`}>{personalityType?.type || '?'}</span>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">{personalityType?.type || 'Unknown'}</h2>
        <p className="text-muted-foreground leading-relaxed">{personalityType?.description || ''}</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-primary mb-3 flex items-center">
            <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
            강점
          </h3>
          <ul className="space-y-2" role="list">
            {strengths.map((strength, index) => (
              <li key={index} className="text-sm bg-muted p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                <div className="font-medium text-foreground mb-1">{strength.title}</div>
                <div className="text-muted-foreground mb-2">{strength.description}</div>
                <div className="text-xs text-primary italic">근거: {strength.evidence}</div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-destructive mb-3 flex items-center">
            <div className="w-3 h-3 bg-destructive rounded-full mr-2"></div>
            개선점
          </h3>
          <ul className="space-y-2" role="list">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="text-sm bg-muted p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                <div className="font-medium text-foreground mb-1">{weakness.title}</div>
                <div className="text-muted-foreground mb-2">{weakness.description}</div>
                <div className="text-xs text-green-600 italic">개선방법: {weakness.improvement}</div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-primary mb-3 flex items-center">
            <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
            특성
          </h3>
          <div className="flex flex-wrap gap-2" role="list">
            {personalityType?.traits?.map((trait, index) => (
              <span key={index} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-accent transition-colors">
                {trait}
              </span>
            )) || []}
          </div>
        </div>
      </div>
    </Card>
  );
}