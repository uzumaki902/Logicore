import { Button } from "@/components/ui/button";
export default function Login() {
  return (
    // Full page wrapper - fills space below layout
    <div className="flex-1 flex w-full min-h-0 bg-linear-to-r from-slate-50 to-cyan-50">
      <section className="flex flex-1 w-full items-start justify-between gap-10">
        {/* LEFT SIDE: badge + heading + feature cards */}
        <div className="max-w-2xl">
          {/* Small top badge/pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1 text-sm text-slate-600 shadow-sm">
            {/* Dot icon */}
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {/* Badge text */}
            <span>Agentic Support Desk</span>
          </div>

          {/* Main hero heading */}
          <h1 className="mb-8 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
            {/* Line 1 */}
            <span className="block">Triage tickets. Draft replies.</span>
            {/* Line 2 */}
            <span className="block">Save runs for audit and reuse</span>
          </h1>

          {/* Feature cards row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Feature card 1 */}
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold text-slate-900">
                Structured Output
              </h3>
              <p className="text-sm text-slate-500">
                Category, reply and next actions
              </p>
            </article>

            {/* Feature card 2 */}
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold text-slate-900">
                Get results as fast as possible
              </h3>
              <p className="text-sm text-slate-500">Call any model you want</p>
            </article>
          </div>
        </div>

        {/* RIGHT SIDE: login card */}
        <aside className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          {/* Card title */}
          <h2 className="mb-6 text-3xl font-semibold text-slate-900">
            Continue to Agent
          </h2>

          {/* Primary action button */}

          <Button
            data-testid="login-btn"
            className="cursor-pointer"
            variant="destructive"
          >
            Button
          </Button>
        </aside>
      </section>
    </div>
  );
}
