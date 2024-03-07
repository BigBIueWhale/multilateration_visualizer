// Utility type for asserting type equivalence
export type AssertEqual<T, U> = T extends U ? (U extends T ? true : never) : never;

// Compile-time assertion function
export function assertType<T>(value: T): T {
  return value;
}
