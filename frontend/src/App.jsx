
import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard, Mail, Send, Clock3, AlertCircle,
  Plus, RefreshCw, Search, CalendarDays, CheckCircle2,
  XCircle, ExternalLink, Inbox, LoaderCircle
} from "lucide-react";

import { getEmails, scheduleEmail } from "./services/api";
import "./App.css";

const initialForm = {
  recipient: "",
  subject: "",
  body: "",
  scheduledAt: "",
};

function App() {
  const [emails, setEmails] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getEmails();
      setEmails(result.data || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load emails. Check your backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();

    const interval = setInterval(fetchEmails, 15000);

    return () => clearInterval(interval);
  }, [fetchEmails]);

  const stats = {
    total: emails.length,
    scheduled: emails.filter((e) => e.status === "scheduled").length,
    sent: emails.filter((e) => e.status === "sent").length,
    failed: emails.filter((e) => e.status === "failed").length,
  };

  const filteredEmails = emails.filter((email) => {
    const matchesFilter =
      activeFilter === "all" || email.status === activeFilter;

    const query = search.toLowerCase();

    const matchesSearch =
      email.recipient?.toLowerCase().includes(query) ||
      email.subject?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (new Date(form.scheduledAt).getTime() <= Date.now()) {
      setError("Please select a future date and time.");
      return;
    }

    try {
      setSubmitting(true);

      await scheduleEmail({
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      });

      setSuccess("Email scheduled successfully!");
      setForm(initialForm);

      await fetchEmails();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to schedule email."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="app-shell">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Mail size={22} />
          </div>

          <div>
            <h2>ReachInbox</h2>
            <span>EMAIL SCHEDULER</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <button
          className="nav-item active"
          onClick={() => setActiveFilter("all")}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button
          className="nav-item"
          onClick={() => setActiveFilter("scheduled")}
        >
          <Clock3 size={18} />
          Scheduled
        </button>

        <button
          className="nav-item"
          onClick={() => setActiveFilter("sent")}
        >
          <Send size={18} />
          Sent Emails
        </button>

        <button
          className="nav-item"
          onClick={() => setActiveFilter("failed")}
        >
          <AlertCircle size={18} />
          Failed Emails
        </button>

        <div className="sidebar-bottom">
          <div className="connection-dot" />
          Backend connected
          <small>API · localhost:5000</small>
        </div>
      </aside>

      {/* Main dashboard */}
      <main className="main-content">

        <header className="topbar">
          <div>
            <p className="eyebrow">WORKSPACE / OVERVIEW</p>
            <h1>Email Dashboard</h1>
            <p className="subtitle">
              Manage and monitor your scheduled emails.
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={fetchEmails}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="alert error-alert">{error}</div>
        )}

        {success && (
          <div className="alert success-alert">{success}</div>
        )}

        {/* Statistics */}
        <section className="stats-grid">
          <StatCard
            title="Total Emails"
            value={stats.total}
            icon={<Mail />}
            color="purple"
          />

          <StatCard
            title="Scheduled"
            value={stats.scheduled}
            icon={<Clock3 />}
            color="blue"
          />

          <StatCard
            title="Successfully Sent"
            value={stats.sent}
            icon={<CheckCircle2 />}
            color="green"
          />

          <StatCard
            title="Failed"
            value={stats.failed}
            icon={<XCircle />}
            color="red"
          />
        </section>

        <section className="content-grid">

          {/* Schedule email form */}
          <div className="panel schedule-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  <Plus size={19} />
                  Schedule an Email
                </h2>

                <p>
                  Compose an email and choose when it should be sent.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="schedule-form"
            >
              <label>Recipient Email</label>

              <input
                type="email"
                name="recipient"
                placeholder="recipient@example.com"
                value={form.recipient}
                onChange={handleChange}
                required
              />

              <label>Subject</label>

              <input
                type="text"
                name="subject"
                placeholder="Enter email subject"
                value={form.subject}
                onChange={handleChange}
                required
              />

              <label>Email Message</label>

              <textarea
                name="body"
                placeholder="Write your email message..."
                value={form.body}
                onChange={handleChange}
                rows="5"
                required
              />

              <label>
                <CalendarDays size={15} />
                Schedule Date & Time
              </label>

              <input
                type="datetime-local"
                name="scheduledAt"
                value={form.scheduledAt}
                onChange={handleChange}
                min={new Date(Date.now() + 60000)
                  .toISOString()
                  .slice(0, 16)}
                required
              />

              <button
                className="submit-btn"
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={17} />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Clock3 size={17} />
                    Schedule Email
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Email activity */}
          <div className="panel activity-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  <Inbox size={19} />
                  Email Activity
                </h2>

                <p>
                  Track your email delivery status.
                </p>
              </div>
            </div>

            <div className="filter-row">
              {["all", "scheduled", "sent", "failed"].map(
                (filter) => (
                  <button
                    key={filter}
                    className={`filter-btn ${
                      activeFilter === filter ? "selected" : ""
                    }`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() +
                      filter.slice(1)}
                  </button>
                )
              )}
            </div>

            <div className="search-box">
              <Search size={17} />

              <input
                placeholder="Search recipient or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="email-list">
              {loading ? (
                <div className="empty-state">
                  <LoaderCircle />
                  Loading emails...
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="empty-state">
                  <Inbox size={30} />
                  <p>No emails found</p>
                </div>
              ) : (
                filteredEmails.map((email) => (
                  <div className="email-row" key={email._id}>
                    <div className="email-avatar">
                      {(email.recipient || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="email-details">
                      <strong>{email.subject}</strong>
                      <span>{email.recipient}</span>

                      <small>
                        {email.status === "sent"
                          ? `Sent ${formatDate(email.sentAt)}`
                          : `Scheduled ${formatDate(email.scheduledAt)}`}
                      </small>
                    </div>

                    <div className="email-actions">
                      <span
                        className={`status-badge ${email.status}`}
                      >
                        {email.status}
                      </span>

                      {email.etherealPreviewUrl && (
                        <a
                          href={email.etherealPreviewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="preview-link"
                          title="Open Ethereal preview"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="list-footer">
              Showing {filteredEmails.length} of {emails.length} emails
            </div>
          </div>
        </section>

        <footer className="footer">
          ReachInbox Scheduler
          <span>•</span>
          Powered by BullMQ, Redis & MongoDB
        </footer>

      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card">
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>

      <div className={`stat-icon ${color}`}>
        {icon}
      </div>
    </div>
  );
}

export default App;
