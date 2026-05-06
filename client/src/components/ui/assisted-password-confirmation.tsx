import * as React from "react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export interface PasswordConfirmInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  passwordToMatch: string;
  value: string;
  onChange: (value: string) => void;
  inputPlaceholder?: string;
}

const PasswordConfirmInput = React.forwardRef<
  HTMLDivElement,
  PasswordConfirmInputProps
>(
  (
    {
      passwordToMatch,
      value,
      onChange,
      inputPlaceholder = "Confirm Password",
      className,
      ...props
    },
    ref
  ) => {
    const [shake, setShake] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (
        value.length >= passwordToMatch.length &&
        e.target.value.length > value.length
      ) {
        setShake(true);
      } else {
        onChange(e.target.value);
      }
    };

    useEffect(() => {
      if (shake) {
        const timer = setTimeout(() => setShake(false), 500);
        return () => clearTimeout(timer);
      }
    }, [shake]);

    const getLetterStatus = (letter: string, index: number) => {
      if (!value[index]) return "transparent";
      return value[index] === letter
        ? "rgba(16, 185, 129, 0.55)"
        : "rgba(239, 68, 68, 0.55)";
    };

    const passwordsMatch = passwordToMatch === value && value.length > 0;

    const bounceAnimation = {
      x: shake ? [-10, 10, -10, 10, 0] : 0,
      transition: { duration: 0.5 },
    };

    const matchAnimation = {
      scale: passwordsMatch ? [1, 1.03, 1] : 1,
      transition: { duration: 0.3 },
    };

    const borderColor = passwordsMatch
      ? "var(--gc-status-active)"
      : "var(--gc-border)";

    return (
      <div ref={ref} className={className} style={{ width: "100%" }} {...props}>
        <motion.div
          style={{ position: "relative", height: 44, width: "100%", borderRadius: "var(--gc-radius-sm)", overflow: "hidden" }}
          animate={{ ...bounceAnimation, ...matchAnimation }}
        >
          {/* Actual input (bottom layer) */}
          <motion.input
            style={{
              position: "relative", zIndex: 1,
              height: "100%", width: "100%",
              backgroundColor: "var(--gc-surface-2)",
              border: `1px solid ${borderColor}`,
              borderRadius: "var(--gc-radius-sm)",
              padding: "0 12px",
              letterSpacing: "0.3em",
              color: "var(--gc-text-primary)",
              outline: "none",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-md)",
              transition: "border-color 0.3s ease",
            }}
            type="password"
            placeholder={inputPlaceholder}
            value={value}
            onChange={handleInputChange}
          />

          {/* Character-by-character color overlay (on top, clicks pass through) */}
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, display: "flex", alignItems: "stretch", pointerEvents: "none", zIndex: 2, paddingLeft: 12, borderRadius: "var(--gc-radius-sm)", overflow: "hidden" }}>
            {passwordToMatch.split("").map((letter, index) => (
              <motion.div
                key={index}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: value[index] ? 1 : 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  width: 10.5,
                  height: "100%",
                  backgroundColor: getLetterStatus(letter, index),
                  transformOrigin: "left",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Match status */}
        {value.length > 0 && (
          <div style={{
            fontSize: "10px", marginTop: 4,
            color: passwordsMatch ? "var(--gc-status-active)" : value.length >= passwordToMatch.length ? "var(--gc-status-terminated)" : "var(--gc-text-muted)",
            fontFamily: "var(--gc-font-body)",
          }}>
            {passwordsMatch ? "Passwords match" : value.length >= passwordToMatch.length ? "Passwords don't match" : `${value.length}/${passwordToMatch.length} characters`}
          </div>
        )}
      </div>
    );
  }
);

PasswordConfirmInput.displayName = "PasswordConfirmInput";

export default PasswordConfirmInput;
