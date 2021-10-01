extern crate js_sys;
extern crate serde;
extern crate serde_json;
extern crate zip;

use base64::decode;
use image::{codecs::jpeg, DynamicImage, GenericImageView, ImageFormat, Rgba};
use imageproc::drawing::draw_text_mut;
use js_sys::{Function, Uint8Array};
use rusttype::{Font, Scale};
use std::io::Write;
use std::io::{Cursor, Read, Seek, SeekFrom};
use std::panic;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use web_sys::console;
use zip::{write, CompressionMethod, ZipWriter};

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[macro_use]
extern crate serde_derive;

#[derive(Serialize, Deserialize, Debug)]
pub struct CanvasDynamicText {
    text: String,
    x: f32,
    y: f32,
    font_fam: String,
    font_size: f32,
    color: Vec<u8>,
}

#[wasm_bindgen]
pub fn hello(str: &str) {
    console::log_1(&JsValue::from_str(str));
}

#[wasm_bindgen]
pub fn print_many_certificate(
    texts: &JsValue,
    certif_template: &Uint8Array,
    callback: Function,
) -> Vec<u8> {
    let _ = callback.call1(&JsValue::null(), &JsValue::from_str("load image"));
    let img = load_image_from_array(&certif_template.to_vec());

    console_error_panic_hook::set_once();
    let dynamic_texts: Vec<Vec<CanvasDynamicText>> = texts.into_serde().unwrap();

    let mut array_of_images: Vec<Vec<u8>> = Vec::new();

    for (index, elem) in dynamic_texts.iter().enumerate() {
        let mut the_img = img.clone();

        let _ = callback.call1(&JsValue::null(), &JsValue::from_f64(index as f64));

        for text in elem {
            let CanvasDynamicText {
                text,
                x,
                y,
                font_fam,
                font_size,
                color,
            } = text;

            let decoded_font_fam = decode(&font_fam).unwrap();
            let text_color = Rgba([color[0], color[1], color[2], color[3]]);
            let scale = Scale::uniform(*font_size);
            let font = Vec::from(decoded_font_fam);
            let text_font = Font::try_from_vec(font).unwrap();

            draw_text_mut(
                &mut the_img,
                text_color,
                *x as u32,
                *y as u32,
                scale,
                &text_font,
                &text,
            );
        }
        let image_array = get_image_as_array(the_img);
        array_of_images.push(image_array);
    }

    let _ = callback.call1(&JsValue::null(), &JsValue::from_str("archive"));

    let mut archive = Cursor::new(Vec::new());
    let mut zip = ZipWriter::new(&mut archive);
    let options = write::FileOptions::default().compression_method(CompressionMethod::Stored);
    for (index, the_img) in array_of_images.iter().enumerate() {
        let data = &dynamic_texts[index][0];

        zip.start_file(&format!("{}.jpeg", data.text), options)
            .unwrap();
        let img = &the_img[..];
        zip.write(img).unwrap();
    }
    let the_zip = zip.finish().unwrap();
    the_zip.seek(SeekFrom::Start(0)).unwrap();
    let mut out = Vec::new();
    the_zip.read_to_end(&mut out).unwrap();

    return out;
}

#[wasm_bindgen]
pub fn print_certificate(
    text: &str,
    certif_template: &Uint8Array,
    font_fam: &str,
    x: u32,
    y: u32,
    font_size: f32,
    color: Vec<u8>,
) -> Vec<u8> {
    console::log_1(&JsValue::from_str("Load Image"));

    let mut img = load_image_from_array(&certif_template.to_vec());
    let b = decode(&font_fam).unwrap();
    let (w, h) = img.dimensions();

    console::log_2(&JsValue::from_f64(w as f64), &JsValue::from_f64(h as f64));

    let text_color = Rgba([color[0], color[1], color[2], color[3]]);
    let scale = Scale::uniform(font_size);
    let font = Vec::from(b);
    console::log_1(&JsValue::from_str("Load Font"));
    let text_font = Font::try_from_vec(font).unwrap();

    draw_text_mut(&mut img, text_color, x, y, scale, &text_font, text);

    get_image_as_array(img)
}

fn load_image_from_array(_array: &[u8]) -> DynamicImage {
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let img = match image::load_from_memory(_array) {
        Ok(img) => img,
        Err(error) => {
            console::log_1(&JsValue::from_str(&error.to_string()));
            panic!("There was a problem opening the file: {:?}", error)
        }
    };

    return img;
}

fn get_image_as_array(_img: DynamicImage) -> Vec<u8> {
    // Create fake "file"
    let mut c = Cursor::new(Vec::new());

    let mut img_with_quality = jpeg::JpegEncoder::new_with_quality(&mut c, 100);
    img_with_quality.set_pixel_density(jpeg::PixelDensity::dpi(300));

    match img_with_quality.encode_image(&_img) {
        Ok(c) => c,
        Err(error) => {
            console::log_1(&JsValue::from_str(&error.to_string()));
            panic!(
                "There was a problem writing the resulting buffer: {:?}",
                error
            )
        }
    };
    c.seek(SeekFrom::Start(0)).unwrap();

    // Read the "file's" contents into a vector
    let mut out = Vec::new();
    c.read_to_end(&mut out).unwrap();

    return out;
}
