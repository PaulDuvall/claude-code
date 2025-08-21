/**
 * TypeScript Type Definitions for Subagents Module
 */

// Result Pattern Types
export interface ResultOk<T> {
    readonly value: T;
    readonly isOk: true;
    readonly isError: false;
    map<U>(fn: (value: T) => U): Result<U>;
    flatMap<U>(fn: (value: T) => Result<U>): Result<U>;
    mapError(fn: (error: any) => any): Result<T>;
    unwrap(): T;
    unwrapOr(defaultValue: T): T;
    match<U>(okFn: (value: T) => U, errFn: (error: any) => U): U;
}

export interface ResultErr<E = Error> {
    readonly error: E;
    readonly isOk: false;
    readonly isError: true;
    map<U>(fn: (value: any) => U): Result<U>;
    flatMap<U>(fn: (value: any) => Result<U>): Result<U>;
    mapError(fn: (error: E) => any): Result<any>;
    unwrap(): never;
    unwrapOr<T>(defaultValue: T): T;
    match<U>(okFn: (value: any) => U, errFn: (error: E) => U): U;
}

export type Result<T, E = Error> = ResultOk<T> | ResultErr<E>;

// Core Business Logic Types
export interface SubagentFile {
    filename: string;
    name: string;
    path: string;
}

export interface DirectoryStatus {
    claudeDir: boolean;
    subagentsDir: boolean;
}

export interface DirectoryCreationResult {
    created: boolean;
    path: string;
}

export interface InstallationResult {
    filename: string;
    installed: boolean;
}

export interface InstallationFailure {
    filename: string;
    error: string;
}

export interface InstallationSummary {
    installed: number;
    failed: number;
    path: string;
    directoryCreated: boolean;
}

export interface InstallationData {
    installed: string[];
    failed: InstallationFailure[];
    summary: InstallationSummary;
}

export interface ValidationResult {
    valid: boolean;
    installedCount: number;
    issues: string[];
}

export interface InstallationStatus {
    available: number;
    installed: number;
    directories: DirectoryStatus;
    paths: {
        packageSubagents: string;
        claudeSubagents: string;
    };
}

// Command Options Types
export interface SubagentCommandOptions {
    help?: boolean;
    list?: boolean;
    install?: boolean;
}

// Formatter Types
export interface FormatterCallbacks {
    onProgress?: (callback: (filename: string, success: boolean, error: string | null) => void) => void;
    onDirectoryCreated?: (callback: (path: string) => void) => void;
}

export interface DisplayInstallationParams extends FormatterCallbacks {
    subagents: string[];
    summary?: InstallationSummary;
}

// Core Service Interface
export interface ISubagentsCoreService {
    getAvailableSubagents(): Result<string[]>;
    getSubagentNames(): Result<string[]>;
    checkDirectoryStructure(): Result<DirectoryStatus>;
    ensureClaudeDirectory(): Result<DirectoryCreationResult>;
    installSingleSubagent(filename: string): Result<InstallationResult>;
    installAllSubagents(): Result<InstallationData>;
    validateInstallation(): Result<ValidationResult>;
    getInstallationStatus(): Result<InstallationStatus>;
}

// Manager Interface
export interface ISubagentsManager {
    listAvailableSubagents(): boolean;
    installSubagents(): boolean;
    showHelp(): boolean;
    handleCommand(options: SubagentCommandOptions): boolean;
    getStatus(): Result<InstallationStatus>;
    validateInstallation(): Result<ValidationResult>;
    getAvailableSubagents(): Result<string[]>;
}

// Formatter Interface
export interface ISubagentFormatter {
    displayList(subagents: string[]): void;
    displayInstallation(params: DisplayInstallationParams): void;
    displayHelp(subagentCount: number): void;
    displayError(error: string): void;
    displayDirectoryError(error: string): void;
}

// Constants
export interface DisplayConstants {
    EMOJIS: {
        ROBOT: string;
        SUCCESS: string;
        ERROR: string;
        FOLDER: string;
        ROCKET: string;
        PARTY: string;
        CHART: string;
    };
    MESSAGES: {
        NO_SUBAGENTS: string;
        NO_SUBAGENTS_INSTALL: string;
        INSTALL_FAILED: string;
        INSTALL_SUCCESS: string;
        CREATE_DIR_FAILED: string;
    };
}

export interface CoreConstants {
    FILE_EXTENSION: string;
    CLAUDE_DIR: string;
    SUBAGENTS_DIR: string;
}

// Module Exports
export interface SubagentsModule {
    handleCommand: (options: SubagentCommandOptions) => boolean;
    listAvailableSubagents: () => boolean;
    installSubagents: () => boolean;
    showHelp: () => boolean;
    getStatus: () => Result<InstallationStatus>;
    validateInstallation: () => Result<ValidationResult>;
    getAvailableSubagents: () => Result<string[]>;
    SubagentsManager: new () => ISubagentsManager;
    SubagentsCoreService: new () => ISubagentsCoreService;
    SubagentFormatter: ISubagentFormatter;
    Result: {
        ok<T>(value: T): ResultOk<T>;
        err<E>(error: E): ResultErr<E>;
        try<T>(fn: () => T): Result<T>;
        tryAsync<T>(fn: () => Promise<T>): Promise<Result<T>>;
        all<T>(results: Result<T>[]): Result<T[]>;
    };
}