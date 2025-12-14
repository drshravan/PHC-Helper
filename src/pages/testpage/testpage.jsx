/* Kayakalp PHC Assessment - React Starter (single-file)

How to use

1. Create a React app (Vite or CRA). Copy this file into src/App.jsx


2. Ensure Tailwind is setup (the styles use Tailwind classes). You can remove/change styling if not using Tailwind.


3. Optional: integrate Firebase or backend by replacing localStorage calls and mock data.


4. If you have the Kayakalp Excel, I can parse and generate the form JSON; upload it and I'll convert.



Features in this starter:

Simple OTP-like login (mocked)

PHC Dashboard showing score and progress

Assessment module with dynamic sections (sample data included)

Photo upload (uses local preview)

Save to localStorage and export JSON

Admin view to list PHCs


This is intentionally single-file for quick preview and iteration. Replace local mock logic with real API calls when ready. */

import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";

// ---------- Sample form schema (you'll replace this with parsed Excel -> JSON) ----------
const SAMPLE_SCHEMA = [
    { id: "facility_upkeep", title: "Hospital / Facility Upkeep", weight: 100, checkpoints: [
        { id: "fu_1", title: "Entrance & premises clean", description: "Clean, swept and free of garbage", maxScore: 2 },
        { id: "fu_2", title: "Reception & waiting area maintained", description: "Chairs, floor, signage as per norms", maxScore: 2 }
    ] },
    { id: "sanitation", title: "Sanitation & Hygiene", weight: 120, checkpoints: [
        { id: "s_1", title: "Toilets functional & clean", description: "Water available, doors functional", maxScore: 2 },
        { id: "s_2", title: "Handwashing stations", description: "Soap and water/handrub available", maxScore: 2 }
    ] }
]

// ---------- Utilities ----------
const uid = () => Math.random().toString(36).slice(2, 9);

// compute score (sum of checkpoint scores) and max possible
function computeScores(schema, responses) {
    let total = 0;
    let maxTotal = 0;
    schema.map((sec) => {
        let secScore = 0;
        let secMax = 0;
        sec.checkpoints.forEach((cp) => {
            secMax += cp.maxScore;
            const resp = responses?.[cp.id]?.score ?? 0;
            secScore += Number(resp);
        });
        total += secScore;
        maxTotal += secMax;
        return { id: sec.id, title: sec.title, score: secScore, max: secMax };
    });
    return { total, maxTotal };
}

// ---------- App ----------
export default function TestPage() {
    return (
<<<<<<< HEAD
        <div
            style={{
                maxWidth: "1280px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                margin: "20px",
                padding: "20px",
                border: "2px solid #ccc",
                borderRadius: "10px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.53)",
                textAlign: "center",
            }}
        >
            <h1
                style={{
                    color: "green",
                    backgroundColor: "lightgray",
                    padding: "10px",
                    borderRadius: "50px",
                    textAlign: "center",
                    fontFamily: "Arial, sans-serif",
                    fontWeight: "bold",
                    fontSize: "24px",
                }}
            >
                This is a test page
            </h1>
            
            <p
                style={{
                    color: "blue",
                }}
            >
                Welcome to the test page. This is a simple example to demonstrate a
                React component.
            </p>

            <button
                style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#fff",
                    backgroundColor: "#28a745",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#218838")
                }
                onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#28a745")
                }
                onClick={handleAddItem}
            >
                Add Item
            </button>

            <ul
                style={{
                    listStyleType: "circle",
                    padding: "10px",
                    margin: "0",
                    color: "#333",
                    fontFamily: "Verdana, sans-serif",
                    fontSize: "18px",
                }}
            >
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
            <div style={
                {
                    color : "red",
                    maxHeight: "2560px",
                    minHeight: "1000px",
                    textAlign: "center",
                    fontWeight: "bold",
                    marginTop: "10px",
                    fontSize: "18px",
                    fontFamily: "Verdana, sans-serif",
                }
            }>
                
            </div>

            

=======
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Routes>
                <Route index element={<Login />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="assessment/:phcId" element={<AssessmentWrapper />} />
                <Route path="admin" element={<Admin />} />
            </Routes>
>>>>>>> 54e2503290e65cd7688e06c490e72ed25535334e
        </div>
    );
}

// ---------- Simple Auth (mock) ----------
function useAuth() {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("kh_user")) || null);
    useEffect(() => {
        localStorage.setItem("kh_user", JSON.stringify(user));
    }, [user]);
    return { user, setUser };
}

