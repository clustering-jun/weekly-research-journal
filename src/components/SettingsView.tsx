import { Cloud, Download, LogIn, LogOut, RefreshCw, RotateCcw, Upload } from "lucide-react";
import type { FirebaseUser } from "../lib/firebaseSync";
import type { AppData } from "../types";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, OutlineButton } from "./ui";

type Props = {
  data: AppData;
  onChange: (data: AppData) => void;
  onReset: () => void;
  firebaseConfigured: boolean;
  firebaseUser: FirebaseUser | null;
  firebaseStatus: string;
  firebaseSaving: boolean;
  lastCloudSave: Date | null;
  onFirebaseSignIn: () => void;
  onFirebaseSignOut: () => void;
  onFirebasePush: () => void;
  onFirebasePull: () => void;
};

export function SettingsView({
  data,
  onChange,
  onReset,
  firebaseConfigured,
  firebaseUser,
  firebaseStatus,
  firebaseSaving,
  lastCloudSave,
  onFirebaseSignIn,
  onFirebaseSignOut,
  onFirebasePush,
  onFirebasePull,
}: Props) {
  function updateSettings(key: keyof AppData["settings"], value: string) {
    const settings = { ...data.settings, [key]: value };
    onChange({
      ...data,
      settings,
      journals: data.journals.map((journal) => ({ ...journal, researcherName: settings.researcherName })),
    });
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "weekly-research-journal.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onChange(JSON.parse(String(reader.result)) as AppData);
      } catch {
        alert("JSON 파일을 읽을 수 없습니다.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>기본 설정</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <label className="block text-sm font-medium">연구자명<Input value={data.settings.researcherName} onChange={(e) => updateSettings("researcherName", e.target.value)} /></label>
          <label className="block text-sm font-medium">기본 출근 시간<Input value={data.settings.defaultCheckIn} onChange={(e) => updateSettings("defaultCheckIn", e.target.value)} /></label>
          <label className="block text-sm font-medium">기본 퇴근 시간<Input value={data.settings.defaultCheckOut} onChange={(e) => updateSettings("defaultCheckOut", e.target.value)} /></label>
          <label className="block text-sm font-medium">시크릿 키<Input type="password" value={data.settings.secretKey} onChange={(e) => updateSettings("secretKey", e.target.value)} /></label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>데이터 관리</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={exportJson}><Download size={16} /> 데이터 내보내기 JSON</Button>
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input px-3 text-sm font-medium">
            <Upload size={16} /> 데이터 가져오기 JSON
            <input className="hidden" type="file" accept="application/json" onChange={(e) => importJson(e.target.files?.[0])} />
          </label>
          <div>
            <OutlineButton
              className="text-destructive"
              onClick={() => confirm("전체 데이터를 삭제하고 빈 상태로 초기화할까요? 샘플 데이터도 복원되지 않습니다.") && onReset()}
            >
              <RotateCcw size={16} /> 전체 데이터 초기화
            </OutlineButton>
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Firebase 자동 저장</CardTitle>
          <p className="text-sm text-muted-foreground">Google 계정으로 로그인하면 변경사항이 Firestore에 자동 저장됩니다.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!firebaseConfigured ? (
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              Firebase 환경 변수가 설정되지 않았습니다. .env 파일에 Firebase 웹 앱 설정값을 추가한 뒤 다시 실행하세요.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {firebaseUser ? (
                  <>
                    <Button disabled={firebaseSaving} onClick={onFirebasePush}><Cloud size={16} /> 지금 저장</Button>
                    <OutlineButton disabled={firebaseSaving} onClick={onFirebasePull}><RefreshCw size={16} /> 서버에서 다시 불러오기</OutlineButton>
                    <OutlineButton disabled={firebaseSaving} onClick={onFirebaseSignOut}><LogOut size={16} /> Firebase 로그아웃</OutlineButton>
                  </>
                ) : (
                  <Button onClick={onFirebaseSignIn}><LogIn size={16} /> Google 계정으로 Firebase 연결</Button>
                )}
              </div>

              {firebaseUser && (
                <div className="rounded-md bg-muted px-3 py-2 text-sm">
                  <div className="font-medium">{firebaseUser.displayName || firebaseUser.email || "Firebase 사용자"}</div>
                  <div className="mt-1 text-muted-foreground">{firebaseUser.email}</div>
                  <div className="mt-1 text-muted-foreground">마지막 저장: {lastCloudSave ? lastCloudSave.toLocaleString() : "아직 없음"}</div>
                </div>
              )}
            </>
          )}

          {firebaseStatus && <p className="rounded-md bg-muted px-3 py-2 text-sm">{firebaseStatus}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
