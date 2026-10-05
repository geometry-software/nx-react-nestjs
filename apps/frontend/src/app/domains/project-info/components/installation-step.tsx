import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'geometry-sdk/components';

export function InstallationStep({ number, title, description, children }: { number: string; title: string; description: string; children: ReactNode }) {
  return <Card><CardHeader><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 font-semibold text-primary">{number}</span><div className="space-y-1"><CardTitle className="text-lg">{title}</CardTitle><CardDescription>{description}</CardDescription></div></div></CardHeader><CardContent>{children}</CardContent></Card>;
}

export function InstallationLink({ href }: { href: string }) {
  return <div className="rounded-xl bg-muted p-4"><a className="inline-flex items-center gap-2 font-medium text-primary underline underline-offset-4" href={href} target="_blank" rel="noreferrer">{href}</a></div>;
}

export function InstallationCommand({ children }: { children: string }) {
  return <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm leading-6"><code>{children}</code></pre>;
}
