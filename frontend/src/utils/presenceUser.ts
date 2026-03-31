export type PresenceUser = {
  id: string;
  name: string;
  color: string;
};

const randomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 55%)`;

export const presenceUser: PresenceUser = (() => {
  const existing = sessionStorage.getItem("presenceUser");
  if (existing) return JSON.parse(existing);

  const user = {
    id: crypto.randomUUID(),
    name: `User-${Math.floor(Math.random() * 1000)}`,
    color: randomColor(),
  };

  sessionStorage.setItem("presenceUser", JSON.stringify(user));
  return user;
})();
