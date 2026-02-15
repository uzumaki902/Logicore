import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <main className="min-h-screen bg-linear-to-r from-slate-50 to-cyan-50">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14 md:flex-row md:items-start md:justify-between md:gap-12 md:px-10 md:py-20">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1 text-sm text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Agentic Support Desk</span>
          </div>

          <h1 className="mb-8 text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-5xl">
            <span className="block">Triage tickets. Draft replies.</span>
            <span className="block">Save runs for audit and reuse</span>
          </h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold text-slate-900">
                Structured Output
              </h3>
              <p className="text-sm text-slate-500">
                Category, reply and next actions
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold text-slate-900">
                Get results as fast as possible
              </h3>
              <p className="text-sm text-slate-500">Call any model you want</p>
            </article>
          </div>
        </div>

        <aside className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:mt-2">
          <h2 className="mb-6 text-3xl font-semibold text-slate-900">
            Continue to Agent
          </h2>
          <Button className="w-full" size="lg">
            Login
          </Button>
        </aside>
      </section>
    </main>
  );
}
