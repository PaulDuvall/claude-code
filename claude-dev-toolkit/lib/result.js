/**
 * Result/Either Pattern Implementation
 * Provides functional error handling without throwing exceptions
 */

/**
 * Success result containing a value
 */
class Ok {
    constructor(value) {
        this.value = value;
        this.isOk = true;
        this.isError = false;
    }

    map(fn) {
        try {
            return new Ok(fn(this.value));
        } catch (error) {
            return new Err(error);
        }
    }

    flatMap(fn) {
        try {
            return fn(this.value);
        } catch (error) {
            return new Err(error);
        }
    }

    mapError() {
        return this;
    }

    unwrap() {
        return this.value;
    }

    unwrapOr() {
        return this.value;
    }

    match(okFn, errFn) {
        return okFn(this.value);
    }
}

/**
 * Error result containing an error
 */
class Err {
    constructor(error) {
        this.error = error;
        this.isOk = false;
        this.isError = true;
    }

    map() {
        return this;
    }

    flatMap() {
        return this;
    }

    mapError(fn) {
        try {
            return new Err(fn(this.error));
        } catch (error) {
            return new Err(error);
        }
    }

    unwrap() {
        throw new Error(`Called unwrap on an Err: ${this.error}`);
    }

    unwrapOr(defaultValue) {
        return defaultValue;
    }

    match(okFn, errFn) {
        return errFn(this.error);
    }
}

/**
 * Static factory methods for creating Results
 */
class Result {
    static ok(value) {
        return new Ok(value);
    }

    static err(error) {
        return new Err(error);
    }

    /**
     * Wraps a function that might throw in a Result
     */
    static try(fn) {
        try {
            return Result.ok(fn());
        } catch (error) {
            return Result.err(error);
        }
    }

    /**
     * Wraps an async function that might throw in a Result
     */
    static async tryAsync(fn) {
        try {
            const result = await fn();
            return Result.ok(result);
        } catch (error) {
            return Result.err(error);
        }
    }

    /**
     * Combines multiple Results - returns Ok if all are Ok, Err if any are Err
     */
    static all(results) {
        const values = [];
        for (const result of results) {
            if (result.isError) {
                return result;
            }
            values.push(result.value);
        }
        return Result.ok(values);
    }
}

module.exports = { Result, Ok, Err };