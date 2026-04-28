import React from "react";
import { ShoppingCart, MessageSquare, Phone, Zap } from "lucide-react";

interface WhatsAppConfig {
  button_color: string;
  button_text: string;
}

interface Config {
  show_inquiry: boolean;
  inquiry_text: string;
  show_contact_whatsapp: boolean;
  whatsapp: WhatsAppConfig;
  show_buy_now: boolean;
  buy_now_text: string;
}

interface ProductActionsProps {
  cfg: Config;
  variantStock: number;
  cartLoading: boolean;
  handleAddToCart: () => void;
  handleBuyNow: () => void;
  handleWhatsAppClick: () => void;
  setShowInquiryModal: (show: boolean) => void;
}

const ProductActions: React.FC<ProductActionsProps> = ({
  cfg,
  variantStock,
  cartLoading,
  handleAddToCart,
  handleBuyNow,
  handleWhatsAppClick,
  setShowInquiryModal,
}) => {
  const btnBase =
    "flex items-center max-w-full justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="space-y-4 mt-8">
      {/* --- Desktop Layout (Stays the same) --- */}
      <div className="hidden md:flex flex-col gap-3">
        <div className="flex gap-3">
          {variantStock > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className={`${btnBase} py-3.5 px-6 flex-[2] bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{cartLoading ? "Adding..." : "Add to Cart"}</span>
            </button>
          )}

          <div className="flex flex-1 gap-3">
            {cfg.show_inquiry && (
              <button
                onClick={() => setShowInquiryModal(true)}
                className={`${btnBase} py-3.5 px-6 flex-1 border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden lg:inline">{cfg.inquiry_text}</span>
              </button>
            )}
            {cfg.show_contact_whatsapp && (
              <button
                onClick={handleWhatsAppClick}
                className={`${btnBase} py-3.5 px-6 flex-1 text-white shadow-md`}
                style={{ backgroundColor: cfg.whatsapp.button_color }}
              >
                <Phone className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {cfg.show_buy_now && variantStock > 0 && (
          <button
            onClick={handleBuyNow}
            className={`${btnBase} py-3.5 w-full border-2 border-primary text-primary hover:bg-primary hover:text-white`}
          >
            {cfg.buy_now_text}
          </button>
        )}
      </div>
      {/* --- Enhanced Mobile Sticky Bottom Bar --- */}
      <div className="fixed bottom-0 m-0 left-0 right-0 z-500 p-3 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] md:hidden">
        <div className="flex flex-row gap-2 max-w-lg mx-auto">
          {/* Row 1: Quick Actions (WhatsApp & Inquiry) */}

          {variantStock > 0 ? (
            <>
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className={`${btnBase} flex-1 py-4 bg-gray-900 text-white shadow-sm`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm">Add to Cart</span>
              </button>

              {cfg.show_buy_now && (
                <button
                  onClick={handleBuyNow}
                  className={`${btnBase} flex-1 py-4 bg-primary text-white shadow-lg shadow-primary/25`}
                >
                  <Zap className="w-5 h-5 fill-current" />
                  <span className="text-sm">{cfg.buy_now_text}</span>
                </button>
              )}
            </>
          ) : (
            <div className="w-full text-center py-4 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100">
              Out of Stock
            </div>
          )}
          {/* {cfg.show_inquiry && (
            <button
              onClick={() => setShowInquiryModal(true)}
              className={`${btnBase} flex-1 py-2.5 border border-gray-200 text-gray-600 bg-gray-50`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">Inquiry</span>
            </button>
          )} */}
          {cfg.show_contact_whatsapp && (
            <button
              onClick={handleWhatsAppClick}
              className={`${btnBase} flex-1 py-2.5 text-white`}
              style={{ backgroundColor: cfg.whatsapp.button_color }}
            >
              <Phone className="w-5 h-5" />
              <span className="text-xs">WhatsApp</span>
            </button>
          )}
        </div>
      </div>
      <div className="h-32 md:hidden" />{" "}
      {/* Increased spacer for the taller mobile bar */}
    </div>
  );
};

export default ProductActions;
