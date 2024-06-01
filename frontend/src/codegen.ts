import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: process.env.REACT_APP_GRAPHQL_DEVL_URL,
	overwrite: true,
	documents: "src/**/*.graphql",
	generates: {
		"src/graphql.tsx": {
			plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
			config: {
				withHooks: true,
				preResolveTypes: true,
				withHOC: false,
				withComponent: false,
				skipTypename: false,
				apolloReactCommonImportFrom: "@apollo/client",
				apolloReactHooksImportFrom: "@apollo/client",
				scalars: { Int64: "number" }
			}
		}
	}
};

export default config;
