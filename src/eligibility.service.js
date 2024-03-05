class EligibilityService {
  greaterThan(value, condition) {
    return value > condition;
  }

  greaterOrEqual(value, condition) {
    return value >= condition;
  }

  lessThan(value, condition) {
    return value < condition;
  }

  lessOrEqual(value, condition) {
    return value <= condition;
  }

  isInclude(value, condition) {
    if (Array.isArray(condition)) {
      for (const item of condition) {
        if (value.includes(item)) {
          return true;
        }
      }
    }
    return false;
  }

  getValueFromPath(object, path) {
    const keys = path.split(".");
    let value = structuredClone(object);
    for (const key of keys) {
      if (Array.isArray(value)) {
        value = value.map((item) => item[key]);
      } else {
        value = value[key];
      }
      if (value === undefined) break;
    }
    return value;
  }

  applyCondition(value, condition) {
    if (typeof condition === "object") {
      const conditionType = Object.keys(condition)[0];

      switch (conditionType) {
        case "gt":
          return this.greaterThan(value, condition[conditionType]);
        case "lt":
          return this.lessThan(value, condition[conditionType]);
        case "gte":
          return this.greaterOrEqual(value, condition[conditionType]);
        case "lte":
          return this.lessOrEqual(value, condition[conditionType]);
        case "in":
          return this.isInclude(value, condition[conditionType]);
        case "and":
          const andSubConditions = Object.entries(condition[conditionType]);
          return andSubConditions.every((subCondition) =>
            this.applyCondition(value, { [subCondition[0]]: subCondition[1] })
          );
        case "or":
          const orSubConditions = Object.entries(condition[conditionType]);
          return orSubConditions.some((subCondition) =>
            this.applyCondition(value, { [subCondition[0]]: subCondition[1] })
          );
      }
    } else {
      if (Array.isArray(value)) {
        return value.includes(condition);
      }
      return value == condition;
    }
  }

  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    const keys = Object.keys(criteria);

    for (const key in keys) {
      const cartValue = this.getValueFromPath(cart, keys[key]);
      const conditionToApply = criteria[keys[key]];

      const test = this.applyCondition(cartValue, conditionToApply);

      console.log(`${keys[key]}: ${cartValue} ${test ? "✅" : "❌"}`);
      if (!test) {
        return false;
      }
    }

    return true;
  }
}

module.exports = {
  EligibilityService,
};
