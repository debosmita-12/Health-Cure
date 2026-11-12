import { useState, useMemo } from "react";
import {
  CalendarIcon,
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  DoctorIcon,
} from "../icons/icons";

/**
 * AppointmentCalendar
 * Displays a dynamic 3-month appointment calendar starting from the current month.
 * Automatically marks all booked consultations with doctor details, time slot, and status.
 */
export default function AppointmentCalendar({
  appointments = [],
  onSelectDate,
  isDoctorView = false,
}) {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0); // 0 = Month 1 (Current), 1 = Month 2, 2 = Month 3
  const [viewMode, setViewMode] = useState("detailed"); // 'detailed' | 'overview'
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Current base date (today)
  const today = useMemo(() => new Date(), []);
  const todayDateStr = useMemo(() => {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }, [today]);

  // Compute the 3 consecutive months starting from the current month
  const threeMonths = useMemo(() => {
    const list = [];
    for (let offset = 0; offset < 3; offset++) {
      const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0 - 11
      const monthName = d.toLocaleString("default", { month: "long" });
      const totalDays = new Date(year, month + 1, 0).getDate();
      
      // Calculate first day of the week (Monday = 0, Sunday = 6)
      const firstDayOfWeek = new Date(year, month, 1).getDay();
      const mondayStartIndex = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1);

      list.push({
        index: offset,
        year,
        month,
        name: monthName,
        shortName: d.toLocaleString("default", { month: "short" }),
        totalDays,
        mondayStartIndex,
        label: `${monthName} ${year}`,
      });
    }
    return list;
  }, [today]);

  // Normalize appointment dates into "YYYY-MM-DD"
  function getApptDateString(appt) {
    const raw = appt.appointmentDate || appt.appointment_date || appt.date;
    if (!raw) return "";
    if (typeof raw === "string") {
      const ymdMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (ymdMatch) {
        return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
      }
      const dmyMatch = raw.match(/^(\d{2})-(\d{2})-(\d{4})/);
      if (dmyMatch) {
        return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
      }
      const dmySlashMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      if (dmySlashMatch) {
        return `${dmySlashMatch[3]}-${dmySlashMatch[2]}-${dmySlashMatch[1]}`;
      }
    }
    try {
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, "0");
        const d = String(parsed.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    } catch {
      // ignore
    }
    return "";
  }

  // Group appointments by "YYYY-MM-DD"
  const appointmentsByDate = useMemo(() => {
    const map = {};
    for (const appt of appointments) {
      const dateStr = getApptDateString(appt);
      if (dateStr) {
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(appt);
      }
    }
    return map;
  }, [appointments]);

  // Count appointments in each of the 3 months
  const appointmentCountsByMonth = useMemo(() => {
    return threeMonths.map((m) => {
      let count = 0;
      for (let day = 1; day <= m.totalDays; day++) {
        const dateStr = `${m.year}-${String(m.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        if (appointmentsByDate[dateStr]) {
          count += appointmentsByDate[dateStr].length;
        }
      }
      return count;
    });
  }, [threeMonths, appointmentsByDate]);

  const activeMonth = threeMonths[selectedMonthIndex] || threeMonths[0];

  function handlePrevMonth() {
    setSelectedMonthIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }

  function handleNextMonth() {
    setSelectedMonthIndex((prev) => (prev < 2 ? prev + 1 : 2));
  }

  // Days of week header (Monday - Sunday)
  const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="appointment-calendar-container" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 1. Header Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          background: "#FFFFFF",
          padding: "20px 24px",
          borderRadius: "16px",
          border: "1px solid var(--color-border-subtle, #E2F0EA)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#DEF4EC",
                color: "#174C40",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarIcon size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: "#174C40", fontSize: "1.3rem", fontWeight: 800 }}>
                Appointment Calendar
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.88rem", color: "var(--color-text-body, #4B5563)" }}>
                Dynamic 3-Month Clinical Schedule ({threeMonths[0]?.name} {threeMonths[0]?.year} – {threeMonths[2]?.name} {threeMonths[2]?.year})
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#174C40", display: "inline-block" }} />
              <strong>Booked Consultation</strong>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#2563EB", display: "inline-block" }} />
              <span>Today</span>
            </span>
          </div>

          <div style={{ display: "flex", background: "#F3F4F6", padding: "4px", borderRadius: "10px" }}>
            <button
              type="button"
              onClick={() => setViewMode("detailed")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: viewMode === "detailed" ? 700 : 500,
                background: viewMode === "detailed" ? "#174C40" : "transparent",
                color: viewMode === "detailed" ? "#FFFFFF" : "#4B5563",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Detailed Month Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("overview")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: viewMode === "overview" ? 700 : 500,
                background: viewMode === "overview" ? "#174C40" : "transparent",
                color: viewMode === "overview" ? "#FFFFFF" : "#4B5563",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              3-Month Overview
            </button>
          </div>
        </div>
      </div>

      {/* 2. Three Months Selector Pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          background: "#FFFFFF",
          padding: "12px 18px",
          borderRadius: "14px",
          border: "1px solid var(--color-border-subtle, #E2F0EA)",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={selectedMonthIndex === 0}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #D1D5DB",
            background: selectedMonthIndex === 0 ? "#F9FAFB" : "#FFFFFF",
            color: selectedMonthIndex === 0 ? "#9CA3AF" : "#174C40",
            cursor: selectedMonthIndex === 0 ? "not-allowed" : "pointer",
            fontWeight: 700,
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <ChevronIcon size={14} direction="left" /> Previous Month
        </button>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {threeMonths.map((m, idx) => {
            const isSelected = selectedMonthIndex === idx;
            const count = appointmentCountsByMonth[idx];
            return (
              <button
                key={m.label}
                type="button"
                onClick={() => {
                  setSelectedMonthIndex(idx);
                  setViewMode("detailed");
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  border: isSelected ? "2px solid #174C40" : "1px solid #E5E7EB",
                  background: isSelected ? "#174C40" : "#F9FAF9",
                  color: isSelected ? "#FFFFFF" : "#174C40",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: isSelected ? "0 4px 12px rgba(23, 76, 64, 0.2)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <span>{m.label}</span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    background: isSelected ? "#A7F3D0" : (count > 0 ? "#DEF7EC" : "#E5E7EB"),
                    color: isSelected ? "#064E3B" : (count > 0 ? "#03543F" : "#6B7280"),
                  }}
                >
                  {count} {count === 1 ? "Booked" : "Booked"}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          disabled={selectedMonthIndex === 2}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #D1D5DB",
            background: selectedMonthIndex === 2 ? "#F9FAFB" : "#FFFFFF",
            color: selectedMonthIndex === 2 ? "#9CA3AF" : "#174C40",
            cursor: selectedMonthIndex === 2 ? "not-allowed" : "pointer",
            fontWeight: 700,
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          Next Month <ChevronIcon size={14} direction="right" />
        </button>
      </div>

      {/* 3. Detailed Month View */}
      {viewMode === "detailed" && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "18px",
            border: "1px solid var(--color-border-subtle, #E2F0EA)",
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h4 style={{ margin: 0, fontSize: "1.2rem", color: "#174C40", fontWeight: 800 }}>
              {activeMonth.label}
            </h4>
            <span style={{ fontSize: "0.88rem", color: "#4B5563" }}>
              <strong>{appointmentCountsByMonth[selectedMonthIndex]}</strong> appointment(s) scheduled in this month
            </span>
          </div>

          {/* Days of Week Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "8px",
              textAlign: "center",
              marginBottom: "8px",
            }}
          >
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                style={{
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  color: "#174C40",
                  padding: "10px 4px",
                  background: "#F0FDF4",
                  borderRadius: "8px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "8px",
            }}
          >
            {/* Empty padding cells for days before the 1st */}
            {Array.from({ length: activeMonth.mondayStartIndex }).map((_, i) => (
              <div
                key={`pad-${i}`}
                style={{
                  minHeight: "105px",
                  background: "#F9FAFB",
                  borderRadius: "10px",
                  border: "1px dashed #E5E7EB",
                  opacity: 0.45,
                }}
              />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: activeMonth.totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${activeMonth.year}-${String(activeMonth.month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const dayAppts = appointmentsByDate[dateStr] || [];
              const hasAppointments = dayAppts.length > 0;
              const isToday = dateStr === todayDateStr;
              const isPast = dateStr < todayDateStr;

              return (
                <div
                  key={dateStr}
                  style={{
                    minHeight: "105px",
                    background: hasAppointments ? "#ECFDF5" : (isToday ? "#EFF6FF" : "#FFFFFF"),
                    border: hasAppointments
                      ? "2px solid #174C40"
                      : (isToday ? "2px solid #2563EB" : "1px solid #E5E7EB"),
                    borderRadius: "12px",
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease",
                    boxShadow: hasAppointments ? "0 4px 12px rgba(23, 76, 64, 0.12)" : "none",
                    position: "relative",
                  }}
                >
                  {/* Day Header Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: hasAppointments || isToday ? 800 : 600,
                        color: hasAppointments ? "#174C40" : (isToday ? "#2563EB" : (isPast ? "#9CA3AF" : "#374151")),
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isToday ? "#DBEAFE" : (hasAppointments ? "#D1FAE5" : "transparent"),
                      }}
                    >
                      {dayNum}
                    </span>

                    {isToday && (
                      <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#1D4ED8", background: "#DBEAFE", padding: "1px 6px", borderRadius: "999px" }}>
                        Today
                      </span>
                    )}

                    {hasAppointments && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          color: "#FFFFFF",
                          background: "#174C40",
                          padding: "1px 6px",
                          borderRadius: "999px",
                        }}
                      >
                        {dayAppts.length} {dayAppts.length === 1 ? "Appt" : "Appts"}
                      </span>
                    )}
                  </div>

                  {/* Day Content: Booked Appointment Cards */}
                  {hasAppointments ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                      {dayAppts.map((appt) => (
                        <div
                          key={appt.id || appt.referenceCode}
                          onClick={() => setSelectedAppointment(appt)}
                          style={{
                            background: "#FFFFFF",
                            border: "1px solid #A7F3D0",
                            borderRadius: "6px",
                            padding: "4px 6px",
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#174C40")}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#A7F3D0")}
                        >
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#174C40", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {isDoctorView ? (appt.patientName || "Patient") : (appt.preferredDoctor || "Doctor")}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "#065F46", fontWeight: 600 }}>
                            {appt.timeSlot ? appt.timeSlot.split("(")[0].trim() : "Scheduled"}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                            <span style={{ fontSize: "0.65rem", color: "#047857", fontWeight: 700 }}>
                              {(appt.specialty || "Clinic").split("&")[0].trim()}
                            </span>
                            <span
                              style={{
                                fontSize: "0.62rem",
                                padding: "1px 4px",
                                borderRadius: "4px",
                                background: "#DEF7EC",
                                color: "#03543F",
                                fontWeight: 700,
                              }}
                            >
                              {appt.status || "CONFIRMED"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Empty day: allow booking if future */
                    !isPast && onSelectDate && (
                      <div style={{ textAlign: "center", marginTop: "auto" }}>
                        <button
                          type="button"
                          onClick={() => onSelectDate(dateStr)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#9CA3AF",
                            fontSize: "0.72rem",
                            cursor: "pointer",
                            padding: "2px 4px",
                            borderRadius: "4px",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#174C40";
                            e.currentTarget.style.background = "#F0FDF4";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#9CA3AF";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          + Book Slot
                        </button>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Three-Month Overview View (Side-by-side) */}
      {viewMode === "overview" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {threeMonths.map((m, mIdx) => (
            <div
              key={m.label}
              style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                border: selectedMonthIndex === mIdx ? "2px solid #174C40" : "1px solid var(--color-border-subtle, #E2F0EA)",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h4 style={{ margin: 0, fontSize: "1.05rem", color: "#174C40", fontWeight: 800 }}>
                  {m.label}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMonthIndex(mIdx);
                    setViewMode("detailed");
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "1px solid #174C40",
                    background: "transparent",
                    color: "#174C40",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Open Month →
                </button>
              </div>

              {/* Mini Header */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center", marginBottom: "6px" }}>
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6B7280" }}>
                    {d.slice(0, 2)}
                  </div>
                ))}
              </div>

              {/* Mini Days Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center" }}>
                {Array.from({ length: m.mondayStartIndex }).map((_, i) => (
                  <div key={`mini-pad-${i}`} style={{ height: "34px", opacity: 0.2 }} />
                ))}

                {Array.from({ length: m.totalDays }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${m.year}-${String(m.month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const dayAppts = appointmentsByDate[dateStr] || [];
                  const hasAppt = dayAppts.length > 0;
                  const isToday = dateStr === todayDateStr;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        if (hasAppt) {
                          setSelectedAppointment(dayAppts[0]);
                        } else if (onSelectDate) {
                          onSelectDate(dateStr);
                        }
                      }}
                      style={{
                        height: "36px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontWeight: hasAppt ? 800 : (isToday ? 700 : 500),
                        background: hasAppt ? "#174C40" : (isToday ? "#DBEAFE" : "#F9FAFB"),
                        color: hasAppt ? "#FFFFFF" : (isToday ? "#1E40AF" : "#374151"),
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.15s ease",
                      }}
                      title={hasAppt ? `${dayAppts.length} Appointment(s) on ${dateStr}` : dateStr}
                    >
                      <span>{dayNum}</span>
                      {hasAppt && (
                        <span
                          style={{
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: "#34D399",
                            position: "absolute",
                            bottom: "3px",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Appointment Details Popup / Modal */}
      {selectedAppointment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              maxWidth: "520px",
              width: "100%",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "#DEF7EC",
                    color: "#03543F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: "#174C40", fontSize: "1.25rem", fontWeight: 800 }}>
                    Consultation Details
                  </h4>
                  <span style={{ fontSize: "0.82rem", color: "#6B7280" }}>
                    Reference: <code>{selectedAppointment.referenceCode || selectedAppointment.reference_code || "HC-CONFIRMED"}</code>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6B7280",
                  padding: "4px",
                }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {/* Modal Content Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.92rem" }}>
              <div style={{ padding: "12px 16px", background: "#F0FDF4", borderRadius: "10px", border: "1px solid #BBF7D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#166534", fontWeight: 700 }}>Status</span>
                <span style={{ background: "#166534", color: "#FFFFFF", padding: "3px 10px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 800 }}>
                  <CheckIcon size={12} /> {selectedAppointment.status || "CONFIRMED"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "12px", background: "#F9FAFB", borderRadius: "10px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#6B7280", display: "block" }}>Scheduled Date</span>
                  <strong style={{ color: "#111827" }}>
                    {getApptDateString(selectedAppointment)}
                  </strong>
                </div>

                <div style={{ padding: "12px", background: "#F9FAFB", borderRadius: "10px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#6B7280", display: "block" }}>Time Slot</span>
                  <strong style={{ color: "#111827" }}>
                    {selectedAppointment.timeSlot || selectedAppointment.time_slot || "Morning (09:00 - 12:00)"}
                  </strong>
                </div>
              </div>

              <div style={{ padding: "12px", background: "#F9FAFB", borderRadius: "10px" }}>
                <span style={{ fontSize: "0.78rem", color: "#6B7280", display: "block" }}>
                  {isDoctorView ? "Patient Name" : "Attending Physician"}
                </span>
                <strong style={{ color: "#174C40", fontSize: "1.05rem" }}>
                  {isDoctorView ? (selectedAppointment.patientName || "Patient") : (selectedAppointment.preferredDoctor || "Dr. Rajesh Sharma")}
                </strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#4B5563" }}>
                  Specialty: <strong>{selectedAppointment.specialty || "Cardiology & Vascular"}</strong>
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "12px", background: "#F9FAFB", borderRadius: "10px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#6B7280", display: "block" }}>Consultation Mode</span>
                  <strong style={{ color: "#111827" }}>
                    {selectedAppointment.consultationType || selectedAppointment.consultation_type || "In-Clinic Visit"}
                  </strong>
                </div>

                <div style={{ padding: "12px", background: "#F9FAFB", borderRadius: "10px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#6B7280", display: "block" }}>Location</span>
                  <strong style={{ color: "#111827" }}>Health &amp; Cure Hospital</strong>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div style={{ padding: "12px", background: "#F9FAFB", borderRadius: "10px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#6B7280", display: "block" }}>Reason / Clinical Notes</span>
                  <p style={{ margin: "4px 0 0", color: "#374151" }}>{selectedAppointment.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedAppointment(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
