# aconf

simple environment variable getter. with fully typed and value mapper.

## example

```ts
import { getEnv, MapFn } from "./mod.ts";

const config = getEnv({
	port: {
		default: "8080",
		mapFn: MapFn.number(),
	},
	jwt_secret: {
		// will throw if not exists
		required: true,
		mapFn: MapFn.string(),
	},
	admin: {
		mapFn: MapFn.string(),
	},
	users: {
		mapFn: MapFn.separated(","),
	},
}) satisfies { // not required, only for demonstration purpose
	port: number;
	jwt_secret: string;
	admin: string | null;
	users: string[] | null;
};
```
