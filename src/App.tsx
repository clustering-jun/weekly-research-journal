import { addDays, format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { JournalEditor } from "./components/JournalEditor";
import { JournalViewer } from "./components/JournalViewer";
import { Login } from "./components/Login";
import { LockScreen } from "./components/LockScreen";
import { MonthlyView } from "./components/MonthlyView";
import { PrintView } from "./components/PrintView";
import { SettingsView } from "./components/SettingsView";
import { Shell, type View } from "./components/Shell";
import { SummaryEditor } from "./components/SummaryEditor";
import { WeekNavigator } from "./components/WeekNavigator";
import { emptyJournal, isoDate, mondayOf } from "./lib/utils";
import { isAuthenticated, loadData, resetData, saveData, setAuthenticated } from "./lib/storage";
import {
  isFirebaseConfigured,
  listenFirebaseAuth,
  loadCloudData,
  saveCloudData,
  signInFirebase,
  signOutFirebase,
  type FirebaseUser,
} from "./lib/firebaseSync";
import type { AppData, WeeklyJournal } from "./types";

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [locked, setLocked] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState("");
  const [firebaseSaving, setFirebaseSaving] = useState(false);
  const [cloudLoadedForUid, setCloudLoadedForUid] = useState<string | null>(null);
  const [lastCloudSave, setLastCloudSave] = useState<Date | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date("2026-03-02T00:00:00")));
  const [selectedDate, setSelectedDate] = useState(() => isoDate(weekStart));

  useEffect(() => saveData(data), [data]);

  useEffect(() => {
    return listenFirebaseAuth((user) => {
      setFirebaseUser(user);
      if (!user) {
        setCloudLoadedForUid(null);
        setFirebaseStatus(isFirebaseConfigured() ? "Firebase에 로그인하지 않았습니다." : "Firebase 환경 변수가 설정되지 않았습니다.");
      }
    });
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;

    let cancelled = false;
    setFirebaseStatus("Firebase 데이터를 불러오는 중입니다.");

    loadCloudData(firebaseUser.uid)
      .then(async (snapshot) => {
        if (cancelled) return;
        if (snapshot.data) {
          setData(snapshot.data);
          setLastCloudSave(snapshot.updatedAt);
          setFirebaseStatus(snapshot.updatedAt ? `Firebase 데이터 불러옴: ${snapshot.updatedAt.toLocaleString()}` : "Firebase 데이터를 불러왔습니다.");
        } else {
          await saveCloudData(firebaseUser.uid, data);
          if (cancelled) return;
          setLastCloudSave(new Date());
          setFirebaseStatus("Firebase에 새 데이터 문서를 만들었습니다.");
        }
        setCloudLoadedForUid(firebaseUser.uid);
      })
      .catch((error) => {
        if (!cancelled) setFirebaseStatus(error instanceof Error ? error.message : "Firebase 데이터를 불러오지 못했습니다.");
      });

    return () => {
      cancelled = true;
    };
  }, [firebaseUser?.uid]);

  useEffect(() => {
    if (!firebaseUser || cloudLoadedForUid !== firebaseUser.uid) return;

    setFirebaseStatus("Firebase 자동 저장 대기 중입니다.");
    const id = window.setTimeout(() => {
      setFirebaseSaving(true);
      saveCloudData(firebaseUser.uid, data)
        .then(() => {
          const now = new Date();
          setLastCloudSave(now);
          setFirebaseStatus(`Firebase 자동 저장 완료: ${now.toLocaleString()}`);
        })
        .catch((error) => {
          setFirebaseStatus(error instanceof Error ? error.message : "Firebase 자동 저장에 실패했습니다.");
        })
        .finally(() => setFirebaseSaving(false));
    }, 1500);

    return () => window.clearTimeout(id);
  }, [data, firebaseUser?.uid, cloudLoadedForUid]);

  const currentJournal = useMemo(() => {
    const id = isoDate(weekStart);
    return data.journals.find((journal) => journal.id === id);
  }, [data.journals, weekStart]);

  useEffect(() => {
    const fallbackJournal = currentJournal ?? emptyJournal(weekStart, data.settings.researcherName, data.settings.defaultCheckIn, data.settings.defaultCheckOut);
    setSelectedDate((date) => fallbackJournal.dailyEntries.some((entry) => entry.date === date) ? date : fallbackJournal.dailyEntries[0].date);
  }, [currentJournal, weekStart, data.settings.researcherName, data.settings.defaultCheckIn, data.settings.defaultCheckOut]);

  const journal = currentJournal ?? emptyJournal(weekStart, data.settings.researcherName, data.settings.defaultCheckIn, data.settings.defaultCheckOut);

  function updateJournal(next: WeeklyJournal) {
    setData((prev) => {
      const exists = prev.journals.some((item) => item.id === next.id);
      return {
        ...prev,
        journals: exists ? prev.journals.map((item) => (item.id === next.id ? next : item)) : [...prev.journals, next],
      };
    });
  }

  function changeWeek(date: Date) {
    const monday = mondayOf(date);
    setWeekStart(monday);
    setSelectedDate(isoDate(monday));
  }

  function openJournalDate(date: string) {
    setWeekStart(mondayOf(parseISO(date)));
    setSelectedDate(date);
    setView("journal");
  }

  function selectJournalDate(date: string) {
    setWeekStart(mondayOf(parseISO(date)));
    setSelectedDate(date);
  }

  async function signInToFirebase() {
    setFirebaseStatus("Firebase 로그인 중입니다.");
    try {
      await signInFirebase();
    } catch (error) {
      setFirebaseStatus(error instanceof Error ? error.message : "Firebase 로그인에 실패했습니다.");
    }
  }

  async function signOutFromFirebase() {
    try {
      await signOutFirebase();
      setFirebaseStatus("Firebase에서 로그아웃했습니다.");
    } catch (error) {
      setFirebaseStatus(error instanceof Error ? error.message : "Firebase 로그아웃에 실패했습니다.");
    }
  }

  async function pushFirebaseNow() {
    if (!firebaseUser) return;
    setFirebaseSaving(true);
    try {
      await saveCloudData(firebaseUser.uid, data);
      const now = new Date();
      setLastCloudSave(now);
      setFirebaseStatus(`Firebase에 즉시 저장했습니다: ${now.toLocaleString()}`);
    } catch (error) {
      setFirebaseStatus(error instanceof Error ? error.message : "Firebase 저장에 실패했습니다.");
    } finally {
      setFirebaseSaving(false);
    }
  }

  async function pullFirebaseNow() {
    if (!firebaseUser) return;
    setFirebaseStatus("Firebase에서 다시 불러오는 중입니다.");
    try {
      const snapshot = await loadCloudData(firebaseUser.uid);
      if (!snapshot.data) {
        setFirebaseStatus("Firebase에 저장된 데이터가 없습니다.");
        return;
      }
      setData(snapshot.data);
      setLastCloudSave(snapshot.updatedAt);
      setFirebaseStatus(snapshot.updatedAt ? `Firebase에서 다시 불러왔습니다: ${snapshot.updatedAt.toLocaleString()}` : "Firebase에서 다시 불러왔습니다.");
    } catch (error) {
      setFirebaseStatus(error instanceof Error ? error.message : "Firebase 불러오기에 실패했습니다.");
    }
  }

  if (!authed) {
    return <Login secretKey={data.settings.secretKey} onSuccess={() => { setAuthenticated(true); setAuthed(true); }} />;
  }

  const weekLabel = `${format(weekStart, "yyyy.MM.dd")} - ${format(addDays(weekStart, 6), "yyyy.MM.dd")} / 연구자 ${journal.researcherName}`;

  if (locked) {
    return <LockScreen researcherName={journal.researcherName} onUnlock={() => setLocked(false)} />;
  }

  return (
    <Shell view={view} onViewChange={setView} onLock={() => setLocked(true)} researcherName={journal.researcherName} weekLabel={weekLabel}>
      <WeekNavigator weekStart={weekStart} onChange={changeWeek} />
      {view === "dashboard" && <Dashboard journal={journal} journals={data.journals} />}
      {view === "monthly" && <MonthlyView journal={journal} journals={data.journals} onSelectDate={openJournalDate} />}
      {view === "journal" && <JournalEditor journal={journal} selectedDate={selectedDate} onSelectDate={setSelectedDate} onChange={updateJournal} />}
      {view === "viewer" && <JournalViewer journals={data.journals} selectedDate={selectedDate} onSelectDate={selectJournalDate} />}
      {view === "summary" && <SummaryEditor journal={journal} onChange={updateJournal} />}
      {view === "print" && <PrintView journal={journal} />}
      {view === "settings" && (
        <SettingsView
          data={data}
          onChange={setData}
          onReset={() => setData(resetData())}
          firebaseConfigured={isFirebaseConfigured()}
          firebaseUser={firebaseUser}
          firebaseStatus={firebaseStatus}
          firebaseSaving={firebaseSaving}
          lastCloudSave={lastCloudSave}
          onFirebaseSignIn={signInToFirebase}
          onFirebaseSignOut={signOutFromFirebase}
          onFirebasePush={pushFirebaseNow}
          onFirebasePull={pullFirebaseNow}
        />
      )}
    </Shell>
  );
}
