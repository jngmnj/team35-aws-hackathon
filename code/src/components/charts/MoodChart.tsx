'use client';

import { useState } from 'react';
import { Document, DailyRecord } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface MoodChartProps {
  documents: Document[];
}

export function MoodChart({ documents }: MoodChartProps) {
  const [selectedRecord, setSelectedRecord] = useState<{ record: DailyRecord; document: Document } | null>(null);
  const [hoveredRecord, setHoveredRecord] = useState<DailyRecord | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
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
    .reduce((acc, record) => {
      const dateStr = record!.date.toDateString();
      const existing = acc.find(r => r.date.toDateString() === dateStr);
      if (existing) {
        // 같은 날짜면 평균값 사용
        existing.mood = Math.round((existing.mood + record!.mood) / 2);
        existing.energy = Math.round((existing.energy + record!.energy) / 2);
        if (record!.activities) {
          existing.activities = [...(existing.activities || []), ...record!.activities];
        }
      } else {
        acc.push(record!);
      }
      return acc;
    }, [] as NonNullable<typeof dailyRecords[0]>[])
    .sort((a, b) => a.date.getTime() - b.date.getTime())
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
  const graphHeight = 180;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">최근 7일 기분 변화</h3>
      <div className="relative bg-gray-50 rounded-lg p-4" style={{ height: chartHeight + 60 }}>
        <svg width="100%" height={chartHeight + 40} className="overflow-hidden" preserveAspectRatio="none">
          {[1, 2, 3, 4, 5].map(value => (
            <g key={value}>
              <line
                x1="30"
                y1={30 + graphHeight - (value - 1) * (graphHeight / 4)}
                x2="90%"
                y2={30 + graphHeight - (value - 1) * (graphHeight / 4)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x="20"
                y={35 + graphHeight - (value - 1) * (graphHeight / 4)}
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
              >
                {value}
              </text>
            </g>
          ))}
          
          {dailyRecords.length > 1 && (
            <>
              {dailyRecords.slice(0, -1).map((record, index) => {
                const x1 = `${10 + (index * (80 / Math.max(dailyRecords.length - 1, 1)))}%`;
                const y1 = 30 + graphHeight - ((record!.mood - 1) * (graphHeight / 4));
                const x2 = `${10 + ((index + 1) * (80 / Math.max(dailyRecords.length - 1, 1)))}%`;
                const y2 = 30 + graphHeight - ((dailyRecords[index + 1]!.mood - 1) * (graphHeight / 4));
                
                return (
                  <line
                    key={`mood-${index}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={hoveredIndex === index || hoveredIndex === index + 1 ? "#1d4ed8" : "#3b82f6"}
                    strokeWidth={hoveredIndex === index || hoveredIndex === index + 1 ? "3" : "2"}
                    className="cursor-pointer"
                    onMouseEnter={(e) => {
                      setHoveredIndex(index);
                      setMousePos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
              
              {dailyRecords.slice(0, -1).map((record, index) => {
                const x1 = `${10 + (index * (80 / Math.max(dailyRecords.length - 1, 1)))}%`;
                const y1 = 30 + graphHeight - ((record!.energy - 1) * (graphHeight / 4));
                const x2 = `${10 + ((index + 1) * (80 / Math.max(dailyRecords.length - 1, 1)))}%`;
                const y2 = 30 + graphHeight - ((dailyRecords[index + 1]!.energy - 1) * (graphHeight / 4));
                
                return (
                  <line
                    key={`energy-${index}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={hoveredIndex === index || hoveredIndex === index + 1 ? "#059669" : "#10b981"}
                    strokeWidth={hoveredIndex === index || hoveredIndex === index + 1 ? "3" : "2"}
                    strokeDasharray="5,5"
                    className="cursor-pointer"
                    onMouseEnter={(e) => {
                      setHoveredIndex(index);
                      setMousePos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </>
          )}
          
          {dailyRecords.map((record, index) => {
            const x = `${10 + (index * (80 / Math.max(dailyRecords.length - 1, 1)))}%`;
            const moodY = 30 + graphHeight - ((record.mood - 1) * (graphHeight / 4));
            const energyY = 30 + graphHeight - ((record.energy - 1) * (graphHeight / 4));
            
            return (
              <g key={index}>
                {/* 세로 라인 */}
                <line
                  x1={x}
                  y1={30}
                  x2={x}
                  y2={30 + graphHeight}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <circle 
                  cx={x} 
                  cy={moodY} 
                  r="4" 
                  fill="#3b82f6" 
                  className="cursor-pointer hover:opacity-80 transition-all"
                  onClick={() => setSelectedRecord({ record: record, document: documents.find(d => d.content.includes(record.date.toISOString().split('T')[0]))! })}
                  onMouseEnter={(e) => {
                    setHoveredRecord(record);
                    setHoveredIndex(index);
                    setMousePos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => {
                    setHoveredRecord(null);
                    setHoveredIndex(null);
                  }}
                />
                <circle 
                  cx={x} 
                  cy={energyY} 
                  r="4" 
                  fill="#10b981" 
                  className="cursor-pointer hover:opacity-80 transition-all"
                  onClick={() => setSelectedRecord({ record: record, document: documents.find(d => d.content.includes(record.date.toISOString().split('T')[0]))! })}
                  onMouseEnter={(e) => {
                    setHoveredRecord(record);
                    setHoveredIndex(index);
                    setMousePos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => {
                    setHoveredRecord(null);
                    setHoveredIndex(null);
                  }}
                />
                <text
                  x={x}
                  y={chartHeight + 30}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {record.date.getMonth() + 1}/{record.date.getDate()}
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
      
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRecord?.record.date.toLocaleDateString('ko-KR')} 일상기록
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">{selectedRecord.record.mood}/5</div>
                  <div className="text-sm text-blue-700">기분</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">{selectedRecord.record.energy}/5</div>
                  <div className="text-sm text-green-700">에너지</div>
                </div>
              </div>
              {selectedRecord.record.activities && selectedRecord.record.activities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">활동</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.record.activities.map((activity, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">{activity}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedRecord.record.notes && (
                <div>
                  <h4 className="font-medium mb-2">메모</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedRecord.record.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {hoveredRecord && (
        <div 
          className="fixed z-50 bg-black text-white px-3 py-2 rounded text-xs pointer-events-none max-w-xs"
          style={{ left: mousePos.x + 10, top: mousePos.y - 50 }}
        >
          <div className="font-medium mb-1">{hoveredRecord.date.toLocaleDateString('ko-KR')}</div>
          <div>기분: {hoveredRecord.mood}/5, 에너지: {hoveredRecord.energy}/5</div>
          {hoveredRecord.activities && hoveredRecord.activities.length > 0 && (
            <div className="text-gray-300">활동: {hoveredRecord.activities.slice(0, 2).join(', ')}{hoveredRecord.activities.length > 2 ? '...' : ''}</div>
          )}
          <div className="text-gray-400 mt-1">클릭하여 상세 내용 보기</div>
        </div>
      )}
      
      {hoveredIndex !== null && !hoveredRecord && (
        <div 
          className="fixed z-50 bg-black text-white px-2 py-1 rounded text-xs pointer-events-none"
          style={{ left: mousePos.x + 10, top: mousePos.y - 30 }}
        >
          기간: {dailyRecords[hoveredIndex]?.date.toLocaleDateString('ko-KR')} - {dailyRecords[hoveredIndex + 1]?.date.toLocaleDateString('ko-KR')}
        </div>
      )}
    </div>
  );
}