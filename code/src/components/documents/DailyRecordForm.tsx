'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DailyRecord } from '@/types';

interface DailyRecordFormProps {
  onSave: (data: { title: string; content: string }) => void;
  initialData?: DailyRecord;
}

export function DailyRecordForm({ onSave, initialData }: DailyRecordFormProps) {
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState(initialData?.mood || 3);
  const [energy, setEnergy] = useState(initialData?.energy || 3);
  const [activities, setActivities] = useState(initialData?.activities?.join(', ') || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = () => {
    const recordData: DailyRecord = {
      date,
      mood,
      energy,
      activities: activities.split(',').map(a => a.trim()).filter(Boolean),
      notes: notes || undefined
    };

    onSave({
      title: `일상 기록 - ${date}`,
      content: JSON.stringify(recordData, null, 2)
    });
  };

  const MoodScale = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(num => (
          <Button
            key={num}
            variant={value === num ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(num)}
            className="w-10 h-10"
          >
            {num}
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        1: 매우 낮음 → 5: 매우 높음
      </p>
    </div>
  );

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="date">날짜</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <MoodScale
        value={mood}
        onChange={setMood}
        label="기분 상태"
      />

      <MoodScale
        value={energy}
        onChange={setEnergy}
        label="에너지 레벨"
      />

      <div className="space-y-2">
        <Label htmlFor="activities">주요 활동 (쉼표로 구분)</Label>
        <Input
          id="activities"
          value={activities}
          onChange={(e) => setActivities(e.target.value)}
          placeholder="운동, 독서, 회의, 프로젝트 작업"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">메모</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="오늘 하루에 대한 생각이나 느낌을 자유롭게 적어보세요..."
          rows={4}
        />
      </div>

      <Button onClick={handleSubmit} className="w-full">
        저장하기
      </Button>
    </Card>
  );
}