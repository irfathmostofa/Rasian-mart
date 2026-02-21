"use client";

import { useThemeData } from "@/app/store/useThemeData";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  CreditCard,
  Shield,
  Truck,
  RefreshCw,
  Heart,
  Github,
} from "lucide-react";

// ==================== Types ====================
interface FooterBox {
  id: string;
  type: "about" | "menu" | "social" | "contact" | "newsletter";
  title: string;
  title_bn?: string;
  status: boolean;
  logo?: string;
  content?: string;
  items?: Array<{
    label?: string;
    label_bn?: string;
    link?: string;
    platform?: string;
    url?: string;
    icon?: string;
    value?: string;
    image?: string;
  }>;
  show_labels?: boolean;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

interface PaymentMethod {
  name: string;
  icon: string;
  status: boolean;
  image?: string;
}

interface TrustBadge {
  name: string;
  icon: string;
  description: string;
}

interface FooterData {
  boxes: FooterBox[];
  copyright: {
    status: boolean;
    show_year: boolean;
    text: string;
    text_bn: string;
  };
  payment_methods: {
    status: boolean;
    title?: string;
    title_bn?: string;
    methods: PaymentMethod[];
  };
  trust_badges?: {
    status: boolean;
    badges: TrustBadge[];
  };
}

// ==================== Constants ====================
const SOCIAL_ICONS: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
};

interface PaymentIconConfig {
  bg: string;
  component: React.ElementType;
  label: string;
}

const PAYMENT_ICONS: Record<string, PaymentIconConfig> = {
  card: {
    bg: "from-gray-600 to-gray-700",
    component: CreditCard,
    label: "Card",
  },
  visa: {
    bg: "from-blue-600 to-blue-700",
    component: CreditCard,
    label: "Visa",
  },
  mastercard: {
    bg: "from-orange-500 to-red-500",
    component: CreditCard,
    label: "Mastercard",
  },
  amex: {
    bg: "from-blue-800 to-indigo-800",
    component: CreditCard,
    label: "Amex",
  },
  bkash: {
    bg: "from-pink-500 to-rose-500",
    component: CreditCard,
    label: "bKash",
  },
  nagad: {
    bg: "from-orange-400 to-orange-500",
    component: CreditCard,
    label: "Nagad",
  },
  rocket: {
    bg: "from-green-500 to-emerald-500",
    component: CreditCard,
    label: "Rocket",
  },
  stripe: {
    bg: "from-purple-500 to-indigo-500",
    component: CreditCard,
    label: "Stripe",
  },
  paypal: {
    bg: "from-blue-500 to-indigo-500",
    component: CreditCard,
    label: "PayPal",
  },
};

// ==================== Sub-Components ====================
const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-300"
          required
        />
        <Mail className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
      </div>

      <motion.button
        type="submit"
        disabled={status === "loading"}
        className="w-full px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Subscribing...
          </span>
        ) : status === "success" ? (
          <span className="flex items-center justify-center gap-2">
            <Heart className="w-4 h-4" />
            Subscribed!
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Subscribe
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        )}
      </motion.button>

      <p className="text-xs text-gray-400 text-center">
        Get 10% off on your first order
      </p>
    </form>
  );
};

