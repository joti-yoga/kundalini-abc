// src/pages/PracticeCalendar.jsx
import React, { useState, useEffect } from 'react';



export default function PracticeCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [practiceRecords, setPracticeRecords] = useState({});

  // 載入練習記錄
  useEffect(() => {
    const loadPracticeRecords = () => {
      try {
        const records = localStorage.getItem('practiceRecords');
        if (records) {
          setPracticeRecords(JSON.parse(records));
        }
      } catch (error) {
        console.error('載入練習記錄失敗:', error);
      }
    };

    loadPracticeRecords();

    // 監聽本地存儲變化
    const handleStorageChange = () => {
      loadPracticeRecords();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteVisibility, setNoteVisibility] = useState('private');
  const [noteType, setNoteType] = useState('experience');

  // 獲取當前月份的日期數組
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 添加上個月的日期（灰色顯示）
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // 添加當前月份的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      days.push({ date: currentDay, isCurrentMonth: true });
    }
    
    // 添加下個月的日期（灰色顯示）
    const remainingDays = 42 - days.length; // 6週 x 7天 = 42天
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  // 格式化日期為字符串
  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  // 檢查某日期是否有練習記錄
  const hasRecords = (date) => {
    const dateKey = formatDateKey(date);
    return practiceRecords[dateKey] && 
           (practiceRecords[dateKey].courses?.length > 0 || practiceRecords[dateKey].notes?.length > 0);
  };

  // 切換月份
  const changeMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // 選擇日期
  const selectDate = (date) => {
    setSelectedDate(date);
  };

  // 保存心得記錄
  const saveNote = () => {
    if (!noteContent.trim() || !selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    const newNote = {
      id: `note_${Date.now()}`,
      content: noteContent,
      visibility: noteVisibility,
      type: noteType,
      createdAt: new Date().toISOString()
    };
    
    setPracticeRecords(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        courses: prev[dateKey]?.courses || [],
        notes: [...(prev[dateKey]?.notes || []), newNote]
      }
    }));
    
    setNoteContent('');
    setShowNoteModal(false);
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateRecords = selectedDate ? practiceRecords[formatDateKey(selectedDate)] : null;

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* 標題 */}
      <div className="w-full py-6 text-center" style={{ backgroundColor: '#999700' }}>
        <h1 className="text-xl font-bold text-white" style={{ fontSize: '2rem' }}>練習日曆</h1>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* 月份導航 */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow p-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold text-gray-800">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </h2>
          
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 日曆 */}
        <div className="bg-white rounded-lg shadow mb-6">
          {/* 星期標題 */}
          <div className="grid grid-cols-7 border-b">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50">
                {day}
              </div>
            ))}
          </div>
          
          {/* 日期格子 */}
          <div className="grid grid-cols-7">
            {days.map((dayInfo, index) => {
              const isToday = dayInfo.date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && dayInfo.date.toDateString() === selectedDate.toDateString();
              const hasRecord = hasRecords(dayInfo.date);
              
              return (
                <div
                  key={index}
                  onClick={() => selectDate(dayInfo.date)}
                  className={`
                    p-3 h-16 border-r border-b cursor-pointer transition relative
                    ${!dayInfo.isCurrentMonth ? 'text-gray-300 bg-gray-50' : 'hover:bg-yellow-50'}
                    ${isSelected ? 'bg-yellow-200' : ''}
                    ${isToday ? 'bg-blue-100' : ''}
                  `}
                >
                  <div className="text-sm font-medium">
                    {dayInfo.date.getDate()}
                  </div>
                  {hasRecord && (
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 選中日期的詳細信息 */}
        {selectedDate && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 練習記錄
              </h3>
              <button
                onClick={() => setShowNoteModal(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                新增心得
              </button>
            </div>

            {selectedDateRecords ? (
              <div className="space-y-6">
                {/* 課程記錄 */}
                {selectedDateRecords.courses && selectedDateRecords.courses.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-3">完成的課程</h4>
                    <div className="space-y-2">
                      {selectedDateRecords.courses.map((course, index) => (
                        <div key={index} className="bg-yellow-50 p-3 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800">{course.title}</p>
                              <p className="text-sm text-gray-600">{course.category} • {course.duration}分鐘</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(course.completedAt).toLocaleTimeString('zh-TW', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 心得記錄 */}
                {selectedDateRecords.notes && selectedDateRecords.notes.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-3">練習心得</h4>
                    <div className="space-y-3">
                      {selectedDateRecords.notes.map((note, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`
                                px-2 py-1 text-xs rounded-full
                                ${note.type === 'experience' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                              `}>
                                {note.type === 'experience' ? '心得' : '提問'}
                              </span>
                              <span className={`
                                px-2 py-1 text-xs rounded-full
                                ${note.visibility === 'private' ? 'bg-gray-100 text-gray-800' : 
                                  note.visibility === 'public_share' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}
                              `}>
                                {note.visibility === 'private' ? '僅自己可見' : 
                                 note.visibility === 'public_share' ? '公開分享' : '公開提問'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(note.createdAt).toLocaleTimeString('zh-TW', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>這一天還沒有練習記錄</p>
                <p className="text-sm mt-1">開始練習後，記錄會自動顯示在這裡</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 新增心得模態框 */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">記錄練習心得</h3>
              
              {/* 心得類型 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">類型</label>
                <div className="flex gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="experience"
                      checked={noteType === 'experience'}
                      onChange={(e) => setNoteType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">練習心得</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="question"
                      checked={noteType === 'question'}
                      onChange={(e) => setNoteType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">問題提問</span>
                  </label>
                </div>
              </div>

              {/* 可見性設置 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">可見性</label>
                <select
                  value={noteVisibility}
                  onChange={(e) => setNoteVisibility(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="private">僅自己可見</option>
                  <option value="public_share">公開分享</option>
                  <option value="public_question">公開提問</option>
                </select>
              </div>

              {/* 內容輸入 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">內容</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="分享你的練習心得或提出問題..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                />
              </div>

              {/* 按鈕 */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setNoteContent('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  取消
                </button>
                <button
                  onClick={saveNote}
                  disabled={!noteContent.trim()}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}