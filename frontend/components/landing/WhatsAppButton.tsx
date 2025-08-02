"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "Hi! I'm interested in SimuPOS for my business. Can you tell me more?"
    );
    const whatsappUrl = `https://wa.me/256702629361?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: 2,
        duration: 0.5,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <motion.button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className="relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 group"
        whileHover={{ scale: isMobile ? 1 : 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Chat with us on WhatsApp"
      >
        {/* Pulse animation - only show on desktop */}
        {!isMobile && (
          <motion.div
            className="absolute inset-0 bg-green-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        )}

        <MessageCircle className="h-6 w-6 relative z-10" />

        {/* Tooltip - always show on mobile, hover on desktop */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{
            opacity: isMobile ? 1 : isHovered ? 1 : 0,
            x: isMobile ? 0 : isHovered ? 0 : 10,
          }}
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap"
        >
          Chat with us on WhatsApp
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}


// "use client"

// import { MessageCircle } from "lucide-react"
// import { motion } from "framer-motion"
// import { useState } from "react"

// export function WhatsAppButton() {
//   const [isHovered, setIsHovered] = useState(false)

//   const handleWhatsAppClick = () => {
//     const message = encodeURIComponent("Hi! I'm interested in SimuPOS for my business. Can you tell me more?")
//     const whatsappUrl = `https://wa.me/256702629361?text=${message}`
//     window.open(whatsappUrl, "_blank")
//   }

//   return (
//     <motion.div
//       className="fixed bottom-6 right-6 z-50"
//       initial={{ scale: 0, opacity: 0 }}
//       animate={{ scale: 1, opacity: 1 }}
//       transition={{ delay: 2, duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
//     >
//       <motion.button
//         onClick={handleWhatsAppClick}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//         className="relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 group"
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//       >
//         {/* Pulse animation */}
//         <motion.div
//           className="absolute inset-0 bg-green-500 rounded-full"
//           animate={{
//             scale: [1, 1.2, 1],
//             opacity: [0.7, 0, 0.7],
//           }}
//           transition={{
//             duration: 2,
//             repeat: Number.POSITIVE_INFINITY,
//             ease: "easeInOut",
//           }}
//         />

//         <MessageCircle className="h-6 w-6 relative z-10" />

//         {/* Tooltip */}
//         <motion.div
//           initial={{ opacity: 0, x: 10 }}
//           animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
//           className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap"
//         >
//           Chat with us on WhatsApp
//           <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
//         </motion.div>
//       </motion.button>
//     </motion.div>
//   )
// }
