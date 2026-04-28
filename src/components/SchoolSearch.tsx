import React, { useState } from 'react';
import { SchoolInfo } from '../types';
import { searchSchools } from '../services/neisService';
import { Search, MapPin, School as SchoolIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SchoolSearchProps {
  onSelectSchool: (school: SchoolInfo) => void;
}

export default function SchoolSearch({ onSelectSchool }: SchoolSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SchoolInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    const schools = await searchSchools(keyword);
    setResults(schools);
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-xl border-4 border-yellow-300"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
          <SchoolIcon size={32} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">우리 학교 찾기!</h2>
        <p className="text-gray-500 mb-6 text-sm md:text-base">오늘의 급식 칼로리를 계산할 학교를 검색해봐요.</p>
        
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="학교 이름을 입력하세요 (예: 서울초)"
            className="w-full pl-5 pr-14 py-4 rounded-full border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-yellow-400 hover:bg-yellow-500 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Search size={20} />
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="text-center py-8 text-gray-500 animate-pulse">
            학교를 찾고 있어요... 🕵️‍♂️
          </div>
        )}
        
        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl">
            앗! 학교를 찾을 수 없어요. 이름을 다시 확인해주세요. 😢
          </div>
        )}

        {!loading && results.map((school, i) => (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={school.SD_SCHUL_CODE}
            onClick={() => onSelectSchool(school)}
            className="w-full text-left p-4 rounded-2xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all group flex items-center gap-4"
          >
            <div className="bg-gray-100 text-gray-400 p-3 rounded-full group-hover:bg-green-100 group-hover:text-green-500 transition-colors">
              <MapPin size={24} />
            </div>
            <div>
              <div className="font-bold text-gray-800 text-lg">{school.SCHUL_NM}</div>
              <div className="text-sm text-gray-500 font-medium">{school.ATPT_OFCDC_SC_NM}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
