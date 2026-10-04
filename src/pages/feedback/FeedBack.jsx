import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";
import { useAuth } from "../../context/AuthContext";

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return; // Don't fetch if not logged in
    apiService.getFeedbackList()
      .then(setFeedbackList)
      .catch(() => setFeedbackList([]));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!rating) return setError("Please select a rating before submitting");
    if (!user) return setError("You must be logged in to submit feedback");
    try {
      await apiService.submitFeedback({ rating, comments });
      const updated = await apiService.getFeedbackList();
      setFeedbackList(updated);
      setRating(0);
      setComments("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to submit feedback");
    }
  };

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 3xl:px-16">
      <h1 className="font-display text-h1 font-800 text-ink">Feedback & complaints</h1>
      <p className="mt-2 max-w-xl text-body text-slate">
        Tell us how your ride went — this helps us fix issues faster.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-sm border border-ink/10 bg-white p-6"
        >
          <div>
            <label className="block text-small font-medium text-ink">Rating</label>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  className={`h-10 w-10 rounded-sm border text-body font-700 transition-colors ${
                    rating >= n
                      ? "border-amber bg-amber text-ink"
                      : "border-ink/15 text-slate"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-small font-medium text-ink">Comments</label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What happened?"
              className="mt-1 w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body outline-none focus:border-route focus:ring-2 focus:ring-route/20"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-sm bg-ink py-3 font-semibold text-platform hover:bg-ink-soft"
          >
            Submit feedback
          </button>

          {error && (
            <p className="rounded-sm bg-red-50 px-4 py-2.5 text-small text-red-600">{error}</p>
          )}

          {submitted && (
            <p className="rounded-sm bg-route-soft px-4 py-2.5 text-small text-route">
              Thanks — your feedback has been recorded.
            </p>
          )}
        </form>

        <div>
          <h2 className="font-display text-h3 font-700 text-ink">Recent feedback</h2>
          {feedbackList.length === 0 ? (
            <p className="mt-3 text-body text-slate">No feedback submitted yet.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {feedbackList.map((f) => (
                <div key={f.id} className="rounded-sm border border-ink/10 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-h3 font-700 text-amber-dark">
                      {"★".repeat(f.rating)}
                      <span className="text-ink/15">{"★".repeat(5 - f.rating)}</span>
                    </span>
                    <span className="text-small text-slate">{f.createdDate}</span>
                  </div>
                  {f.comments && <p className="mt-2 text-body text-ink">{f.comments}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}