const preservationSteps = [
  'Trace',
  'Seal',
  'Remember',
]

export function PreservePanel() {
  return (
    <section
      id="preserve"
      className="border-y border-stone py-12 sm:grid sm:grid-cols-[0.8fr_1.2fr] sm:gap-12 sm:py-16"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-candle sm:text-sm">
          Preserve
        </p>
        <h2 className="mt-4 max-w-[20rem] text-2xl font-semibold leading-tight text-bone sm:max-w-none sm:text-3xl">
          Prepare a clean record before the trail goes cold.
        </h2>
      </div>
      <div className="mt-8 grid max-w-[20rem] gap-3 sm:mt-0 sm:max-w-none">
        {preservationSteps.map((step, index) => (
          <div
            key={step}
            className="flex min-w-0 items-center justify-between gap-4 border border-stone bg-grave/70 px-4 py-4"
          >
            <span className="text-sm text-ash">0{index + 1}</span>
            <span className="truncate text-base font-medium text-bone">
              {step}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
