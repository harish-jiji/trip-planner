"use client";

import { useState } from "react";

import { LocationStop } from "@/types/trip";
import { calculateTripCost } from "@/lib/tripUtils";
import { ACTIVITY_META } from "@/lib/activityIcons";

interface Props {
    locations: LocationStop[];
    totalDistance?: string;
    totalDuration?: string;
}

export default function TripTimeline({ locations, totalDistance, totalDuration }: Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const costs = calculateTripCost(locations);

    return (
        <div style={{ marginTop: "40px", padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", color: "#111" }}>Trip Timeline</h2>

            {/* Summary Header */}
            {(parseFloat(totalDistance || "0") > 0 || parseFloat(totalDuration || "0") > 0) && (
                <div style={{
                    display: "flex",
                    gap: "20px",
                    marginBottom: "30px",
                    padding: "15px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0"
                }}>
                    {parseFloat(totalDistance || "0") > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "1.2rem" }}>📏</span>
                            <div>
                                <div style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Distance</div>
                                <div style={{ fontWeight: "600", color: "#0f172a" }}>{totalDistance} km</div>
                            </div>
                        </div>
                    )}
                    {parseFloat(totalDuration || "0") > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "1.2rem" }}>⏱️</span>
                            <div>
                                <div style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Travel Time</div>
                                <div style={{ fontWeight: "600", color: "#0f172a" }}>
                                    {parseInt(totalDuration || "0") > 60
                                        ? `${(parseInt(totalDuration || "0") / 60).toFixed(1)} hrs`
                                        : `${totalDuration} mins`}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Timeline */}
            <div style={{ position: "relative", paddingLeft: "20px" }}>
                {locations.map((loc, idx) => {
                    const isLast = idx === locations.length - 1;
                    const hasTime = loc.time?.arrival || loc.time?.departure;

                    return (
                        <div key={idx} style={{ display: "flex", gap: "20px", marginBottom: isLast ? "0" : "40px", position: "relative" }}>

                            {/* Vertical Line */}
                            {!isLast && (
                                <div style={{
                                    position: "absolute",
                                    left: "14px",
                                    top: "35px",
                                    bottom: "-40px",
                                    width: "2px",
                                    background: "#e2e8f0",
                                    zIndex: 0
                                }} />
                            )}

                            {/* Number/Bullet */}
                            <div style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                background: "#3b82f6",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                zIndex: 1,
                                flexShrink: 0,
                                marginTop: "2px"
                            }}>
                                {idx + 1}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>

                                {/* Clickable Header */}
                                <div
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", cursor: "pointer" }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "0.8rem", color: "#64748b", transition: "transform 0.2s", transform: openIndex === idx ? "rotate(90deg)" : "rotate(0deg)" }}>
                                            ▶
                                        </span>
                                        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#1e293b", fontWeight: "600" }}>
                                            {loc.name || `Stop ${idx + 1}`}
                                        </h3>
                                    </div>

                                    {/* Show brief Time summary if NOT expanded (or if you prefer always showing it in header) */}
                                    {/* Actually, user requested collapsible expands to show details. Let's keep it clean. */}
                                </div>

                                {/* Collapsible Content */}
                                {openIndex === idx && (
                                    <div style={{ paddingLeft: "20px", marginTop: "10px" }}>
                                        {hasTime && (
                                            <div style={{
                                                fontSize: "0.85rem",
                                                color: "#64748b",
                                                background: "#f1f5f9",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                display: "inline-block",
                                                marginBottom: "12px"
                                            }}>
                                                ⏰ {loc.time?.arrival && loc.time?.departure
                                                    ? `${loc.time?.arrival} – ${loc.time?.departure}`
                                                    : loc.time?.arrival
                                                        ? `Arrives ${loc.time?.arrival}`
                                                        : `Departs ${loc.time?.departure}`
                                                }
                                            </div>
                                        )}

                                        {/* Activities */}
                                        {loc.activities && loc.activities.length > 0 && (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                                                {loc.activities.map((act) => (
                                                    <span key={act} style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                        background: "#fff7ed",
                                                        color: "#c2410c",
                                                        padding: "4px 10px",
                                                        borderRadius: "20px",
                                                        fontSize: "0.85rem",
                                                        border: "1px solid #ffedd5"
                                                    }}>
                                                        <span>{ACTIVITY_META[act]?.icon || "⭐"}</span>
                                                        <span>{ACTIVITY_META[act]?.label || act}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Individual Location Costs */}
                                        {loc.expenses && (
                                            <div style={{ fontSize: "0.85rem", color: "#64748b", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                                {loc.expenses.entry ? <span>🎟️ Entry ₹{loc.expenses.entry}</span> : null}
                                                {loc.expenses.food ? <span>🍴 Food ₹{loc.expenses.food}</span> : null}
                                                {loc.expenses.entry || loc.expenses.food ? null : (loc.expenses.travel || loc.expenses.other ? <span>💰 Misc expenses</span> : null)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Cost Summary Footer */}
            <div style={{
                marginTop: "40px",
                borderTop: "2px dashed #e2e8f0",
                paddingTop: "20px"
            }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "15px", color: "#334155" }}>💰 Estimated Trip Cost</h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "15px", marginBottom: "20px" }}>
                    <div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Entry Fees</div>
                        <div style={{ fontSize: "1rem", fontWeight: "500" }}>₹{costs.entry}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Food & Dining</div>
                        <div style={{ fontSize: "1rem", fontWeight: "500" }}>₹{costs.food}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Travel</div>
                        <div style={{ fontSize: "1rem", fontWeight: "500" }}>₹{costs.travel}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Other</div>
                        <div style={{ fontSize: "1rem", fontWeight: "500" }}>₹{costs.other}</div>
                    </div>
                </div>

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#1e293b",
                    color: "white",
                    padding: "15px 20px",
                    borderRadius: "8px"
                }}>
                    <span style={{ fontWeight: "500" }}>Total Trip Cost</span>
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>₹{costs.total}</span>
                </div>
            </div>
        </div>
    );
}
