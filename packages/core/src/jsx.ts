import { effect, effectScope, startBatch, endBatch } from 'alien-signals';

// A Node, a primitive type, or a function returning one of those (any for brevity)
type Child = Node | string | number | boolean | null | undefined | (() => any);

// Receives both attrs and children from JSX parser
type Props = Record<string, any>;

// Standardized JSX type information automatically used by TypeScript for JSX typechecking
export declare namespace JSX {
  type Element = Node;

  interface IntrinsicElements {
    [elemName: string]: {
      children?: Child | Child[];
      [key: string]: any;
    };
  }

  interface ElementChildrenAttribute {
    children: {};
  }
}

// Used for inserting children
// The hard part is handling signals holding children
// Then we need to keep track of which children to replace when the signal changes
// Currently we just purge all children every signal update (dumb approach)
function insert(parent: Node, child: Child | Child[], marker?: Node | null) {
  if (child == null || typeof child === 'boolean') return;

  if (Array.isArray(child)) {
    for (let i = 0; i < child.length; i++) {
      insert(parent, child[i], marker);
    }
  } else if (typeof child === 'function') {
    const startMarker = document.createTextNode('');
    const endMarker = document.createTextNode('');
    parent.insertBefore(endMarker, marker ?? null);
    parent.insertBefore(startMarker, endMarker);

    // Use this to track and clean up (recursive) child effects
    let stopScope: (() => void) | undefined;

    effect(() => {
      stopScope?.();
      while (startMarker.nextSibling && startMarker.nextSibling !== endMarker) {
        parent.removeChild(startMarker.nextSibling);
      }
        
      stopScope = effectScope(() => insert(parent, child(), endMarker));
    });
  } else if (child instanceof Node) {
    parent.insertBefore(child, marker ?? null);
  } else {
    parent.insertBefore(document.createTextNode(String(child)), marker ?? null);
  }
}

// The main function for what it's all about
// We currently have only three special "directives"
// "on...=" is for setting an event handler function
// "$...=" is for setting the value of a property
// "ref=" is for calling a function on the newly created element
// Signals will cause attributes to be updated automatically
// We can add more directives, or let users add custom ones, in a future version
export function jsx(
  type: keyof HTMLElementTagNameMap | Function,
  props: Props | null
): Node {
  if (typeof type === 'function') {
    return type(props || {});
  }

  const { children, ...attrs } = props || {};
  const el = document.createElement(type);

  for (const [key, value] of Object.entries(attrs)) {
    // 1. Batched event handler directive
    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      const batchedHandler = (event: Event) => {
        startBatch();
        try {
          value(event);
        } finally {
          endBatch();
        }
      };
      el.addEventListener(eventName, batchedHandler);
      // 2. Prop binding directive (one way)
    } else if (key.startsWith('$')) {
      const propName = key.slice(1);
      if (typeof value === 'function') {
        effect(() => ((el as any)[propName] = value()));
      } else {
        (el as any)[propName] = value;
      }
      // 3. ref directive
    } else if (key === 'ref') {
      if (typeof value === 'function') value(el);
      // (4a) Reactive attributes
    } else if (typeof value === 'function') {
      effect(() => el.setAttribute(key, value()));
      // (4b) static attributes
    } else {
      el.setAttribute(key, value);
    }
  }

  insert(el, children);

  return el;
}

// jsxs is used when children are comptime known
export const jsxs = jsx;
// Can add special devtime ergonomics to this function
export const jsxDEV = jsx;

// Obligatory first party 'Fragment' component
export function Fragment(props: { children?: any }): DocumentFragment {
  const fragment = document.createDocumentFragment();
  insert(fragment, props.children);
  return fragment;
}
