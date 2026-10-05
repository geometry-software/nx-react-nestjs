export function ProjectInfoHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
