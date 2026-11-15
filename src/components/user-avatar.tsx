import { cn } from "@/lib/utils";

/** Initials avatar, or the OAuth profile image when there is one. */
export function UserAvatar({
  name,
  email,
  image,
  className,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  className?: string;
}) {
  const label = name || email || "?";
  const initials = label
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  return (
    <span
      title={label}
      className={cn(
        "bg-accent text-accent-foreground inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold",
        className,
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote avatar hosts vary per provider
        <img src={image} alt="" className="size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
