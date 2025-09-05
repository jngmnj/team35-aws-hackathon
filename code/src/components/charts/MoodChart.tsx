'use client';

import { Document, DailyRecord } from '@/types';

interface MoodChartProps {
  documents: Document[];
}

export function MoodChart({ documents }: MoodChartProps) {
  const dailyRecords = documents
    .filter(doc => doc.type === 'daily_record')
    .map(doc => {
      try {
        const data = JSON.parse(doc.content) as DailyRecord;
        return { ...data, date: new Date(data.date) };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a!.date.getTime() - b!.date.getTime())
    .slice(-7);

  if (dailyRecords.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>일상 기록이 없습니다.</p>
        <p className="text-sm">기분 추이를 보려면 일상 기록을 작성해보세요.</p>
      </div>
    );
  }

  const chartHeight = 200;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">최근 7일 기분 변화</h3>
      <div className="relative bg-gray-50 rounded-lg p-4" style={{ height: chartHeight + 60 }}>
        <svg width="100%" height={chartHeight + 40} className="overflow-visible">
          {[1, 2, 3, 4, 5].map(value => (
            <g key={value}>
              <line
                x1="30"
                y1={chartHeight - (value - 1) * (chartHeight / 4) + 20}
                x2="100%"
                y2={chartHeight - (value - 1) * (chartHeight / 4) + 20}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x="20"
                y={chartHeight - (value - 1) * (chartHeight / 4) + 25}
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
              >
                {value}
              </text>
            </g>
          ))}
          
          <polyline
            points={dailyRecords.map((record, index) => {
              const x = 40 + (index * (100 / Math.max(dailyRecords.length - 1, 1))) + '%';
              const y = chartHeight - ((record!.mood - 1) * (chartHeight / 4)) + 20;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          
          <polyline
            points={dailyRecords.map((record, index) => {
              const x = 40 + (index * (100 / Math.max(dailyRecords.length - 1, 1))) + '%';
              const y = chartHeight - ((record!.energy - 1) * (chartHeight / 4)) + 20;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {dailyRecords.map((record, index) => {
            const x = 40 + (index * (100 / Math.max(dailyRecords.length - 1, 1)));
            const moodY = chartHeight - ((record!.mood - 1) * (chartHeight / 4)) + 20;
            const energyY = chartHeight - ((record!.energy - 1) * (chartHeight / 4)) + 20;
            
            return (
              <g key={index}>
                <circle cx={`${x}%`} cy={moodY} r="4" fill="#3b82f6" />
                <circle cx={`${x}%`} cy={energyY} r="4" fill="#10b981" />
                <text
                  x={`${x}%`}
                  y={chartHeight + 40}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {record!.date.getMonth() + 1}/{record!.date.getDate()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span>기분</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500 border-dashed border-t-2 border-green-500"></div>
          <span>에너지</span>
        </div>
      </div>
    </div>
  );
}