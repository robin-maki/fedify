import { createFederation, MemoryKvStore, Person } from "@fedify/fedify";
import { fedifyHook } from "@fedify/fedify/x/sveltekit";
import { sequence } from "@sveltejs/kit/hooks";

const fedi = createFederation<void>({
  kv: new MemoryKvStore(),
});

fedi.setActorDispatcher("/{identifier}", (ctx, identifier) => {
  if (identifier !== "sample") return null;
  return new Person({
    id: ctx.getActorUri(identifier),
    name: "Sample",
    preferredUsername: identifier,
  });
});

export const handle = sequence(fedifyHook(fedi, () => null));
