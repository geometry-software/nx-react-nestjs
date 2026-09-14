import { Languages } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
export type Language = 'en' | 'es' | 'pt';
const languages: Array<{ value: Language; code: string; label: string }> = [
  { value: 'en', code: 'EN', label: 'English' },
  { value: 'es', code: 'ES', label: 'Español' },
  { value: 'pt', code: 'PT', label: 'Português' },
];

export function LanguageSwitcher({
  language,
  setLanguage,
  label,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  label: string;
}) {
  const selected =
    languages.find((item) => item.value === language) ?? languages[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={label} variant="outline">
          <Languages /> {selected.code}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(value) => setLanguage(value as Language)}
        >
          {languages.map((item) => (
            <DropdownMenuRadioItem key={item.value} value={item.value}>
              <span className="w-7 font-mono text-xs text-muted-foreground">
                {item.code}
              </span>
              {item.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
