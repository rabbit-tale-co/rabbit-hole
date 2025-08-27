export const revalidate = 0;

import UsersGrid from "@/components/users/Grid";

export default function ExplorePage() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Explore creators</h1>
      <p className="text-sm text-muted-foreground">Discover people to follow.</p>
      <UsersGrid />
    </section>
  );
}
