const words = ['Chicken.', 'Cheese.', 'Chilli.', 'Crunch.']

export function IngredientStory() {
  return (
    <section className="bg-deep-ink py-16 text-warm-canvas">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <p className="font-display flex flex-wrap gap-x-4 gap-y-2 text-4xl uppercase leading-none sm:text-6xl lg:text-7xl">
          {words.map((w, i) => (
            <span key={w} className={i === words.length - 1 ? 'text-sun-orange' : ''}>
              {w}
            </span>
          ))}
        </p>
        <p className="mt-6 max-w-md text-sm text-warm-canvas/60">
          Every dish starts with ingredients that pull their weight — nothing filler, nothing frozen-and-forgotten.
          Just heat, crunch and cheese doing exactly what they're built for.
        </p>
      </div>
    </section>
  )
}
