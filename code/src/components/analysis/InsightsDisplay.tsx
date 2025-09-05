import { AnalysisResult } from '@/types';
import { Card } from '@/components/ui/card';

interface InsightsDisplayProps {
  analysis: AnalysisResult;
  isLoading?: boolean;
}

export function InsightsDisplay({ analysis, isLoading }: InsightsDisplayProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 bg-accent border-accent hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-bold mb-4 text-primary flex items-center">
          <div className="w-4 h-4 bg-primary rounded-full mr-3 shadow-sm"></div>
          핵심 가치관
        </h3>
        <ul className="space-y-3" role="list" aria-label="핵심 가치관 목록">
          {analysis.values.map((value, index) => (
            <li key={index} className="flex items-start group">
              <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0 group-hover:bg-primary/80 transition-colors"></div>
              <span className="text-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">{value}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6 bg-accent border-accent hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-bold mb-4 text-primary flex items-center">
          <div className="w-4 h-4 bg-primary rounded-full mr-3 shadow-sm"></div>
          관심 분야
        </h3>
        <ul className="space-y-3" role="list" aria-label="관심 분야 목록">
          {analysis.interests.map((interest, index) => (
            <li key={index} className="flex items-start group">
              <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0 group-hover:bg-primary/80 transition-colors"></div>
              <span className="text-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">{interest}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}