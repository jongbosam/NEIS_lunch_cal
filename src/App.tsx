import React, { useState, useEffect } from 'react';
import SchoolSearch from './components/SchoolSearch';
import LunchCalculator from './components/LunchCalculator';
import { SchoolInfo } from './types';
import { motion, AnimatePresence } from 'motion/react';

const COOKIE_KEY = 'neis_school_info';

// Simple cookie helpers
const setCookie = (name: string, value: string, days: number = 365) => {
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
};

const getCookie = (name: string) => {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length,c.length));
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = name + '=; Max-Age=-99999999;';
};

export default function App() {
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check cookie on load
    const saved = getCookie(COOKIE_KEY);
    if (saved) {
      try {
        setSchool(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse school cookie");
      }
    }
    setIsInitializing(false);
  }, []);

  const handleSelectSchool = (selectedSchool: SchoolInfo) => {
    setSchool(selectedSchool);
    setCookie(COOKIE_KEY, JSON.stringify(selectedSchool));
  };

  const handleReset = () => {
    setSchool(null);
    deleteCookie(COOKIE_KEY);
  };

  if (isInitializing) {
    return <div className="min-h-screen bg-green-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8faf8] font-sans text-gray-800 flex flex-col">
      <header className="bg-white border-b-4 border-yellow-300 py-4 px-6 sticky top-0 z-10 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#22c55e_1px,transparent_0)] bg-[size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto flex items-center justify-between relative z-10">
          <h1 className="text-2xl font-black tracking-tight text-green-600 flex items-center gap-2">
            <span className="text-3xl">🍱</span> 급식 칼로리 계산기
          </h1>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col">
        <AnimatePresence mode="wait">
          {!school ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="relative flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full"
            >
              {/* 이미지의 투명도 70%(0.7) 설정 */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center" 
                style={{ 
                  backgroundImage: "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1920&auto=format&fit=crop')", // 첨부해주신 이미지 대신 임시 이미지를 넣었습니다. (보안 정책 상 로컬 파일을 직접 추출할 수 없습니다)
                  opacity: 0.7,
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-0 bg-black/10 z-0" /> {/* 가독성을 위한 약간의 오버레이 */}
              <div className="relative z-10 w-full">
                <SchoolSearch onSelectSchool={handleSelectSchool} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 md:p-8"
            >
              <LunchCalculator schoolInfo={school} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
