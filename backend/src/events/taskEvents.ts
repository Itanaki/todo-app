type Listener = (data: unknown) => void;

const listeners = new Set<Listener>();

export const subscribe = (listener: Listener) => {
  listeners.add(listener);
};

export const unsubscribe = (listener: Listener) => {
  listeners.delete(listener);
};

export const publish = (event: unknown) => {
  listeners.forEach((listener) => listener(event));
};
