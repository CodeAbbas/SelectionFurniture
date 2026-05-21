export default function Footer() {
  return (
    <footer>
      <div className="footer-category">
        <div className="container">
          <h2 className="footer-category-title">
            Brand directory
          </h2>

          <div className="footer-category-box">
            <h3 className="category-box-title">Sofa :</h3>

            <a href="#" className="footer-category-link">
              Sofa bed
            </a>

            <a href="#" className="footer-category-link">
              Corner sofa
            </a>

            <a href="#" className="footer-category-link">
              Recliner
            </a>
          </div>

          <div className="footer-category-box">
            <h3 className="category-box-title">Beds :</h3>

            <a href="#" className="footer-category-link">
              Divan
            </a>

            <a href="#" className="footer-category-link">
              Velvet
            </a>

            <a href="#" className="footer-category-link">
              Bunk bed
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <img
            src="/assets/images/payment.png"
            alt="payment method"
            className="payment-img"
          />

          <p className="copyright">
            &copy; Selection Furniture all rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}