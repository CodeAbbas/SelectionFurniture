import Link from 'next/link';

export default function Header() {
  return (
    <header>
      {/* HEADER TOP */}
      <div className="header-top">
        <div className="container">
          <ul className="header-social-container">
            <li>
              <a href="#" className="social-link">
                <ion-icon name="logo-facebook"></ion-icon>
              </a>
            </li>

            <li>
              <a href="#" className="social-link">
                <ion-icon name="logo-twitter"></ion-icon>
              </a>
            </li>

            <li>
              <a href="#" className="social-link">
                <ion-icon name="logo-instagram"></ion-icon>
              </a>
            </li>

            <li>
              <a href="#" className="social-link">
                <ion-icon name="logo-linkedin"></ion-icon>
              </a>
            </li>
          </ul>

          <div className="header-alert-news">
            <p>
              <b>Free Shipping</b>
              This Week Order Over - £55
            </p>
          </div>

          <div className="header-top-actions">
            <select name="currency">
              <option value="gbp">GBP £</option>
              <option value="usd">USD $</option>
              <option value="eur">EUR €</option>
            </select>

            <select name="account">
              <option value="">Account</option>
              <option value="sign-in">Sign In</option>
              <option value="sign-up">Sign Up</option>
            </select>
          </div>
        </div>
      </div>

      {/* HEADER MAIN */}
      <div className="header-main">
        <div className="container">
          <div className="header-flex-wrapper">
            <Link href="/" className="header-logo">
              <img
                src="/assets/images/logo/selectionfurniture.png"
                alt="Selection Furniture"
                width="180"
              />
            </Link>

            <div className="header-contact-dropdowns">
              <div className="contact-item">
                <a
                  href="tel:+447838040902"
                  className="contact-link"
                >
                  <ion-icon name="call-outline"></ion-icon>
                  <span>07434080902</span>
                </a>
              </div>

              <div
                className="contact-item dropdown"
                tabIndex={0}
              >
                <div className="contact-link">
                  <ion-icon name="location-outline"></ion-icon>

                  <span>72 Queens Market</span>

                  <ion-icon
                    name="chevron-down-outline"
                    className="chevron"
                  ></ion-icon>
                </div>

                <div className="dropdown-content">
                  <div className="map-card">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.434778116982!2d0.031098877142460613!3d51.53423630883391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a70032ae6603%3A0x2becf3ac962bf021!2sSelection%20Furniture!5e0!3m2!1sen!2suk!4v1734796020000!5m2!1sen!2suk"
                      width="100%"
                      height="150"
                      style={{ border: 0 }}
                      loading="lazy"
                    />

                    <div className="map-details">
                      <strong>Selection Furniture</strong>

                      <p>
                        72 Queen&apos;s Market, Upton Park,
                        <br />
                        E13 9BA, London
                      </p>

                      <a
                        href="https://maps.app.goo.gl/rJ68gaG9eTfXDYdSA"
                        target="_blank"
                        className="view-contact-btn"
                      >
                        Get direction
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div className="header-search-container">
            <input
              type="search"
              name="search"
              className="search-field"
              placeholder="Enter your product name..."
            />

            <button className="search-btn">
              <ion-icon name="search-outline"></ion-icon>
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP MENU */}
      <nav className="desktop-navigation-menu">
        <div className="container">
          <ul className="desktop-menu-category-list">
            <li className="menu-category">
              <Link href="/" className="menu-title">
                Home
              </Link>
            </li>

            <li className="menu-category">
              <Link
                href="/category/Sofa"
                className="menu-title"
              >
                Sofa
              </Link>
            </li>

            <li className="menu-category">
              <Link
                href="/category/Beds"
                className="menu-title"
              >
                Beds
              </Link>
            </li>

            <li className="menu-category">
              <Link
                href="/category/Wardrobes"
                className="menu-title"
              >
                Wardrobes
              </Link>
            </li>

            <li className="menu-category">
              <Link
                href="/category/Dining"
                className="menu-title"
              >
                Dining
              </Link>
            </li>

            <li className="menu-category">
              <Link
                href="/category/Bedroom Sets"
                className="menu-title"
              >
                Bedroom Sets
              </Link>
            </li>

            <li className="menu-category">
              <Link
                href="/category/Mattress"
                className="menu-title"
              >
                Mattress
              </Link>
            </li>

            <li className="menu-category">
              <a href="#" className="menu-title">
                Hot Offers
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* MOBILE NAVIGATION */}
      <div className="mobile-bottom-navigation">
        <button className="action-btn">
          <ion-icon name="menu-outline"></ion-icon>
        </button>

        <button className="action-btn">
          <ion-icon name="bag-handle-outline"></ion-icon>
          <span className="count">0</span>
        </button>

        <Link href="/" className="action-btn">
          <ion-icon name="home-outline"></ion-icon>
        </Link>

        <button className="action-btn">
          <ion-icon name="heart-outline"></ion-icon>
          <span className="count">0</span>
        </button>

        <button className="action-btn">
          <ion-icon name="grid-outline"></ion-icon>
        </button>
      </div>
    </header>
  );
}