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
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <h3 className="text-xl font-bold mb-4 text-purple-700 flex items-center">
          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
          핵심 가치관
        </h3>
        <ul className="space-y-3">
          {analysis.values.map((value, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
              <span className="text-gray-700 leading-relaxed">{value}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
        <h3 className="text-xl font-bold mb-4 text-indigo-700 flex items-center">
          <div className="w-4 h-4 bg-indigo-500 rounded-full mr-3"></div>
          관심 분야
        </h3>
        <ul className="space-y-3">
          {analysis.interests.map((interest, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
              <span className="text-gray-700 leading-relaxed">{interest}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}