const RULE_SET_VERSION = "Legal Metrology Packaged Commodities Rules, 2011 + applicable amendments";

function hasValue(value) {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim().length > 0
  );
}

function checkField(label, value, rule, required = true) {
  if (!required) {
    return {
      field: label,
      value: value || null,
      status: "NOT_APPLICABLE",
      rule,
    };
  }

  if (hasValue(value)) {
    return {
      field: label,
      value: value,
      status: "DETECTED",
      rule,
    };
  }

  return {
    field: label,
    value: null,
    status: "MISSING",
    rule,
  };
}

function runRuleEngine(declarations = {}) {
  const checks = [];

  /*
   * Core packaged-commodity declaration checks.
   *
   * IMPORTANT:
   * DETECTED means OCR found something relevant.
   * It does NOT mean the declaration is legally valid.
   */

  checks.push(
    checkField(
      "Manufacturer / Packer / Importer",
      declarations.manufacturer ||
        declarations.packer ||
        declarations.importer,
      "Applicable package identity declaration should be present."
    )
  );

  checks.push(
    checkField(
      "Product / Generic Name",
      declarations.productName,
      "Common or generic name of the commodity should be declared."
    )
  );

  checks.push(
    checkField(
      "Net Quantity",
      declarations.netQuantity,
      "Net quantity should be declared in the applicable standard unit."
    )
  );

  checks.push(
    checkField(
      "Manufacturing Date",
      declarations.manufacturingDate,
      "Applicable month/year of manufacture or packing should be declared."
    )
  );

  checks.push(
    checkField(
      "Best Before / Use By",
      declarations.bestBefore,
      "Best-before/use-by declaration is checked where applicable."
    )
  );

  checks.push(
    checkField(
      "MRP",
      declarations.mrp,
      "Maximum Retail Price inclusive of applicable taxes should be declared."
    )
  );

  checks.push(
    checkField(
      "Consumer Care",
      declarations.consumerCare,
      "Consumer-care/contact details should be declared."
    )
  );

  /*
   * Country of origin is applicability-dependent.
   * We do not mark absence as a violation automatically.
   */
  if (hasValue(declarations.countryOfOrigin)) {
    checks.push({
      field: "Country of Origin",
      value: declarations.countryOfOrigin,
      status: "DETECTED",
      rule: "Country of origin is checked where applicable, particularly for imported products.",
    });
  } else {
    checks.push({
      field: "Country of Origin",
      value: null,
      status: "VERIFY",
      rule: "Officer must determine whether country-of-origin declaration is applicable.",
    });
  }

  /*
   * Unit sale price has applicability conditions.
   * Therefore absence alone is not treated as a violation.
   */
  if (hasValue(declarations.unitSalePrice)) {
    checks.push({
      field: "Unit Sale Price",
      value: declarations.unitSalePrice,
      status: "DETECTED",
      rule: "Unit sale price is checked where applicable.",
    });
  } else {
    checks.push({
      field: "Unit Sale Price",
      value: null,
      status: "VERIFY",
      rule: "Officer must determine whether unit sale price is applicable to this package.",
    });
  }

  /*
   * Batch number is useful for inspection but its applicability
   * depends on the commodity/category.
   */
  if (hasValue(declarations.batchNumber)) {
    checks.push({
      field: "Batch / Lot Number",
      value: declarations.batchNumber,
      status: "DETECTED",
      rule: "Batch/lot identification is checked where applicable.",
    });
  } else {
    checks.push({
      field: "Batch / Lot Number",
      value: null,
      status: "VERIFY",
      rule: "Officer should verify applicability for the commodity.",
    });
  }

  const missingCount = checks.filter(
    (item) => item.status === "MISSING"
  ).length;

  const verifyCount = checks.filter(
    (item) => item.status === "VERIFY"
  ).length;

  let status = "REVIEW_REQUIRED";

  if (missingCount > 0) {
    status = "POTENTIAL_NON_COMPLIANCE";
  } else if (verifyCount > 0) {
    status = "REVIEW_REQUIRED";
  } else {
    status = "READY_FOR_OFFICER_VERIFICATION";
  }

  return {
    ruleSet: RULE_SET_VERSION,
    status,
    summary: {
      totalChecks: checks.length,
      detected: checks.filter(
        (item) => item.status === "DETECTED"
      ).length,
      missing: missingCount,
      verify: verifyCount,
    },
    checks,
    disclaimer:
      "This automated result is an inspection aid. OCR detection does not establish legal compliance. Final determination requires officer verification and applicable commodity-specific rules.",
  };
}

module.exports = {
  runRuleEngine,
};