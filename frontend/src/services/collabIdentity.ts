type TabIdentity = {
  id: string;
  name: string;
  color: string;
};

const IDENTITY_STORAGE_KEY = "todo-tab-identity";

const randomId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

const hashToHue = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash) % 360;
};

const buildIdentity = (): TabIdentity => {
  const id = randomId();
  const shortId = id.replace(/-/g, "").slice(0, 4).toUpperCase();
  const hue = hashToHue(id);

  return {
    id,
    name: `Tab ${shortId}`,
    color: `hsl(${hue} 70% 45%)`,
  };
};

export const getTabIdentity = (): TabIdentity => {
  const stored = sessionStorage.getItem(IDENTITY_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as TabIdentity;
      if (parsed.id && parsed.name && parsed.color) {
        return parsed;
      }
    } catch {
      // fall through and recreate identity
    }
  }

  const identity = buildIdentity();
  sessionStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity));
  return identity;
};
