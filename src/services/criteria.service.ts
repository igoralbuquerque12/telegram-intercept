import { MatchResult } from "../entities/criteria.entity";
import { IncomingMessageDTO } from "../entities/message.entity";

export class CriteriaService {
  /**
   * Criteria: PlayStation
   * 1º: Contain "playstation" or "ps5"
   * 2º: Should contain at least one of: "console", "slim", "825", "825gb"
   */
  public matchPlaystation(messageText: string): boolean {
    if (!messageText) return false;

    const hasPlaystationOrPs5 = /\b(playstation|ps5)\b/i.test(messageText);
    if (!hasPlaystationOrPs5) return false;

    const hasComplementaryKeyword = /\b(console|slim|825(\s?gb)?)\b/i.test(messageText);

    return hasComplementaryKeyword;
  }

  /**
   * Criteria: UltraGear 27
   * 1º: Contain "ultragear" (case-insensitive, substring match allowed)
   * 2º: Contain "27" (substring match allowed, e.g. "27GS60F", "AA27AA", "27\"")
   */
  public matchUltragear27(messageText: string): boolean {
    if (!messageText) return false;

    const hasUltragear = /ultragear/i.test(messageText);
    if (!hasUltragear) return false;

    const has27 = /27/.test(messageText);

    return has27;
  }

  /**
   * Avaliate the incoming message against defined criteria and return the match result.
   */
  public evaluate(payload: IncomingMessageDTO): MatchResult {
    const matchedCriteria: string[] = [];

    if (this.matchUltragear27(payload.text)) {
      matchedCriteria.push("ULTRAGEAR_27");
    }

    return {
      matches: matchedCriteria.length > 0,
      matchedCriteria,
    };
  }
}
