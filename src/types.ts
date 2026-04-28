export interface SchoolInfo {
  ATPT_OFCDC_SC_CODE: string;
  ATPT_OFCDC_SC_NM: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
}

export interface MealData {
  MLSV_YMD: string;
  MMEAL_SC_NM: string; // 조식, 중식, 석식
  DDISH_NM: string;
  CAL_INFO: string;
}

export interface MenuItem {
  id: string;
  name: string;
  estimatedCalories: number;
  portion: number; // 0, 0.5, 1, 1.5
}