function Login() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [phcCode, setPhcCode] = useState("");

    function submit() {
        // mock OTP flow: accept any code
        const u = { id: uid(), phcCode: phcCode || "PHC-000", role: "facility" };
        setUser(u);
        navigate("dashboard");
    }

    return (
        <div className="max-w-md mx-auto p-6 pt-20">
            <div className="bg-white p-6 rounded-2xl shadow">
                <h1 className="text-2xl font-semibold mb-2">PHC Kayakalp Portal</h1>
                <p className="text-sm text-gray-600 mb-4">Login with your PHC code or phone number</p>
                <input value={phcCode} onChange={(e) => setPhcCode(e.target.value)} placeholder="Enter PHC code or phone" className="w-full border p-3 rounded-lg mb-3" />
                <button onClick={submit} className="w-full bg-blue-600 text-white py-3 rounded-lg"> Login / Continue </button>
                <div className="mt-4 text-xs text-gray-500">This is a demo login (no real OTP). Replace with Firebase Auth for production.</div>
            </div>
        </div>
    );
}

// ---------- Dashboard ----------
function Dashboard() {
    const navigate = useNavigate();

    // load or create a sample PHC record in localStorage
    useEffect(() => {
        const existing = JSON.parse(localStorage.getItem("kh_phcs")) || {};
        if (!existing["PHC-001"]) {
            existing["PHC-001"] = { id: "PHC-001", name: "PHC Malkapur", code: "PHC-001", lastUpdated: null, responses: {} };
            existing["PHC-002"] = { id: "PHC-002", name: "PHC Ghanpur", code: "PHC-002", lastUpdated: null, responses: {} };
            localStorage.setItem("kh_phcs", JSON.stringify(existing));
        }
    }, []);

    const phcs = useMemo(() => JSON.parse(localStorage.getItem("kh_phcs")) || {}, []);
    const phcList = Object.values(phcs);

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Dashboard</h2>
                <div className="flex gap-2">
                    <Link to="../admin" className="text-sm px-3 py-2 bg-gray-200 rounded">Admin</Link>
                </div>
            </div>

            <div className="space-y-3">
                {phcList.map((p) => (
                    <div key={p.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                        <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500">Code: {p.code}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm">Last updated</div>
                            <div className="text-xs text-gray-500">{p.lastUpdated ? new Date(p.lastUpdated).toLocaleString() : "Never"}</div>
                            <button onClick={() => navigate(`../assessment/${p.id}`)} className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded">
                                Open
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-sm text-gray-600">Tip: Use the Admin view to bulk manage PHCs (demo data stored in localStorage).</div>
        </div>
    );
}

// ---------- Assessment Wrapper (reads phcId param) ----------
function AssessmentWrapper() {
    const { phcId } = useParams();
    const navigate = useNavigate();
    if (!phcId) {
        navigate("../dashboard");
        return null;
    }
    return <Assessment phcId={phcId} />;
}

// ---------- Assessment Page ----------
function Assessment({ phcId }) {
    const [schema, ] = useState(() => {
        // in future, replace with parsed Excel schema
        return SAMPLE_SCHEMA;
    });
    const [responses, setResponses] = useState(() => {
        const phcs = JSON.parse(localStorage.getItem("kh_phcs")) || {};
        return phcs?.[phcId]?.responses || {};
    });
    const [photoPreviews, setPhotoPreviews] = useState({});

    useEffect(() => {
        // keep localStorage in sync when responses change
        const phcs = JSON.parse(localStorage.getItem("kh_phcs")) || {};
        phcs[phcId] = phcs[phcId] || { id: phcId, name: phcId, code: phcId, lastUpdated: null, responses: {} };
        const responsesToSave = { ...responses };
        for (const key in responsesToSave) {
            delete responsesToSave[key].photo;
        }
        phcs[phcId].responses = responsesToSave;
        phcs[phcId].lastUpdated = new Date().toISOString();
        localStorage.setItem("kh_phcs", JSON.stringify(phcs));
    }, [responses, phcId]);

    const scores = computeScores(schema, responses);
    const percent = scores.maxTotal ? Math.round((scores.total / scores.maxTotal) * 100) : 0;

    function setScore(cpId, val) {
        setResponses((prev) => ({ ...prev, [cpId]: { ...(prev[cpId] || {}), score: Number(val) } }));
    }

    function setRemark(cpId, text) {
        setResponses((prev) => ({ ...prev, [cpId]: { ...(prev[cpId] || {}), remark: text } }));
    }

    function handlePhoto(cpId, file) {
        const reader = new FileReader();
        reader.onload = () => {
            setPhotoPreviews((p) => ({ ...p, [cpId]: reader.result }));
            // Do not save photo to responses
        };
        reader.readAsDataURL(file);
    }

    function exportJSON() {
        const responsesToExport = { ...responses };
        for (const key in responsesToExport) {
            delete responsesToExport[key].photo;
        }
        const blob = new Blob([JSON.stringify({ phcId, schema, responses: responsesToExport, scores }, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${phcId}_kayakalp_export.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-lg font-semibold">Assessment - {phcId}</h3>
                    <div className="text-xs text-gray-500">Score: {scores.total} / {scores.maxTotal} ({percent}%)</div>
                    <div className="w-40 bg-gray-200 h-2 rounded-full mt-2">
                        <div className="h-2 rounded-full" style={{ width: `${percent}%`, background: "linear-gradient(90deg,#34d399,#60a5fa)" }} />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={exportJSON} className="bg-green-600 text-white px-3 py-2 rounded">Export JSON</button>
                    <Link to="../dashboard" className="text-sm text-gray-600">Back</Link>
                </div>
            </div>

            <div className="space-y-4">
                {schema.map((sec) => (
                    <section key={sec.id} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{sec.title}</h4>
                            <div className="text-xs text-gray-500">Max {sec.checkpoints.reduce((s, c) => s + c.maxScore, 0)} pts</div>
                        </div>

                        <div className="space-y-3">
                            {sec.checkpoints.map((cp) => (
                                <div key={cp.id} className="border p-3 rounded">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold">{cp.title}</div>
                                            <div className="text-xs text-gray-500">{cp.description}</div>
                                        </div>
                                        <div className="text-sm text-gray-600">Max {cp.maxScore}</div>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        {[...Array(cp.maxScore + 1).keys()].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setScore(cp.id, s)}
                                                className={`px-3 py-1 rounded ${responses?.[cp.id]?.score === s ? "bg-blue-600 text-white" : "bg-gray-100"}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex gap-2 items-center">
                                        <label className="text-xs">Photo:</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files && handlePhoto(cp.id, e.target.files[0])}
                                            className="text-sm"
                                        />
                                        {photoPreviews[cp.id] && <img src={photoPreviews[cp.id]} alt="preview" className="w-20 h-14 object-cover rounded ml-2" />}
                                    </div>

                                    <textarea
                                        placeholder="Remarks"
                                        value={responses?.[cp.id]?.remark || ""}
                                        onChange={(e) => setRemark(cp.id, e.target.value)}
                                        className="w-full mt-2 border rounded p-2 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

// ---------- Admin Page (list & import) ----------
function Admin() {
    const [phcs, setPhcs] = useState(() => JSON.parse(localStorage.getItem("kh_phcs")) || {});

    useEffect(() => {
        localStorage.setItem("kh_phcs", JSON.stringify(phcs));
    }, [phcs]);

    function addPHC() {
        const id = `PHC-${Math.floor(Math.random() * 900 + 100)}`;
        setPhcs((p) => ({ ...p, [id]: { id, name: `New ${id}`, code: id, lastUpdated: null, responses: {} } }));
    }

    function importExcel(ev) {
        const file = ev.target.files?.[0];
        if (!file) return;
        // NOTE: To parse Excel, integrate SheetJS (xlsx) in your app:
        // npm i xlsx
        // const data = await file.arrayBuffer();
        // const wb = XLSX.read(data);
        // const sheet = wb.Sheets[wb.SheetNames[0]];
        // const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Then map rows to schema and setSchema(jsonSchema)
        alert("Excel import is supported in production: integrate SheetJS (xlsx) and send me the file and I'll convert to schema for you.");
    }

    function exportAll() {
        const a = document.createElement("a");
        const blob = new Blob([JSON.stringify(phcs, null, 2)], { type: "application/json" });
        a.href = URL.createObjectURL(blob);
        a.download = "all_phcs_export.json";
        a.click();
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Admin - PHC Manager</h3>
                <Link to="../dashboard" className="text-sm text-gray-600">Back</Link>
            </div>

            <div className="space-y-3">
                {Object.values(phcs).map((p) => (
                    <div key={p.id} className="bg-white p-3 rounded shadow flex items-center justify-between">
                        <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.code}</div>
                        </div>
                        <div className="flex gap-2">
                            <Link to={`../assessment/${p.id}`} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Open</Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 flex gap-2">
                <button onClick={addPHC} className="bg-indigo-600 text-white px-3 py-2 rounded">Add PHC</button>
                <button onClick={exportAll} className="bg-green-600 text-white px-3 py-2 rounded">Export All</button>
                <label className="bg-gray-200 px-3 py-2 rounded cursor-pointer">
                    Import Excel
                    <input type="file" accept=".xls,.xlsx" onChange={importExcel} className="hidden" />
                </label>
            </div>

            <div className="mt-4 text-xs text-gray-500">Tip: Upload your Kayakalp Excel and I will convert it into the schema automatically (ask me to parse it).</div>
        </div>
    );
}
