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

export type LanguageOption = {
  value: string;
  code: string;
  label: string;
};

export function LanguageSwitcher({
  language,
  languages,
  setLanguage,
  label,
}: {
  language: string;
  languages: readonly LanguageOption[];
  setLanguage: (language: string) => void;
  label: string;
}) {
  const selected =
    languages.find((item) => item.value === language) ?? languages[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={label} variant="outline">
          <Languages /> {selected?.code ?? language.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={setLanguage}
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
