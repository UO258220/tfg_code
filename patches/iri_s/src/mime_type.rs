pub trait MimeType {
    fn mime_type(&self) -> &'static str;
}
