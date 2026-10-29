
import React, { useState } from "react";

const API_URL = "https://distributed-task-queue-048i.onrender.com/api/jobs";

export default function JobForm({ onJobCreated }) {
  const [type, setType] = useState("email");
  const [payload, setPayload] = useState(
    '{\n  "to": "user@example.com",\n  "subject": "Hello"\n}'
  );
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    let parsedPayload;

    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      setMessage("Payload valid JSON format mein hona chahiye.");
      setIsError(true);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          payload:
            typeof parsedPayload === "string"
              ? parsedPayload
              : JSON.stringify(parsedPayload),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Job create nahi hui.");
      }

      const job = await response.json();

      setMessage(`Job successfully created! ID: ${job.id}`);
      setIsError(false);

      if (onJobCreated) {
        await onJobCreated();
      }
    } catch (error) {
      setMessage(
        error.message || "Backend se connect nahi ho pa raha."
      );
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-rose-900/40 bg-[#10131c] p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Create a Job</h2>
        <p className="mt-1 text-sm text-slate-400">
          Add a new background task to your queue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="job-type"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Job Type
          </label>

          <select
            id="job-type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-[#0b0e16] px-4 py-3 text-slate-100 outline-none focus:border-rose-500"
          >
            <option value="email">Email</option>
            <option value="data-process">Data Processing</option>
            <option value="image-process">Image Processing</option>
            <option value="report-generate">Report Generation</option>
            <option value="cleanup">Cleanup</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="job-payload"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Payload (JSON)
          </label>

          <textarea
            id="job-payload"
            rows={5}
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            placeholder='{"message": "Hello World"}'
            className="w-full resize-y rounded-xl border border-slate-700 bg-[#0b0e16] px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-rose-500"
            required
          />
          <p className="mt-2 text-xs text-slate-500">
            Enter a valid JSON object or value for your job payload.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className={`break-words rounded-lg border p-3 text-sm ${
              isError
                ? "border-red-900 bg-red-950/40 text-red-300"
                : "border-emerald-900 bg-emerald-950/40 text-emerald-300"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl border border-rose-500 bg-rose-700 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating Job..." : "+ Create Job"}
        </button>
      </form>
    </section>
  );
}
