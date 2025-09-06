'use client';

import { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DailyRecordForm } from '@/components/documents/DailyRecordForm';
import { MoodChart } from '@/components/charts/MoodChart';
import { Calendar, Plus, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Document } from '@/types';

export default function DailyPage() {
  const { documents, createDocument, updateDocument, deleteDocument, isLoading } = useDocuments();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Document | null>(null);
  const [editingRecord, setEditingRecord] = useState<Document | null>(null);

  const dailyRecords = documents.filter(doc => doc.type === 'daily_record')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSave = async (data: { title: string; content: string }) => {
    try {
      if (editingRecord) {
        await updateDocument(editingRecord.documentId, {
          type: 'daily_record',
          title: data.title,
          content: data.content
        });
        showToast('일상기록이 수정되었습니다!', 'success');
        setEditingRecord(null);
      } else {
        await createDocument({
          type: 'daily_record',
          title: data.title,
          content: data.content
        });
        showToast('일상기록이 저장되었습니다!', 'success');
      }
      setShowForm(false);
    } catch {
      // 오류는 API 클라이언트에서 처리됨
    }
  };

  const handleEdit = (record: Document) => {
    setEditingRecord(record);
    setSelectedRecord(null);
    setShowForm(true);
  };

  const handleDelete = async (record: Document) => {
    if (confirm('정말로 이 기록을 삭제하시겠습니까?')) {
      try {
        await deleteDocument(record.documentId);
        showToast('일상기록이 삭제되었습니다!', 'success');
        setSelectedRecord(null);
      } catch {
        // 오류는 API 클라이언트에서 처리됨
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Calendar className="w-8 h-8 mr-3 text-primary" />
                일상기록
              </h1>
              <p className="text-muted-foreground mt-2 break-words">
                오늘의 기분과 활동을 기록해보세요
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 기록 작성
            </Button>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              기분 변화 추이
            </h2>
            <MoodChart documents={dailyRecords} />
          </Card>

          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>
                  {editingRecord ? '일상기록 수정' : '새 일상기록 작성'}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto">
                <DailyRecordForm 
                  onSave={handleSave}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingRecord(null);
                  }}
                  initialData={editingRecord ? {
                    title: editingRecord.title,
                    content: editingRecord.content
                  } : undefined}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">최근 기록</h2>
            {dailyRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>아직 일상기록이 없습니다.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  첫 번째 기록 작성하기
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dailyRecords.slice(0, 5).map((record) => (
                  <div 
                    key={record.documentId} 
                    className="border border-border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{record.title}</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(record);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(record);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {new Date(record.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {(() => {
                        try {
                          const data = JSON.parse(record.content);
                          return (
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                                기분 {data.mood}/5
                              </span>
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                                에너지 {data.energy}/5
                              </span>
                              {data.activities && data.activities.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  활동: {data.activities.slice(0, 2).join(', ')}{data.activities.length > 2 ? '...' : ''}
                                </span>
                              )}
                            </div>
                          );
                        } catch {
                          return record.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
                        }
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent>
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>{selectedRecord?.title}</DialogTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectedRecord && handleEdit(selectedRecord)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectedRecord && handleDelete(selectedRecord)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                {(() => {
                  try {
                    const data = JSON.parse(selectedRecord.content);
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.mood}/5</div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">기분</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.energy}/5</div>
                            <div className="text-sm text-green-700 dark:text-green-300">에너지</div>
                          </div>
                        </div>
                        {data.activities && data.activities.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">활동</h4>
                            <div className="flex flex-wrap gap-2">
                              {data.activities.map((activity: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-sm">{activity}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {data.notes && (
                          <div>
                            <h4 className="font-medium mb-2">메모</h4>
                            <p className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded">{data.notes}</p>
                          </div>
                        )}
                      </>
                    );
                  } catch {
                    return (
                      <div className="text-sm">
                        {selectedRecord.content.replace(/<[^>]*>/g, '')}
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}