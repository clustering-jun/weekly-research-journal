import type { AppData } from "../types";
import { emptyJournal, uid } from "./utils";

const weekStart = new Date("2026-03-02T00:00:00");
const sample = emptyJournal(weekStart, "박정준", "7.5", "22");

sample.dailyEntries[0].workSessions = [
  { id: uid(), startTime: "7.5", endTime: "10", category: "논문", plan: "한전과제 논문정리", achievement: "관련 연구와 실험 조건을 표로 정리" },
  { id: uid(), startTime: "10", endTime: "12", category: "행정", plan: "학과행정 및 과제행정", achievement: "제출 문서 확인 및 과제 회의 자료 보완" },
  { id: uid(), startTime: "13", endTime: "17", category: "연구", plan: "교수님 미팅", achievement: "실험 방향과 다음 분석 항목 확정" },
  { id: uid(), startTime: "18", endTime: "22", category: "논문", plan: "DBIDS 논문 실험 정리", achievement: "실험 로그 정리 및 결과 그래프 초안 작성" },
];

sample.dailyEntries[1].checkInTime = "9";
sample.dailyEntries[1].checkOutTime = "18";
sample.dailyEntries[1].workSessions = [
  { id: uid(), startTime: "9", endTime: "12", category: "과제", plan: "연구과제 데이터 전처리", achievement: "결측치 처리 기준 정리" },
  { id: uid(), startTime: "13", endTime: "18", category: "연구", plan: "모델 성능 비교", achievement: "baseline 결과 재현 완료" },
];

sample.dailyEntries[2].checkInTime = "9.5";
sample.dailyEntries[2].checkOutTime = "19";
sample.dailyEntries[2].workSessions = [
  { id: uid(), startTime: "9.5", endTime: "12", category: "논문", plan: "논문 초록 수정", achievement: "초록과 기여점 문장 재작성" },
  { id: uid(), startTime: "14", endTime: "19", category: "연구", plan: "추가 실험", achievement: "파라미터 3개 조합 결과 확보" },
];

sample.weeklySummary = {
  overall: "주요 논문 실험과 과제 행정 처리를 병행했으며, DBIDS 논문 결과 정리의 큰 틀을 잡았다.",
  project: "한전과제 관련 문서와 데이터 정리 기준을 보완했다.",
  research: "baseline 재현과 추가 실험 조건을 확정했다.",
  paper: "논문 초록, 관련 연구, 실험 결과 정리 초안을 작성했다.",
  competition: "",
  etc: "학과 행정 요청 사항을 처리했다.",
};

sample.nextWeekPlan = {
  project: "과제 중간 보고 자료를 최신 실험 결과로 갱신한다.",
  research: "성능 비교 실험을 마무리하고 오류 사례를 분석한다.",
  paper: "DBIDS 논문 실험 섹션과 그림을 정리한다.",
  competition: "",
  etc: "회의록과 제출 일정 체크리스트를 정비한다.",
};

export const initialData: AppData = {
  settings: {
    researcherName: "박정준",
    defaultCheckIn: "9",
    defaultCheckOut: "18",
    secretKey: "jeongjun",
  },
  journals: [sample],
};
