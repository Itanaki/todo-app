type TabIdentity = {
  id: string;
  name: string;
  color: string;
};

let cachedIdentity: TabIdentity | null = null;

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
  if (cachedIdentity) {
    return cachedIdentity;
  }

  cachedIdentity = buildIdentity();
  return cachedIdentity;
};
