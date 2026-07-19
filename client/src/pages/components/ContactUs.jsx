import { motion } from "framer-motion";
import { WhatsApp } from "@mui/icons-material";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  submitContactMessage,
  resetContactState,
} from "@/store/extra-slice/contactSlice";
import { contactConfig } from "../../config/contact";
import { validateContactForm } from "../../utils/contactValidation";
import ContactSkeleton from "./skeletons/ContactSkeleton";
import MetaData from "../extras/MetaData";

const ContactUs = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.contact);
  const [contactData] = useState(contactConfig);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const { errors: newErrors, isValid } = validateContactForm(form);
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    dispatch(submitContactMessage(form))
      .unwrap()
      .then((res) => {
        toast.success(
          res?.message || "Your message has been sent successfully!"
        );
        setForm({ name: "", email: "", phone: "", message: "" });
        setErrors({});
        dispatch(resetContactState());
      })
      .catch((err) => {
        toast.error(err || "Failed to send message. Please try again.");
      });
  };

  if (!contactData) return <ContactSkeleton />;

  return (
    <>
      <MetaData
        title={contactConfig.seo_meta.title}
        description={contactConfig.seo_meta.description}
        keywords="contact, support, faith and fast, customer service, help"
      />
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-all duration-300">
        <motion.div
          className="max-w-6xl mx-auto py-16 px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold text-center mb-4">
            Contact{" "}
            <span className="text-yellow-500 dark:text-red-500">
              Faith AND Fast
            </span>
          </h1>

          <motion.p
            className="text-lg text-center max-w-2xl mx-auto mb-10 text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Have questions or need assistance? We&apos;re here to help! Reach out
            through any of the channels below.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div
              className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Our Contact Details
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="flex items-center text-lg">
                  <Mail className="w-6 h-6 text-yellow-500 dark:text-red-500 mr-3" />
                  <span>{contactData.contact_details.email}</span>
                </p>
                <a
                  className="flex items-center text-lg hover:text-yellow-500 dark:hover:text-red-500 transition"
                  href={contactData.social_links.phone_link}
                >
                  <Phone className="w-6 h-6 text-yellow-500 dark:text-red-500 mr-3" />
                  <span>{contactData.contact_details.phone}</span>
                </a>
                <a
                  className="flex items-center text-lg hover:text-yellow-500 dark:hover:text-red-500 transition"
                  href={`https://wa.me/91${contactData.contact_details.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsApp className="w-6 h-6 text-yellow-500 dark:text-red-500 mr-3" />
                  <span>{contactData.contact_details.whatsapp}</span>
                </a>
                <p className="flex items-center text-lg">
                  <MapPin className="w-6 h-6 text-yellow-500 dark:text-red-500 mr-3" />
                  <span>{contactData.contact_details.address}</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Send Us a Message
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-red-500 transition"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-red-500 transition"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Your Phone Number (optional)"
                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-red-500 transition"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Your Message"
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-red-500 transition"
                  ></textarea>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                  )}
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-yellow-500 dark:bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: loading ? 1 : 1.05 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                >
                  {loading ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ContactUs;
