import { useState } from "react";
import data from "./phc_data.json";
import "./PHCData.css";

export default function PHCData() {
  const [search, setSearch] = useState("");

  // ✅ Filter data
  const filtered = data.filter(
    (item) =>
      item.subCentre.toLowerCase().includes(search.toLowerCase()) ||
      item.gramPanchayat.toLowerCase().includes(search.toLowerCase()) ||
      item.village.toLowerCase().includes(search.toLowerCase()) ||
      item.anm.toLowerCase().includes(search.toLowerCase()) ||
      item.asha.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Group by subCentre → gramPanchayat
  const grouped = {};
  filtered.forEach((item) => {
    if (!grouped[item.subCentre]) grouped[item.subCentre] = {};
    if (!grouped[item.subCentre][item.gramPanchayat])
      grouped[item.subCentre][item.gramPanchayat] = [];
    grouped[item.subCentre][item.gramPanchayat].push(item);
  });

  return (
    <div className="phc-wrapper">
      <h1>📋 SUB CENTRE, GP & HAMLET WISE POPULATION – PHC MALKAPUR</h1>
      <h3>Jangaon District</h3>

      <input
        className="phc-search"
        placeholder="🔍 Search village, ANM, ASHA, etc..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="phc-table-wrapper">
        <table className="phc-table">
          <thead>
            <tr>
              <th>Sl.No</th>
              <th>Name of the Sub Centre</th>
              <th>Name of the Gram Panchayat</th>
              <th>Name of the Village / Hamlet</th>
              <th>Population</th>
              <th>Name of the MPHA (F) / 2nd ANM</th>
              <th>Mobile Number</th>
              <th>Name of the ASHA</th>
              <th>Contact Number</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(grouped).map((subCentre, subIndex) => {
              const gps = grouped[subCentre];
              const subCentreRowSpan = Object.values(gps).reduce(
                (sum, villages) => sum + villages.length,
                0
              );
              let subCentreRendered = false;

              return Object.keys(gps).map((gp) => {
                const villages = gps[gp];
                const gpRowSpan = villages.length;
                let gpRendered = false;

                return villages.map((village, vIndex) => (
                  <tr key={`${subCentre}-${gp}-${village.village}`}>
                    {!subCentreRendered && (
                      <>
                        <td rowSpan={subCentreRowSpan}>{subIndex + 1}</td>
                        <td rowSpan={subCentreRowSpan}>
                          <b>{subCentre}</b>
                        </td>
                      </>
                    )}
                    {!gpRendered && <td rowSpan={gpRowSpan}>{gp}</td>}

                    <td>{village.village}</td>
                    <td className="num">{village.population}</td>
                    <td>{village.anm}</td>
                    <td>
                      {village.anmMobile && (
                        <a href={`tel:${village.anmMobile}`} className="phone">
                          {village.anmMobile}
                        </a>
                      )}
                    </td>
                    <td>{village.asha}</td>
                    <td>
                      {village.ashaMobile && (
                        <a href={`tel:${village.ashaMobile}`} className="phone">
                          {village.ashaMobile}
                        </a>
                      )}
                    </td>

                    {(subCentreRendered = true)}
                    {(gpRendered = true)}
                  </tr>
                ));
              });
            })}
          </tbody>
        </table>
      </div>
      <p className="footer-note">Total Villages: {filtered.length}</p>
    </div>
  );
}
