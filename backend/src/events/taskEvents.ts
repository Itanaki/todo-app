type Listener = (data: unknown) => void;

const listenersByOwner = new Map<string, Set<Listener>>();

export const subscribe = (ownerId: string, listener: Listener) => {
  const listeners = listenersByOwner.get(ownerId) ?? new Set<Listener>();
  listeners.add(listener);
  listenersByOwner.set(ownerId, listeners);
};

export const unsubscribe = (ownerId: string, listener: Listener) => {
  const listeners = listenersByOwner.get(ownerId);
  if (!listeners) {
    return;
  }

  listeners.delete(listener);

  if (listeners.size === 0) {
    listenersByOwner.delete(ownerId);
  }
};

export const publish = (ownerId: string, event: unknown) => {
  const listeners = listenersByOwner.get(ownerId);

  if (!listeners) {
    return;
  }

  listeners.forEach((listener) => listener(event));
};
