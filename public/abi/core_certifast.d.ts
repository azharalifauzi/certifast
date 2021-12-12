declare namespace wasm_bindgen {
	/* tslint:disable */
	/* eslint-disable */
	/**
	* @param {string} str
	*/
	export function hello(str: string): void;
	/**
	* @param {any} texts
	* @param {Uint8Array} certif_template
	* @param {Function} callback
	* @returns {Uint8Array}
	*/
	export function print_many_certificate(texts: any, certif_template: Uint8Array, callback: Function): Uint8Array;
	/**
	* @param {string} text
	* @param {Uint8Array} certif_template
	* @param {string} font_fam
	* @param {number} x
	* @param {number} y
	* @param {number} font_size
	* @param {Uint8Array} color
	* @returns {Uint8Array}
	*/
	export function print_certificate(text: string, certif_template: Uint8Array, font_fam: string, x: number, y: number, font_size: number, color: Uint8Array): Uint8Array;
	/**
	* @param {any} texts
	* @param {Uint8Array} certif_template
	* @param {Function} callback
	* @returns {(Uint8Array)[]}
	*/
	export function print_many_certificate_without_zip(texts: any, certif_template: Uint8Array, callback: Function): (Uint8Array)[];
	/**
	* @param {(Uint8Array)[]} files
	* @param {any} file_names
	* @param {string} file_format
	* @returns {Uint8Array}
	*/
	export function archive(files: (Uint8Array)[], file_names: any, file_format: string): Uint8Array;
	
}

declare type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

declare interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly hello: (a: number, b: number) => void;
  readonly print_many_certificate: (a: number, b: number, c: number, d: number) => void;
  readonly print_certificate: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => void;
  readonly print_many_certificate_without_zip: (a: number, b: number, c: number, d: number) => void;
  readonly archive: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
declare function wasm_bindgen (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
