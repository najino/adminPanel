import { z } from "zod";

type ValidationTranslate = (
  key:
    | "required"
    | "invalidType"
    | "invalidEmail"
    | "invalidUrl"
    | "invalidString"
    | "tooSmallString"
    | "tooBigString"
    | "tooSmallNumber"
    | "tooBigNumber"
    | "tooSmallArray"
    | "tooBigArray"
    | "invalidEnum"
    | "invalidDate"
    | "default",
  values?: Record<string, string | number | Date>,
) => string;

export function createZodErrorMap(t: ValidationTranslate): z.ZodErrorMap {
  return (issue, ctx) => {
    switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
        if (issue.received === "undefined" || issue.received === "null") {
          return { message: t("required") };
        }
        return { message: t("invalidType") };

      case z.ZodIssueCode.too_small:
        if (issue.type === "string") {
          if (issue.minimum === 1 && issue.inclusive) {
            return { message: t("required") };
          }
          return { message: t("tooSmallString", { min: Number(issue.minimum) }) };
        }
        if (issue.type === "number" || issue.type === "bigint") {
          return { message: t("tooSmallNumber", { min: Number(issue.minimum) }) };
        }
        if (issue.type === "array") {
          return { message: t("tooSmallArray", { min: Number(issue.minimum) }) };
        }
        return { message: t("default") };

      case z.ZodIssueCode.too_big:
        if (issue.type === "string") {
          return { message: t("tooBigString", { max: Number(issue.maximum) }) };
        }
        if (issue.type === "number" || issue.type === "bigint") {
          return { message: t("tooBigNumber", { max: Number(issue.maximum) }) };
        }
        if (issue.type === "array") {
          return { message: t("tooBigArray", { max: Number(issue.maximum) }) };
        }
        return { message: t("default") };

      case z.ZodIssueCode.invalid_string:
        if (issue.validation === "email") {
          return { message: t("invalidEmail") };
        }
        if (issue.validation === "url") {
          return { message: t("invalidUrl") };
        }
        if (issue.validation === "datetime" || issue.validation === "date") {
          return { message: t("invalidDate") };
        }
        return { message: t("invalidString") };

      case z.ZodIssueCode.invalid_enum_value:
        return { message: t("invalidEnum") };

      case z.ZodIssueCode.invalid_date:
        return { message: t("invalidDate") };

      default:
        return { message: ctx.defaultError === "Required" ? t("required") : t("default") };
    }
  };
}
