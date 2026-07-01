import type {
    FieldValueMap,
    ValueFieldType,
    ValueFieldValidationOptions,
    ValueFieldValidationResult,
    ValueFieldValidator,
} from "~/core/types";

/**
 * Default field validation: truthy value = valid, empty = "Required" (if showRequired).
 * Used when no custom validator is registered for a field.
 */
export function defaultFieldValidation<K extends ValueFieldType>(
    value: FieldValueMap[K],
    options: ValueFieldValidationOptions,
): ValueFieldValidationResult {
    return {
        valid: !!value,
        error: value ? null : options.showRequired ? "Required" : null,
    };
}

/**
 * Run validation for a field, using the registered validator or the default.
 */
export function getFieldValidation<K extends ValueFieldType>(
    type: K,
    value: FieldValueMap[K],
    options: ValueFieldValidationOptions,
    validators: Partial<{ [K in ValueFieldType]: ValueFieldValidator<K> }>,
): ValueFieldValidationResult {
    const validator = validators[type] as ValueFieldValidator<K> | undefined;
    return validator ? validator(value, options) : defaultFieldValidation(value, options);
}
