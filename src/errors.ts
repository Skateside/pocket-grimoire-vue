// Base for all Pocket Grimoire errors - allows them to be easily identified.
export class PocketGrimoireError extends Error {
    readonly pg!: true;
    constructor(message?: string) {
        super(message);
        this.name = "PocketGrimoireError";
        Object.defineProperty(this, "pg", {
            value: true,
            writable: false,
        });
    }
}

/**
 * Info Token Store
 */

// Trying to change an official info token.
export class CannotChangeOfficialIntoTokenError extends PocketGrimoireError {
    constructor(message: string) {
        super(message);
        this.name = "CannotChangeOfficialIntoTokenError";
    }
}

// Unable to find a matching info token.
export class UnrecognisedInfoTokenError extends PocketGrimoireError {
    constructor(message: string) {
        super(message);
        this.name = "UnrecognisedInfoTokenError";
    }
}