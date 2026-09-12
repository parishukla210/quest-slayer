import { cn } from "@/lib/utils";
import heroDefault from "@/assets/hero-default.png";
import heroWizard from "@/assets/hero-wizard.png";
import dragonPet from "@/assets/dragon-pet.png";

interface Props {
  equipped: Set<string>;
  level: number;
  size?: "sm" | "lg";
  className?: string;
}

export function HeroAvatar({ equipped, level, size = "lg", className }: Props) {
  const wizard = equipped.has("wizard_outfit");
  const pet = equipped.has("dragon_pet");
  const sword = equipped.has("golden_sword");
  const badge = equipped.has("special_badge");
  const dim = size === "lg" ? "size-36 md:size-44" : "size-14";

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-full border-2 bg-gradient-to-b from-accent/70 to-card",
          badge ? "border-gold shadow-[0_0_30px_-4px_var(--gold)]" : "border-border",
          dim,
        )}
      >
        <img
          src={wizard ? heroWizard : heroDefault}
          alt={wizard ? "Your hero in the Wizard Outfit" : "Your hero"}
          width={768}
          height={768}
          className="size-full scale-110 object-cover object-top"
        />
      </div>
      {size === "lg" && (
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-gold/60 bg-background px-3 py-0.5 font-display text-xs font-bold text-gold shadow">
          LV {level}
        </span>
      )}
      {sword && (
        <span
          title="Golden Sword equipped"
          className={cn(
            "absolute -left-1 -top-1 rounded-full border border-gold/60 bg-background shadow",
            size === "lg" ? "p-1.5 text-lg" : "p-0.5 text-[10px]",
          )}
        >
          ⚔️
        </span>
      )}
      {badge && (
        <span
          title="Special Badge equipped"
          className={cn(
            "absolute -right-1 -top-1 animate-sparkle rounded-full border border-gold/60 bg-background shadow",
            size === "lg" ? "p-1.5 text-lg" : "p-0.5 text-[10px]",
          )}
        >
          🏅
        </span>
      )}
      {pet && (
        <img
          src={dragonPet}
          alt="Dragon pet companion"
          width={640}
          height={640}
          loading="lazy"
          title="Dragon Pet"
          className={cn(
            "absolute -bottom-1 -right-3 animate-bob drop-shadow-[0_4px_10px_oklch(0.6_0.2_25/0.6)]",
            size === "lg" ? "size-16 md:size-20" : "size-7",
          )}
        />
      )}
    </div>
  );
}
