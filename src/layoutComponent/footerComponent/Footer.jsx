

function Footer() {
      
    return (
        <footer className="bg-gray-800 text-gray-400 py-4 px-6 flex items-center justify-between">
            <p>© {new Date().getFullYear()} AWDAW Games. Todos los derechos reservados.</p>
            <div className="flex space-x-4">
                <a href="/terms" className="hover:text-gray-300">Terminos del servicio</a>
                <a href="/privacy" className="hover:text-gray-300">Politica de privacidad</a>
            </div>
        </footer>
    );
}
export default Footer;