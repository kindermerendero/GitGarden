import { PlantData } from "./plantMapper";

export function generateLore(plant: PlantData): string {
  const { sentiment, linesChanged, legendary, additions, deletions, message } = plant;
  const lower = message.toLowerCase();

  if (legendary && linesChanged > 2000) return "Una leggenda vivente. Rara come una stella cadente nel codice.";
  if (legendary) return "Una pianta millenaria. Ha visto il progetto nascere.";

  if (sentiment === "negative" && lower.includes("hotfix")) return "Germinata in fretta, in piena notte. Le radici sono ancora umide.";
  if (sentiment === "negative" && lower.includes("revert")) return "Una pianta risorta. Era morta, poi è tornata.";
  if (sentiment === "negative" && linesChanged > 500) return "Nata da una battaglia epica contro i demoni del debugging.";
  if (sentiment === "negative") return "Resiliente. Cresciuta tra le spine di un bug ostinato.";

  if (additions > deletions * 4) return "Esuberante. Ha portato più vita di quanta ne abbia tolta.";
  if (deletions > additions * 3) return "Austera. Ha potato con mano ferma, senza rimpianti.";

  if (lower.includes("init") || lower.includes("initial")) return "La prima pietra del giardino. Tutto è cominciato qui.";
  if (sentiment === "positive" && linesChanged > 400) return "Un'opera coraggiosa. Lo stelo alto racconta settimane di lavoro.";
  if (sentiment === "positive" && lower.includes("feat")) return "Una fioritura pianificata. Nata da un'idea diventata realtà.";
  if (sentiment === "positive") return "Serena e sicura. Una feature nata con cura.";

  if (linesChanged < 10) return "Minuscola ma precisa. Un chirurgo del codice è passato di qui.";
  return "Cresce silenziosa tra le sue compagne, senza fare rumore.";
}
