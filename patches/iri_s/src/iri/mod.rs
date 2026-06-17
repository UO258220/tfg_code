mod iri_or_string;
mod iris;
mod visitor;

pub use iri_or_string::Iri;
pub use iris::IriS;

#[macro_export]
macro_rules! iri {
	($lit: tt) => {
		$crate::IriS::new_unchecked($lit)
	};
}

#[macro_export]
macro_rules! iri_once {
	($name:ident, $str:expr) => {
		pub fn $name() -> &'static IriS {
			static ONCE: std::sync::OnceLock<IriS> = std::sync::OnceLock::new();
			ONCE.get_or_init(|| IriS::new_unchecked($str))
		}
	};
}
