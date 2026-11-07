export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="app-footer" role="contentinfo">
      <div>
        © {year} <strong>DBMS SuperAdmin</strong>. All rights reserved.
      </div>
      <div className="app-footer-links">
        <span>v1.0.0</span>
        <span>•</span>
        <a href="#privacy" className="app-footer-link" onClick={(e) => e.preventDefault()}>
          Privacy Policy
        </a>
        <span>•</span>
        <a href="#terms" className="app-footer-link" onClick={(e) => e.preventDefault()}>
          Terms of Service
        </a>
        <span>•</span>
        <a href="#support" className="app-footer-link" onClick={(e) => e.preventDefault()}>
          Support
        </a>
      </div>
    </footer>
  )
}

export default Footer

