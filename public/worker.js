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
        try {
          const result = wasm_bindgen.print_many_certificate(
            msg.texts,
            msg.certif_template,
            (val) => {
              self.postMessage({ data: val, type: 'progress' });
            }
          );

          self.postMessage({ data: result, type: 'print' });
        } catch (error) {
          self.postMessage({ type: 'error', data: error });
        }
      });
      break;
    case 'print_pdf':
      if (!instance) return;
      instance.then(() => {
        try {
          const result = wasm_bindgen.print_many_certificate_without_zip(
            msg.texts,
            msg.certif_template,
            (val) => {
              self.postMessage({ data: val, type: 'progress' });
            }
          );

          self.postMessage({ data: result, type: 'print_pdf' });
        } catch (error) {
          self.postMessage({ type: 'error', data: error });
        }
      });
      break;
    case 'archive':
      if (!instance) return;
      instance.then(() => {
        try {
          const result = wasm_bindgen.archive(msg.files, msg.file_names, msg.file_format);

          self.postMessage({ data: result, type: 'print' });
        } catch (error) {
          self.postMessage({ type: 'error', data: error });
          console.log(error);
        }
      });
      break;
    default:
      break;
  }
});