const TrustBadges = ({ badges }: { badges: TrustBadge[] }) => {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {badges.map((badge: TrustBadge, index: number) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10 hover:border-primary/20 transition-all duration-500"
        >
          <div className="flex justify-center mb-2">
            {badge.icon === "shield" && (
              <Shield className="w-6 h-6 text-primary/80" />
            )}
            {badge.icon === "truck" && (
              <Truck className="w-6 h-6 text-primary/80" />
            )}
            {badge.icon === "refresh" && (
              <RefreshCw className="w-6 h-6 text-primary/80" />
            )}
            {badge.icon === "heart" && (
              <Heart className="w-6 h-6 text-primary/80" />
            )}
          </div>
          <h4 className="text-sm font-medium text-white/90 mb-1">
            {badge.name}
          </h4>
          <p className="text-xs text-gray-400">{badge.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

const PaymentMethods = ({
  methods,
  title,
}: {
  methods: PaymentMethod[];
  title?: string;
}) => {
  if (!methods || methods.length === 0) return null;

  return (
    <div className="w-full lg:w-auto">
      {title && (
        <h3 className="text-white font-semibold text-lg mb-4 relative inline-block">
          {title}
          <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-primary/60 rounded-full" />
        </h3>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {methods
          .filter((m) => m.status)
          .map((method: PaymentMethod, index: number) => {
            if (method.image) {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative w-12 h-8 bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300"
                >
                  <Image
                    src={method.image}
                    alt={method.name}
                    fill
                    className="object-contain p-1 opacity-80 hover:opacity-100 transition-opacity duration-300"
                  />
                </motion.div>
              );
            }

            const iconKey = method.icon?.toLowerCase() || "card";
            const iconConfig = PAYMENT_ICONS[iconKey] || PAYMENT_ICONS.card;
            const Icon = iconConfig.component;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div
                  className={`w-12 h-8 bg-gradient-to-br ${iconConfig.bg} bg-opacity-80 rounded-lg flex items-center justify-center shadow-sm hover:shadow transition-all duration-300 hover:bg-opacity-100`}
                >
                  <Icon className="w-5 h-5 text-white/90 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap backdrop-blur-sm">
                  {method.name}
                </span>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};

const SocialLinks = ({ items }: { items?: FooterBox["items"] }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items?.map((item, index) => {
        const platform = item.platform?.toLowerCase() || "";
        const Icon = SOCIAL_ICONS[platform] || Facebook;

        return (
          <motion.a
            key={index}
            href={item.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 backdrop-blur-sm p-3 rounded-xl hover:bg-white/10 transition-all duration-300 group border border-white/5"
            aria-label={platform}
          >
            <Icon className="w-5 h-5 text-gray-400 group-hover:text-primary/80 transition-colors duration-300" />
          </motion.a>
        );
      })}
    </div>
  );
};

const MenuList = ({
  items,
  show_labels,
}: {
  items?: FooterBox["items"];
  show_labels?: boolean;
}) => {
  if (!items || items.length === 0) return null;

  return (
    <ul className="space-y-2">
      {items?.map((item, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link
            href={item.link || "#"}
            className="text-sm text-gray-400 hover:text-white/90 transition-all duration-300 group flex items-center gap-2"
          >
            <ChevronRight className="w-3 h-3 text-primary/60 opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-5 group-hover:ml-0" />
            <span className="group-hover:translate-x-1 transition-transform duration-300">
              {item.label}
            </span>
            {show_labels && item.label_bn && (
              <span className="text-xs text-gray-500">({item.label_bn})</span>
            )}
          </Link>
        </motion.li>
      ))}
    </ul>
  );
};

const ContactInfo = ({
  contact_info,
}: {
  contact_info?: FooterBox["contact_info"];
}) => {
  if (!contact_info) return null;

  return (
    <div className="space-y-3">
      {contact_info?.email && (
        <a
          href={`mailto:${contact_info.email}`}
          className="flex items-center gap-3 text-sm text-gray-400 hover:text-white/90 transition-colors duration-300 group"
        >
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all duration-300">
            <Mail className="w-4 h-4 text-primary/80" />
          </div>
          <span>{contact_info.email}</span>
        </a>
      )}
      {contact_info?.phone && (
        <a
          href={`tel:${contact_info.phone}`}
          className="flex items-center gap-3 text-sm text-gray-400 hover:text-white/90 transition-colors duration-300 group"
        >
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all duration-300">
            <Phone className="w-4 h-4 text-primary/80" />
          </div>
          <span>{contact_info.phone}</span>
        </a>
      )}
      {contact_info?.address && (
        <div className="flex items-start gap-3 text-sm text-gray-400">
          <div className="p-2 bg-white/5 rounded-lg flex-shrink-0">
            <MapPin className="w-4 h-4 text-primary/80" />
          </div>
          <span>{contact_info.address}</span>
        </div>
      )}
    </div>
  );
};

// ==================== Main Component ====================
export default function Footer() {
  const footerData = (useThemeData("footer_section") || {}) as FooterData;
  const colors = (useThemeData("colors") || {}) as any;

  const activeBoxes = footerData?.boxes?.filter((box) => box.status) || [];

  const getGridCols = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    if (count >= 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 md:grid-cols-4";
  };

  const renderBox = (box: FooterBox) => {
    switch (box.type) {
      case "about":
        return (
          <div className="space-y-4">
            {box.logo && (
              <div className="relative h-12 w-32">
                <Image
                  src={box.logo}
                  alt={box.title}
                  fill
                  className="object-contain object-left opacity-90 hover:opacity-100 transition-opacity duration-300"
                  priority
                />
              </div>
            )}
            {box.content && (
              <p className="text-sm text-gray-400 leading-relaxed">
                {box.content}
              </p>
            )}
          </div>
        );

      case "menu":
        return <MenuList items={box.items} show_labels={box.show_labels} />;

      case "social":
        return <SocialLinks items={box.items} />;

      case "contact":
        return <ContactInfo contact_info={box.contact_info} />;

      case "newsletter":
        return <NewsletterForm />;

      default:
        return null;
    }
  };

  const getCopyrightText = () => {
    if (!footerData?.copyright?.status) return null;

    const year = footerData.copyright.show_year ? new Date().getFullYear() : "";
    let text = footerData.copyright.text || "";
    text = text.replace("{year}", year.toString());

    return text;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer
      className="relative bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 pt-16 pb-8 mt-auto overflow-hidden"
      style={{
        backgroundColor: colors?.footer_bg,
        color: colors?.footer_text,
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Trust Badges */}
        {footerData?.trust_badges?.status &&
          footerData.trust_badges.badges?.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="mb-12"
            >
              <TrustBadges badges={footerData.trust_badges.badges} />
            </motion.div>
          )}

        {/* Main Footer Grid */}
        {activeBoxes.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={`grid ${getGridCols(activeBoxes.length)} gap-8 lg:gap-12 mb-12`}
          >
            {activeBoxes.map((box) => (
              <motion.div
                key={box.id}
                variants={itemVariants}
                className="space-y-4"
              >
                {box.type !== "about" && (
                  <h3
                    className="text-white font-semibold text-lg mb-4 relative inline-block"
                    style={{ color: colors?.footer_text }}
                  >
                    {box.title}
                    <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-primary/60 rounded-full" />
                  </h3>
                )}
                {renderBox(box)}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom Section - Copyright on Left, Payment Methods on Right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-t border-white/10 pt-8 flex flex-col lg:flex-row items-center justify-between gap-6"
        >
          {/* Copyright - Left side */}
          <div className="text-sm text-gray-500 order-2 lg:order-1">
            {footerData?.copyright?.status && getCopyrightText() && (
              <p>{getCopyrightText()}</p>
            )}
          </div>

          {/* Payment Methods - Right side */}
          {footerData?.payment_methods?.status &&
            footerData.payment_methods.methods?.length > 0 && (
              <div className="order-1 lg:order-2">
                <PaymentMethods
                  methods={footerData.payment_methods.methods}
                  title={footerData.payment_methods.title}
                />
              </div>
            )}
        </motion.div>
      </div>

      {/* Scroll to top button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 p-3 bg-primary/90 text-white rounded-full shadow-lg hover:bg-primary transition-all duration-300 hover:scale-105 z-50 backdrop-blur-sm"
        aria-label="Scroll to top"
      >
        <ChevronRight className="w-5 h-5 rotate-[-90deg]" />
      </motion.button>
    </footer>
  );
}
