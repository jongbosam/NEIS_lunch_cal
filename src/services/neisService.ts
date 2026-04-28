import { MealData, SchoolInfo } from '../types';

const API_KEY = import.meta.env.VITE_NEIS_API_KEY || ''; // Use environment variable instead of hardcoding

export const searchSchools = async (keyword: string): Promise<SchoolInfo[]> => {
  try {
    const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=100&SCHUL_NM=${encodeURIComponent(keyword)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.schoolInfo && data.schoolInfo[1].row) {
      return data.schoolInfo[1].row as SchoolInfo[];
    }
    return [];
  } catch (error) {
    console.error("Failed to search schools:", error);
    return [];
  }
};

export const getMealData = async (
  officeCode: string,
  schoolCode: string,
  dateString: string // YYYYMMDD
): Promise<MealData | null> => {
  try {
    // We only fetch lunch (MMEAL_SC_CODE=2)
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${dateString}&MMEAL_SC_CODE=2`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.mealServiceDietInfo && data.mealServiceDietInfo[1].row) {
      return data.mealServiceDietInfo[1].row[0] as MealData;
    }
    return null;
  } catch (error) {
    console.error("Failed to get meal data:", error);
    return null;
  }
};

// 정규식을 사용하여 요리명에서 알레르기 정보 및 괄호를 제거합니다.
// 예: "쌀밥 (5.6.13)" -> "쌀밥"
export const parseMenuNames = (ddishNm: string): string[] => {
  return ddishNm
    .split('<br/>')
    .map(item => item.replace(/\([^)]*\)/g, '').trim())
    .filter(item => item.length > 0);
};

// 칼로리 정보 추출 ("850.5 Kcal" -> 850.5)
export const parseCalories = (calInfo: string): number => {
  const match = calInfo.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};
