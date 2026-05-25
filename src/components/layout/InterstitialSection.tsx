"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Photo } from "@/types";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  photo: Photo;
}

export function InterstitialSection({ photo }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const photoY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  useEffect(() => {
    if (!sectionRef.current || !quoteRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=80%",
        pin: quoteRef.current,
        pinSpacing: false,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        height: "120vh",
        overflow: "hidden",
        marginBottom: 120,
      }}
    >
      {/* Full-bleed photo — scrolls at 0.8x */}
      <motion.div
        style={{
          position: "absolute",
          inset: "-15% 0",
          y: photoY,
          zIndex: 0,
        }}
      >
        <Image
          src={photo.src}
          alt="Urmila"
          fill
          loading="lazy"
          sizes="100vw"
          draggable={false}
          placeholder={photo.blurDataURL ? "blur" : "empty"}
          blurDataURL={photo.blurDataURL}
          style={{ objectFit: "cover", opacity: 0.45, pointerEvents: "none", userSelect: "none" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(18,16,14,0.6) 0%, rgba(18,16,14,0.2) 40%, rgba(18,16,14,0.6) 100%)",
          }}
        />
      </motion.div>

      {/* Pull quote — pinned, scrolls at 1.0x */}
      <div
        ref={quoteRef}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: "0 48px",
        }}
      >
        <motion.div
          style={{ maxWidth: 720, textAlign: "center", y: textY }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            style={{
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: "clamp(28px, 4vw, 52px)",
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1.35,
              color: "var(--fg)",
              marginBottom: 40,
            }}
          >
            &ldquo;She was the steadiest thing we knew.&rdquo;
          </p>
          <span
            style={{
              fontFamily: "Inter Tight, sans-serif",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
            }}
          >
            Urmila · 1980 – 2018
          </span>
        </motion.div>
      </div>
    </section>
  );
}
