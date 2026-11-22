interface ImportMetaEnv {
	readonly PUBLIC_GH_OWNER?: string;
	readonly PUBLIC_GH_REPO?: string;
	readonly PUBLIC_GH_BRANCH?: string;
	/** Solo para pruebas: otra URL para la API de GitHub. */
	readonly PUBLIC_GH_API?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
