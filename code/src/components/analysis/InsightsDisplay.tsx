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
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-purple-600">핵심 가치관</h3>
        <ul className="space-y-2">
          {analysis.values.map((value, index) => (
            <li key={index} className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
              <span className="text-sm">{value}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-indigo-600">관심 분야</h3>
        <ul className="space-y-2">
          {analysis.interests.map((interest, index) => (
            <li key={index} className="flex items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
              <span className="text-sm">{interest}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}