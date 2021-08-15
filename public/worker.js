self.importScripts('/abi/core_certifast.js');

let instance;
self.addEventListener('message', (e) => {
  const msg = e.data;

  switch (msg.type) {
    case 'init':
      instance = wasm_bindgen(msg.wasm_uri);
      break;
    case 'print':
      if (!instance) return;
      instance.then(() => {
        const result = wasm_bindgen.print_many_certificate(
          msg.texts,
          msg.certif_template,
          (val) => {
            self.postMessage({ data: val, type: 'progress' });
          }
        );

        self.postMessage({ data: result, type: 'print' });
      });
      break;

    default:
      break;
  }
});
