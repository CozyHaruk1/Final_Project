import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiRequest, { getCurrentUser } from "../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import AdvisorSidebar from "../components/advisor/AdvisorSidebar";

const CURRENT_TERM = "2026-1";

function AdvisorDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest(`/offerings?term=${CURRENT_TERM}`)
      .then((data) => setOfferings(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalOfferings = offerings.length;
  const openAddDrop = offerings.filter((o) => o.addDropOpen).length;

  return (
    <div className="student-layout">
      <AdvisorSidebar />

      <main className="main">
        <Header
          title="Advisor Dashboard"
          name={currentUser ? currentUser.name : "Advisor"}
          role="Advisor"
        />

        <div className="admin-content">

          {error && <ErrorMessage message={error} />}

          {loading ? (
            <Loading message="Loading dashboard..." />
          ) : (
            <>
              <div className="cards">

                <div className="card">
                  <div className="card-icon blue">🎓</div>
                  <div>
                    <p>Current Term</p>
                    <h2>{CURRENT_TERM}</h2>
                  </div>
                </div>

                <div className="card">
                  <div className="card-icon green">📚</div>
                  <div>
                    <p>Current Offerings</p>
                    <h2>{totalOfferings}</h2>
                  </div>
                </div>

                <div className="card">
                  <div className="card-icon orange">📝</div>
                  <div>
                    <p>Add/Drop Open</p>
                    <h2>{openAddDrop}</h2>
                    <span>of {totalOfferings} offerings</span>
                  </div>
                </div>

              </div>

              <div className="admin-quick-actions">
                <button onClick={() => navigate("/advisor/offerings")}>
                  Manage Offerings
                </button>

                <button onClick={() => navigate("/advisor/registration")}>
                  Student Registration
                </button>

                <button onClick={() => navigate("/advisor/add-drop")}>
                  Add/Drop Management
                </button>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default AdvisorDashboard;