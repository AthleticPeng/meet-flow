"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Plus, Users, Calendar, User, CalendarCheck, BellRing, AlertTriangle, Mail, CalendarClock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeSlot = string; // "day-hour", e.g. "0-9" = Monday 9am

type Member = {
  id: string;
  name: string;
  color: string;
  availability: TimeSlot[];
};

type Meeting = {
  id: string;
  title: string;
  slot: TimeSlot;
  status: 'confirmed' | 'conflict';
  conflictMembers?: string[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ["週一", "週二", "週三", "週四", "週五"];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const COLORS = [
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-cyan-500",
];

const slot = (day: number, hour: number): TimeSlot => `${day}-${hour}`;

// ─── Fake initial data ────────────────────────────────────────────────────────

// 假資料：三人皆有「週三 9–11」共同空閒，方便展示
const INITIAL_MEMBERS: Member[] = [
  {
    id: "me",
    name: "我",
    color: "bg-blue-500",
    availability: [
      slot(0, 9), slot(0, 10), slot(0, 11),          // Mon 9–12
      slot(0, 14), slot(0, 15), slot(0, 16),         // Mon 14–17
      slot(2, 9),  slot(2, 10), slot(2, 11),         // Wed 9–12（共同）
      slot(3, 14), slot(3, 15), slot(3, 16),         // Thu 14–17
      slot(4, 9),  slot(4, 10),                      // Fri 9–11
    ],
  },
  {
    id: "xiao-liang",
    name: "小梁",
    color: "bg-green-500",
    availability: [
      slot(0, 9),  slot(0, 10), slot(0, 11),         // Mon 9–12
      slot(2, 9),  slot(2, 10), slot(2, 11),         // Wed 9–12（共同）
      slot(2, 14), slot(2, 15), slot(2, 16),         // Wed 14–17
      slot(4, 9),  slot(4, 10),                      // Fri 9–11
    ],
  },
  {
    id: "lu-lu",
    name: "盧盧",
    color: "bg-purple-500",
    availability: [
      slot(1, 10), slot(1, 11), slot(1, 12),         // Tue 10–13
      slot(2, 9),  slot(2, 10), slot(2, 11),         // Wed 9–12（共同）
      slot(3, 14), slot(3, 15),                      // Thu 14–16
    ],
  },
];

// ─── Schedule Grid Component ──────────────────────────────────────────────────

function ScheduleGrid({
  availability,
  onToggle,
  emerald = false,
}: {
  availability: TimeSlot[];
  onToggle?: (day: number, hour: number) => void;
  emerald?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="w-14" />
            {DAYS.map((d) => (
              <th key={d} className="p-2 text-center font-medium text-sm">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((h) => (
            <tr key={h}>
              <td className="text-right pr-3 text-muted-foreground text-xs py-0.5 whitespace-nowrap">
                {h}:00
              </td>
              {DAYS.map((_, d) => {
                const s = slot(d, h);
                const active = availability.includes(s);
                const cellClass = active
                  ? emerald
                    ? "bg-emerald-400 border-emerald-400"
                    : "bg-primary border-primary"
                  : "bg-muted border-border hover:bg-muted/60";
                return (
                  <td key={d} className="p-0.5">
                    <div
                      className={`h-8 rounded border transition-colors ${cellClass} ${onToggle ? "cursor-pointer" : "cursor-default"}`}
                      onClick={() => onToggle?.(d, h)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex gap-4 mb-5 text-xs text-muted-foreground">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded ${item.color}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function MeetFlow() {
  const [activeTab, setActiveTab] = useState("members");
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);
  const [viewId, setViewId] = useState("xiao-liang");

  // AI Reminder states
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingDay, setNewMeetingDay] = useState(0);
  const [newMeetingHour, setNewMeetingHour] = useState(9);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [reminderMeeting, setReminderMeeting] = useState<Meeting | null>(null);

  const me = members.find((m) => m.id === "me")!;
  const others = members.filter((m) => m.id !== "me");
  const viewing = members.find((m) => m.id === viewId) ?? others[0];

  const commonSlots = DAYS.flatMap((_, d) =>
    HOURS.filter((h) =>
      members.every((m) => m.availability.includes(slot(d, h)))
    ).map((h) => slot(d, h))
  );

  function toggleMySlot(day: number, hour: number) {
    const s = slot(day, hour);
    setMembers((prev) =>
      prev.map((m) =>
        m.id !== "me"
          ? m
          : {
              ...m,
              availability: m.availability.includes(s)
                ? m.availability.filter((x) => x !== s)
                : [...m.availability, s],
            }
      )
    );
  }

  function addMember() {
    const name = newName.trim();
    if (!name) return;
    const color = COLORS[members.length % COLORS.length];
    const newMember: Member = {
      id: `member-${Date.now()}`,
      name,
      color,
      availability: [],
    };
    setMembers((prev) => [...prev, newMember]);
    setNewName("");
    setOpen(false);
  }

  // AI Reminder logic
  function handleAddMeeting() {
    const s = slot(newMeetingDay, newMeetingHour);
    const conflictMembers = members.filter(m => !m.availability.includes(s)).map(m => m.name);
    
    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title: newMeetingTitle,
      slot: s,
      status: conflictMembers.length > 0 ? 'conflict' : 'confirmed',
      conflictMembers,
    };

    if (conflictMembers.length > 0) {
      setReminderMeeting(newMeeting);
    } else {
      setMeetings(prev => [...prev, newMeeting]);
    }
    
    setMeetingOpen(false);
    setNewMeetingTitle("");
  }

  function handleConfirmConflict() {
    if (reminderMeeting) {
      setMeetings(prev => [...prev, { ...reminderMeeting, status: 'conflict' }]);
      setReminderMeeting(null);
    }
  }

  function handleReschedule() {
    setReminderMeeting(null);
    setActiveTab("common");
  }

  function removeMeeting(id: string) {
    setMeetings(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarCheck className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">MeetFlow</h1>
            <Badge variant="secondary" className="text-xs font-normal">
              Beta
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs font-normal border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400 flex items-center gap-1.5">
            <BellRing className="w-3 h-3" />
            AI Reminder Enabled
          </Badge>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 h-10 overflow-x-auto justify-start sm:justify-center w-full flex-nowrap">
            <TabsTrigger value="members" className="gap-1.5 text-sm shrink-0">
              <Users className="w-3.5 h-3.5" />
              成員
            </TabsTrigger>
            <TabsTrigger value="my-schedule" className="gap-1.5 text-sm shrink-0">
              <User className="w-3.5 h-3.5" />
              我的時間表
            </TabsTrigger>
            <TabsTrigger value="view-member" className="gap-1.5 text-sm shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              查看成員
            </TabsTrigger>
            <TabsTrigger value="common" className="gap-1.5 text-sm shrink-0">
              <CalendarCheck className="w-3.5 h-3.5" />
              共同空閒
            </TabsTrigger>
            <TabsTrigger value="meetings" className="gap-1.5 text-sm shrink-0 text-blue-600 dark:text-blue-400 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950">
              <BellRing className="w-3.5 h-3.5" />
              會議與提醒
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Members ── */}
          <TabsContent value="members">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold">成員列表</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  共 {members.length} 位成員
                </p>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    加入成員
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xs">
                  <DialogHeader>
                    <DialogTitle>加入新成員</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 mt-2">
                    <Input
                      placeholder="輸入成員名稱"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addMember()}
                      autoFocus
                    />
                    <Button onClick={addMember} disabled={!newName.trim()}>
                      確認加入
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.map((m) => (
                <Card key={m.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback
                        className={`${m.color} text-white text-sm font-semibold`}
                      >
                        {m.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.availability.length} 個空閒時段
                      </p>
                    </div>
                    {m.id === "me" && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        你
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab 2: My Schedule ── */}
          <TabsContent value="my-schedule">
            <div className="mb-5">
              <h2 className="text-base font-semibold">我的時間表</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                點擊格子來切換你的空閒時段
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <Legend
                  items={[
                    { color: "bg-primary", label: "空閒" },
                    { color: "bg-muted border border-border", label: "忙碌" },
                  ]}
                />
                <ScheduleGrid
                  availability={me.availability}
                  onToggle={toggleMySlot}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 3: View Member ── */}
          <TabsContent value="view-member">
            <div className="mb-5">
              <h2 className="text-base font-semibold">查看成員時間表</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                選擇成員來查看他們的空閒時段
              </p>
            </div>

            {others.length === 0 ? (
              <p className="text-muted-foreground text-sm py-12 text-center">
                尚無其他成員，請先在「成員」頁加入
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-5">
                  {others.map((m) => (
                    <Button
                      key={m.id}
                      variant={viewing?.id === m.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewId(m.id)}
                    >
                      {m.name}
                    </Button>
                  ))}
                </div>

                {viewing && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback
                            className={`${viewing.color} text-white text-xs font-semibold`}
                          >
                            {viewing.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {viewing.name} 的時間表
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Legend
                        items={[
                          { color: "bg-primary", label: "空閒" },
                          {
                            color: "bg-muted border border-border",
                            label: "忙碌",
                          },
                        ]}
                      />
                      <ScheduleGrid availability={viewing.availability} />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* ── Tab 4: Common Availability ── */}
          <TabsContent value="common">
            <div className="mb-5">
              <h2 className="text-base font-semibold">共同空閒時間</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                所有 {members.length} 位成員都空閒的時段
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Legend
                  items={[
                    { color: "bg-emerald-400", label: "共同空閒" },
                    { color: "bg-muted border border-border", label: "非共同" },
                  ]}
                />
                {commonSlots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10 text-sm">
                    目前沒有共同空閒時段
                  </p>
                ) : (
                  <ScheduleGrid availability={commonSlots} emerald />
                )}
              </CardContent>
            </Card>

            {commonSlots.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {commonSlots.map((s) => {
                  const [d, h] = s.split("-").map(Number);
                  return (
                    <div
                      key={s}
                      className="text-sm px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200"
                    >
                      {DAYS[d]} {h}:00–{h + 1}:00
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── Tab 5: Meetings & AI Reminder ── */}
          <TabsContent value="meetings">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold">會議與自動提醒</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  MeetFlow AI Reminder 會自動偵測衝突並發送通知
                </p>
              </div>
              <Dialog open={meetingOpen} onOpenChange={setMeetingOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4" />
                    安排新會議
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>安排新會議</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">會議名稱</label>
                      <Input
                        placeholder="例如：產品同步會議"
                        value={newMeetingTitle}
                        onChange={(e) => setNewMeetingTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && newMeetingTitle.trim() && handleAddMeeting()}
                        autoFocus
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">日期</label>
                        <select 
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={newMeetingDay} 
                          onChange={e => setNewMeetingDay(Number(e.target.value))}
                        >
                          {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">時間</label>
                        <select 
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={newMeetingHour} 
                          onChange={e => setNewMeetingHour(Number(e.target.value))}
                        >
                          {HOURS.map((h, i) => <option key={i} value={h}>{h}:00</option>)}
                        </select>
                      </div>
                    </div>
                    <Button onClick={handleAddMeeting} disabled={!newMeetingTitle.trim()}>
                      安排會議
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Reminder Dialog / Notification System */}
            <Dialog open={!!reminderMeeting} onOpenChange={(open) => !open && setReminderMeeting(null)}>
              <DialogContent className="sm:max-w-md border-red-200 bg-red-50 dark:bg-red-950/20">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    衝突預警 (MeetFlow AI Reminder)
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-2 space-y-4">
                  <p className="text-sm text-foreground">
                    系統偵測到 <strong>{reminderMeeting?.title}</strong> ({reminderMeeting ? DAYS[Number(reminderMeeting.slot.split('-')[0])] : ''} {reminderMeeting ? reminderMeeting.slot.split('-')[1] : ''}:00) 與以下成員的現有行程重疊：
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {reminderMeeting?.conflictMembers?.map(name => (
                      <Badge variant="destructive" key={name}>{name}</Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                    <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                    <p><strong>多平台同步：</strong>已自動發送 Email 提醒至所有參與者信箱，確保資訊一致，避免延誤。</p>
                  </div>

                  <div className="flex justify-end gap-3 mt-4 pt-2">
                    <Button variant="outline" onClick={handleReschedule}>
                      要求改期 (尋找共同空閒)
                    </Button>
                    <Button variant="default" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirmConflict}>
                      一鍵確認參加
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Meeting List */}
            <div className="space-y-3">
              {meetings.length === 0 ? (
                <Card className="border-dashed shadow-none bg-muted/30">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CalendarClock className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-medium">目前無已安排的會議</p>
                    <p className="text-xs mt-1 opacity-70">點擊上方按鈕開始安排會議，系統將自動為您檢查衝突</p>
                  </CardContent>
                </Card>
              ) : (
                meetings.map(m => {
                  const [d, h] = m.slot.split('-');
                  const isConflict = m.status === 'conflict';
                  return (
                    <Card key={m.id} className={`transition-all ${isConflict ? 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20' : ''}`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-base flex items-center gap-2">
                            {m.title}
                            {isConflict && <Badge variant="destructive" className="text-[10px] h-5 px-1.5 py-0">衝突</Badge>}
                            {m.status === 'confirmed' && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 text-[10px] h-5 px-1.5 py-0 border-transparent">已確認</Badge>}
                          </h3>
                          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                            <CalendarClock className="w-3.5 h-3.5" />
                            {DAYS[Number(d)]} {h}:00 - {Number(h)+1}:00
                          </div>
                          {isConflict && m.conflictMembers && (
                            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                              與 {m.conflictMembers.join('、')} 衝突
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => removeMeeting(m.id)}>取消會議</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}