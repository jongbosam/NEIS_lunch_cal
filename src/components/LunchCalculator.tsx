import React, { useEffect, useState, useMemo } from 'react';
import { MealData, MenuItem, SchoolInfo } from '../types';
import { getMealData, parseCalories, parseMenuNames } from '../services/neisService';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Info, LogOut, Loader2, Utensils, Activity, School } from 'lucide-react';
import { cn } from '../lib/utils';

interface LunchCalculatorProps {
  schoolInfo: SchoolInfo;
  onReset: () => void;
}

const PORTION_MULTIPLIERS = [
  { value: 0, label: '안 먹음', icon: '🙅‍♂️', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
  { value: 0.5, label: '반만', icon: '🤏', color: 'bg-orange-100 hover:bg-orange-200 text-orange-700' },
  { value: 1, label: '정량', icon: '👍', color: 'bg-green-100 hover:bg-green-200 text-green-700' },
  { value: 1.5, label: '많이', icon: '🤤', color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700' },
];

export default function LunchCalculator({ schoolInfo, onReset }: LunchCalculatorProps) {
  const [loading, setLoading] = useState(true);
  const [mealData, setMealData] = useState<MealData | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [totalEstimatedKcal, setTotalEstimatedKcal] = useState(0);

  const todayStr = format(new Date(), 'yyyyMMdd');
  const todayDisplay = format(new Date(), 'yyyy년 MM월 dd일');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getMealData(schoolInfo.ATPT_OFCDC_SC_CODE, schoolInfo.SD_SCHUL_CODE, todayStr);
      setMealData(data);
      
      if (data) {
        const dishNames = parseMenuNames(data.DDISH_NM);
        const totalKcal = parseCalories(data.CAL_INFO);
        setTotalEstimatedKcal(totalKcal);

        // 예시: 밥 30%, 국 20%, 주반찬 30%, 부반찬 10%, 디저트 10% 이런 방식이 더 정확하겠지만
        // 제공된 정보가 없으므로 1/N 배분
        const kcalPerDish = Math.round((totalKcal / dishNames.length) * 10) / 10;
        
        const initialMenu: MenuItem[] = dishNames.map((name, idx) => ({
          id: `menu-${idx}`,
          name,
          estimatedCalories: kcalPerDish,
          portion: 1, // Default 1x
        }));
        
        setMenuItems(initialMenu);
      }
      setLoading(false);
    }
    fetchData();
  }, [schoolInfo, todayStr]);

  const updatePortion = (id: string, portion: number) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, portion } : item
    ));
  };

  const calculatedTotal = useMemo(() => {
    return menuItems.reduce((acc, item) => acc + (item.estimatedCalories * item.portion), 0);
  }, [menuItems]);

  const progressPercentage = Math.min((calculatedTotal / (totalEstimatedKcal || 1)) * 100, 150);
  
  let energyColor = "bg-green-400";
  if (progressPercentage > 110) energyColor = "bg-red-400";
  else if (progressPercentage < 50 && progressPercentage > 0) energyColor = "bg-yellow-400";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-white px-6 py-4 rounded-full shadow-sm border-2 border-gray-100"
      >
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
            <School size={20} />
          </div>
          <span className="font-bold text-gray-800">{schoolInfo.SCHUL_NM}</span>
        </div>
        <button 
          onClick={onReset}
          className="text-sm font-medium text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <LogOut size={16} /> 변경
        </button>
      </motion.div>

      {loading ? (
        <div className="bg-white rounded-3xl shadow-xl border-4 border-yellow-300 min-h-[400px] flex flex-col items-center justify-center p-8">
          <Loader2 className="animate-spin text-green-500 mb-4" size={48} />
          <p className="text-gray-500 font-medium">오늘의 급식 메뉴를 불러오고 있어요!</p>
        </div>
      ) : !mealData ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl border-4 border-gray-200 min-h-[400px] flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">오늘은 급식이 없거나 정보를 찾을 수 없어요.</h3>
          <p className="text-gray-500">주말이나 방학기간일 수 있습니다.</p>
        </motion.div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border-4 border-green-400 overflow-hidden"
          >
            <div className="bg-green-400 p-6 text-center text-white relative">
              <h2 className="text-xl font-medium opacity-90 mb-1">{todayDisplay} 오늘의 식단</h2>
              <div className="flex justify-center items-end gap-2">
                <span className="text-5xl font-black">{Math.round(calculatedTotal)}</span>
                <span className="text-xl font-bold opacity-80 mb-1">kcal</span>
              </div>
              <div className="absolute top-4 right-4">
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 backdrop-blur-sm">
                  <Activity size={16} /> 원본: {totalEstimatedKcal} kcal
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between text-sm font-bold text-gray-400 mb-2">
                  <span>가벼움</span>
                  <span>적당함</span>
                  <span>과식주의!</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    className={`absolute left-0 top-0 bottom-0 ${energyColor} transition-all duration-500`}
                  />
                  {/* 기준선 마커 */}
                  <div className="absolute left-[100%] top-0 bottom-0 w-1 bg-black/20" />
                </div>
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex gap-3 items-start mb-6 text-sm md:text-base font-medium">
                <Info className="shrink-0 mt-0.5" size={20} />
                <p>각 메뉴의 칼로리는 전체 칼로리를 나눈 <strong>대략적인 예상 수치</strong>입니다. 내가 먹은 양을 조절해서 오늘 섭취한 칼로리를 계산해보세요!</p>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {menuItems.map((item, idx) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2.5 rounded-xl shadow-sm text-yellow-500">
                          <Utensils size={24} />
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-800">{item.name}</div>
                          <div className="font-medium text-gray-500 text-sm">
                            기준 {item.estimatedCalories} kcal
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 lg:gap-3 lg:flex-1 max-w-lg ml-auto w-full">
                        {PORTION_MULTIPLIERS.map((mult) => (
                          <button
                            key={mult.value}
                            onClick={() => updatePortion(item.id, mult.value)}
                            className={cn(
                              "flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2",
                              item.portion === mult.value 
                                ? cn("border-current scale-105 shadow-md font-bold", mult.color)
                                : "border-transparent bg-white text-gray-400 hover:bg-gray-100"
                            )}
                          >
                            <span className="text-xl mb-1">{mult.icon}</span>
                            <span className="text-xs md:text-sm whitespace-nowrap">{mult.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}


