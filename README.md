# Silke

Silke is a JavaScript framework built to be as minimal as possible, taking advantage of existing Web tools and technologies.

Silke is named Silke because it aims to be elegant, light, and powerful. And because silk is what webs are made of.

```tsx
import { signal } from 'silke';

function Counter() {
  const count = signal(0);
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => count(count() + 1)}>
        Increment
      </button>
    </div>
  );
}
```

View more examples in [packages/core/examples](./packages/core/examples). Run them from anywhere with `bun /path/to/index.html`, or if you don't want to use Bun then run `npx vite examples/<exampleName>/` from inside the `core` directory.

## Features

- Components, HTML templates, and reactivity (just like you would expect from any framework!)
- Granular reactivity, like Solid
- No Vite/Babel dependency. Bun users can just `bun run index.html`
- 3 built in directives:
  - `on...=` for event handlers
  - `$...=` for reactive property binding (set, not get)
  - `ref=` for anything else (run any function, element passed as argument)

## Architecture

Silke achieves this with only 100 lines of code and 1 dependency.

All of Silke's code can be found in `core`'s [jsx.ts](./packages/core/src/jsx.ts). This file is meant to be understandable even if you are not a framework developer. Part of Silke's philosophy is that you should understand the tools that you use, and Silke aims to make this easy.

Silke's only dependency is [alien-signals](https://github.com/stackblitz/alien-signals), a small library containing the fastest signals implementation out there.

Why does Silke not have its own signals implementation? Apart from the fact that alien-signals is a great library, Silke is watching the status of the [tc39 Signals proposal](https://github.com/tc39/proposal-signals). If signals are ever implemented in browsers directly, alien-signals can be replaced by just a very thin layer over this native implementation.

Also, note that Silke templates are JSX. JSX is built in to TypeScript and Bun, which is how Silke achieves templating without adding code complexity to the core and without any additional dependencies (assuming you already develop with TS and/or Bun).

Components are just functions that return a DOM Node, meaning they don't really exist as an explicit concept in Silke's core code.

## Comparison to Solid

Silke draws a lot of inspiration from Solid, such as using signals for granular reactivity, and JSX for templates. However, the underlying philosophy is a bit different. While Solid chose JSX because it's the path to optimal performance via their compiler, Silke chose JSX because it's the simplest way to parse HTML templates in TypeScript/Bun. It turns out, though, that what is simple is also often what is fast, so in practice we end up going the same way.

Of course, do also note that Solid has a much more mature ecosystem compared to Silke.

## Limitations

Silke's core is minimal, and the goal is to eventually extend Silke by adding separate, optional packages outside the core. The important and currently missing extensions are:
- A router
- A helper component for more efficient (reconciliated) list rendering
- SSR

## Open Questions

The core itself is also still young and may end up changing slightly, depending on questions such as:
- Should setting an attribute={null} remove said attribute from the object? ("boolean attributes")
- Should Silke include a two-way bind directive? (like `v-model` in Vue)
- Should the core support nested reactive objects? ("stores")

The only way to find the most elegant answer to these questions is to use Silke for more things and to develop its aforementioned extensions.
