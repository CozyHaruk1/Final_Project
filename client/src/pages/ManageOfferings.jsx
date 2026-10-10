import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiRequest, { getCurrentUser } from "../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import AdvisorSidebar from "../components/advisor/AdvisorSidebar";
import OfferingTable from "../components/advisor/OfferingTable";

const CURRENT_TERM = "2026-1";

const emptyOffering = {
  courseId: "",
  term: CURRENT_TERM,
  section: "",
  instructor: "",
  day: "",
  startTime: "",
  endTime: "",
  room: "",
  seats: "",
  addDropOpen: false,
  addDropCloseDate: "",
};

function ManageOfferings() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [offerings, setOfferings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyOffering);

  const loadData = async () => {
    try {
      const [offeringData, courseData] = await Promise.all([
        apiRequest(`/offerings?term=${CURRENT_TERM}`),
        apiRequest("/courses"),
      ]);
      setOfferings(offeringData);
      setCourses(courseData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const text = search.trim().toLowerCase();

  const shownOfferings = offerings.filter((offering) => {
    const code = offering.courseId?.code?.toLowerCase() || "";
    const title = offering.courseId?.title?.toLowerCase() || "";

    return (
      code.includes(text) ||
      title.includes(text) ||
      offering.section.toLowerCase().includes(text) ||
      offering.instructor.toLowerCase().includes(text)
    );
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyOffering);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (offering) => {
    setEditingId(offering._id);
    setForm({
      courseId: offering.courseId?._id || "",
      term: offering.term,
      section: offering.section,
      instructor: offering.instructor,
      day: offering.day,
      startTime: offering.startTime,
      endTime: offering.endTime,
      room: offering.room,
      seats: offering.seats,
      addDropOpen: offering.addDropOpen,
      addDropCloseDate: offering.addDropCloseDate
        ? offering.addDropCloseDate.slice(0, 10)
        : "",
    });
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyOffering);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (Number(form.seats) < 1) {
      setError("Seats must be at least 1.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("End time must be later than start time.");
      return;
    }

    if (form.addDropOpen && !form.addDropCloseDate) {
      setError("Add/drop closing date is required when add/drop is open.");
      return;
    }

    try {
      if (editingId) {
        await apiRequest(`/offerings/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setMessage("Offering updated successfully.");
      } else {
        await apiRequest("/offerings", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setMessage("Offering created successfully.");
      }

      closeForm();
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (offering) => {
    setError("");
    setMessage("");

    const sure = window.confirm(
      `Remove ${offering.courseId?.code} section ${offering.section}?`
    );

    if (!sure) {
      return;
    }

    try {
      await apiRequest(`/offerings/${offering._id}`, { method: "DELETE" });
      setMessage("Offering removed successfully.");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleAddDrop = async (offering) => {
    setError("");
    setMessage("");

    const nextOpen = !offering.addDropOpen;

    if (nextOpen && !offering.addDropCloseDate) {
      const closeDate = window.prompt(
        "Enter the add/drop closing date (YYYY-MM-DD):"
      );

      if (!closeDate) {
        return;
      }

      try {
        await apiRequest(`/offerings/${offering._id}`, {
          method: "PATCH",
          body: JSON.stringify({
            addDropOpen: true,
            addDropCloseDate: closeDate,
          }),
        });
        setMessage("Add/drop window opened.");
        loadData();
      } catch (err) {
        setError(err.message);
      }

      return;
    }

    try {
      await apiRequest(`/offerings/${offering._id}`, {
        method: "PATCH",
        body: JSON.stringify({ addDropOpen: nextOpen }),
      });
      setMessage(nextOpen ? "Add/drop window opened." : "Add/drop window closed.");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="student-layout">
      <AdvisorSidebar />

      <main className="main">
        <Header
          title="Manage Offerings"
          name={currentUser ? currentUser.name : "Advisor"}
          role="Advisor"
        />

        <div className="admin-content">

          <button onClick={openCreateForm}>Create offering</button>

          <p>
            <input
              type="text"
              placeholder="Search by course, section or instructor"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </p>

          {message && <p>{message}</p>}
          {error && <ErrorMessage message={error} />}

          {loading ? (
            <Loading message="Loading offerings..." />
          ) : (
            <OfferingTable
              offerings={shownOfferings}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onToggleAddDrop={handleToggleAddDrop}
            />
          )}

          {showForm && (
            <div className="modal-overlay">
              <form className="modal-box" onSubmit={handleSubmit}>

                <h2>{editingId ? "Edit Offering" : "Create Offering"}</h2>

                <div className="form-group">
                  <label>Course</label>
                  <select
                    name="courseId"
                    value={form.courseId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Term</label>
                  <input name="term" value={form.term} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Section</label>
                  <input name="section" value={form.section} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Instructor</label>
                  <input name="instructor" value={form.instructor} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Day</label>
                  <input name="day" value={form.day} onChange={handleChange} required placeholder="e.g. Mon/Wed" />
                </div>

                <div className="form-group">
                  <label>Start time</label>
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>End time</label>
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Room</label>
                  <input name="room" value={form.room} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Seats (capacity)</label>
                  <input type="number" min="1" name="seats" value={form.seats} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="addDropOpen"
                      checked={form.addDropOpen}
                      onChange={handleChange}
                    />{" "}
                    Add/Drop window open
                  </label>
                </div>

                {form.addDropOpen && (
                  <div className="form-group">
                    <label>Add/Drop closing date</label>
                    <input
                      type="date"
                      name="addDropCloseDate"
                      value={form.addDropCloseDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <button type="submit">Save</button>
                <button type="button" onClick={closeForm}>Cancel</button>

              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default ManageOfferings;