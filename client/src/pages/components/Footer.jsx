import { motion } from 'framer-motion';
import {
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaInstagram,
} from 'react-icons/fa';
import logoLight from '../../assets/logo-light.png';
import logoDark from '../../assets/logoLight.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-yellow-500 dark:bg-gray-900 text-black dark:text-white px-8 py-10">
      {/* Footer Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start space-y-8 md:space-y-0"
      >
        {/* Logo Section */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-4 items-center md:items-start"
        >
          <img
            src={logoLight}
            alt="Faith AND Fast Logo"
            className="h-20 object-contain dark:hidden"
          />
          <img
            src={logoDark}
            alt="Faith AND Fast Logo"
            className="h-20 object-contain hidden dark:block"
          />
          <p className="text-sm text-gray-800 dark:text-gray-400 max-w-xs text-center md:text-left">
            Elevate your style with **Faith AND Fast** – where **fashion meets
            confidence**.
          </p>
        </motion.div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-center md:text-left">
          {[
            {
              title: 'Shop',
              links: ['New Arrivals', 'Best Sellers', 'All Products'],
              hrefs: ['/products', '/products', '/products'],
            },
            {
              title: 'Company',
              links: ['About Us', 'Careers', 'Our Blog'],
              hrefs: ['/about', '', ''],
            },
            {
              title: 'Support',
              links: ['FAQ', 'Contact'],
              hrefs: ['/faqs', '/contactus'],
            },
            {
              title: 'Legal',
              links: ['Privacy Policy', 'Terms of Service'],
              hrefs: ['/privacy-policy', '/terms'],
            },
          ].map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="font-semibold text-lg">{section.title}</h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={section.hrefs[i]}
                      className="hover:text-red-700 dark:hover:text-red-400 transition duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="border-t border-gray-300 dark:border-gray-700 my-8"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-center md:text-left"
      >
        <p className="text-gray-800 dark:text-gray-400">
          <p>© {currentYear} Faith AND Fast. All Rights Reserved.</p>
          <span className="hidden md:inline"> • </span>
          <a
            href="/privacy-policy"
            className="hover:text-red-700 dark:hover:text-red-400 cursor-pointer"
          >
            Privacy
          </a>{' '}
          •
          <a
            href="/terms"
            className="hover:text-red-700 dark:hover:text-red-400 cursor-pointer"
          >
            Terms
          </a>{' '}
          •
          <a
            href="/sitemap"
            className="hover:text-red-700 dark:hover:text-red-400 cursor-pointer"
          >
            Sitemap
          </a>
        </p>

        <motion.div className="flex space-x-4 mt-4 md:mt-0">
          {[FaTwitter, FaFacebook, FaLinkedin, FaInstagram, FaYoutube].map(
            (Icon, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="cursor-pointer p-2 rounded-full bg-black text-yellow-500 dark:bg-white dark:text-gray-900 hover:bg-red-600 hover:text-white transition-all"
              >
                <Icon className="w-5 h-5" />
              </motion.div>
            )
          )}
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
