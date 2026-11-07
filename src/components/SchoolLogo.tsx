import logo from "../assets/al-bassam-schools.png?inline";
import { cn } from "../utils/cn";

export function SchoolLogo({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Al-Bassam Schools logo"
      width={768}
      height={256}
      className={cn("block h-auto max-w-full object-contain", className)}
      draggable={false}
    />
  );
}