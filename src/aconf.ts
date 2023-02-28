export interface AconfMapFn<T = unknown> {
	(value: string): T;
}

export type AconfDeffinition = Record<string, {
	mapFn: AconfMapFn;
	name?: string;
	default?: string;
	required?: boolean;
}>;

export type AconfResult<T extends AconfDeffinition> = {
	[key in keyof T]: ReturnType<T[key]["mapFn"]> | AconfNull<T[key]>;
};

export type AconfNull<T extends AconfDeffinition[string]> =
	T["required"] extends true ? never
		: T["default"] extends string ? never
		: null;

export class AconfError extends Error {}

export function getEnv<T extends AconfDeffinition>(def: T): AconfResult<T> {
	const result: Record<string, unknown> = {};

	for (const [key, v] of Object.entries(def)) {
		const name = v.name || key;
		const value = Deno.env.get(name) ||
			v.default ||
			null;

		if (!value) {
			if (!v.required) {
				result[key] = null;
				continue;
			}
			throw new AconfError(`can not find ${name} environment variable`);
		}

		result[key] = v.mapFn?.(value) || value;
	}

	return result as AconfResult<T>;
}

export class MapFn {
	static string(): AconfMapFn<string> {
		return (v: string) => v;
	}

	static number(): AconfMapFn<number> {
		return (v: string) => parseInt(v);
	}

	static boolean(): AconfMapFn<boolean> {
		const falseStr = [
			"0",
			"false",
			"f",
		];
		return (value: string) => !falseStr.includes(value);
	}

	static separated<
		T extends AconfMapFn,
		U = T extends AconfMapFn<infer R> ? R extends unknown ? string
			: R
			: never,
	>(sep: string, mapFn?: T): AconfMapFn<U[]> {
		return (value: string) => {
			return value
				.split(sep)
				.map(mapFn || MapFn.string()) as U[];
		};
	}
}

