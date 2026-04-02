"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2Icon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContactDialogContextValue = {
  openContact: () => void;
};

const ContactDialogContext = createContext<ContactDialogContextValue | null>(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTACT_DRAWER_LOGO = "/logos/Studio%20Finity%20Text%20Logo.png";

/** Middle section: grows under the header; min-h-0 so flex lets this shrink and scroll internally. */
const CONTACT_SCROLL_SECTION =
  "min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-pb-6 touch-auto touch-pan-y";

/** Success state: natural height (no flex-1) so the sheet can shrink with layout animation. */
const CONTACT_SUCCESS_SECTION = "shrink-0 overflow-x-hidden px-6 sm:px-8";

/** Footer sits below the scroll region (no overlap). */
const FOOTER_SHELL =
  "shrink-0 border-t border-border/40 bg-background px-6 pt-4 pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] sm:px-8 sm:pb-5 sm:pt-5";

const singleLineFieldClassName = cn(
  "box-border block h-12 max-h-12 w-full min-w-0 max-w-full shrink-0 break-words rounded-xl border bg-background px-4 py-0 text-[15px] leading-[2.75rem] text-foreground",
  "placeholder:text-muted-foreground/50",
  "outline-none transition-[border-color,box-shadow] duration-380 ease-sf-out",
  "focus-visible:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/35",
  "disabled:opacity-55",
);

const textareaFieldClassName = cn(
  "box-border block min-h-[7rem] w-full min-w-0 max-w-full max-h-[min(36vh,18rem)] resize-y break-words rounded-xl border bg-background px-4 py-3 text-[15px] leading-normal text-foreground sm:min-h-[8.75rem] sm:max-h-[min(40vh,20rem)]",
  "placeholder:text-muted-foreground/50",
  "outline-none transition-[border-color,box-shadow] duration-380 ease-sf-out",
  "focus-visible:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/35",
  "disabled:opacity-55",
);

/** Matches `ease-sf-out` / drawer timing tokens */
const easeSfOut = [0.16, 1, 0.3, 1] as const;
const CONTACT_SHEET_DURATION_S = 0.64;
const CONTACT_BACKDROP_DURATION_S = 0.56;
/** Form → success height change */
const CONTACT_LAYOUT_DURATION_S = 0.48;
/** Minimum time to show the sending state (avoids flash on fast responses). */
const CONTACT_SUBMIT_MIN_MS = 600;

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function useContactDialog(): ContactDialogContextValue {
  const ctx = useContext(ContactDialogContext);
  if (!ctx) {
    throw new Error("useContactDialog must be used within ContactDialogProvider");
  }
  return ctx;
}

export function ContactDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  /** Bump on each open so the sheet remounts with fresh form state (avoids reset-in-effect lint + cascades). */
  const [sheetKey, setSheetKey] = useState(0);
  const openContact = useCallback(() => {
    setSheetKey((k) => k + 1);
    setOpen(true);
  }, []);

  return (
    <ContactDialogContext.Provider value={{ openContact }}>
      {children}
      <ContactFormSheet key={sheetKey} open={open} onOpenChange={setOpen} />
    </ContactDialogContext.Provider>
  );
}

function ContactFormSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const successCloseRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const mounted = typeof document !== "undefined";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const submitAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) {
      submitAbortRef.current?.abort();
      submitAbortRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = document.activeElement;
    previousFocusRef.current = el instanceof HTMLElement ? el : null;
    return () => {
      previousFocusRef.current?.focus({ preventScroll: true });
      previousFocusRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = dialogRef.current;
    if (!root) return;

    const getFocusables = () =>
      [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
        (node) =>
          node.getAttribute("aria-hidden") !== "true" &&
          (node.offsetWidth > 0 || node.offsetHeight > 0 || node === document.activeElement),
      );

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || (active && !root.contains(active))) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [open, submitOk]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open || !submitOk) {
      return;
    }
    const step = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        successCloseRef.current?.focus();
      });
    });
    return () => cancelAnimationFrame(step);
  }, [open, submitOk]);

  useEffect(() => {
    if (!open || submitOk) {
      return;
    }
    const step = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    });
    return () => cancelAnimationFrame(step);
  }, [open, submitOk]);

  function focusFirstInvalidField(
    trimmedName: string,
    trimmedEmail: string,
    trimmedMessage: string,
  ) {
    const nameEmpty = trimmedName.length === 0;
    const emailEmpty = trimmedEmail.length === 0;
    const emailBad = trimmedEmail.length > 0 && !EMAIL_RE.test(trimmedEmail);
    const messageEmpty = trimmedMessage.length === 0;
    const messageShort =
      trimmedMessage.length > 0 && trimmedMessage.length < 10;

    requestAnimationFrame(() => {
      if (nameEmpty) {
        nameInputRef.current?.focus();
        return;
      }
      if (emailEmpty || emailBad) {
        emailRef.current?.focus();
        return;
      }
      if (messageEmpty || messageShort) {
        messageRef.current?.focus();
      }
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSubmitAttempted(true);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      focusFirstInvalidField(trimmedName, trimmedEmail, trimmedMessage);
      return;
    }

    if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) {
      focusFirstInvalidField(trimmedName, trimmedEmail, trimmedMessage);
      return;
    }

    if (!trimmedMessage || trimmedMessage.length < 10) {
      focusFirstInvalidField(trimmedName, trimmedEmail, trimmedMessage);
      return;
    }

    submitAbortRef.current?.abort();
    const controller = new AbortController();
    submitAbortRef.current = controller;
    const { signal } = controller;

    setIsSubmitting(true);
    const submitStartedAt = performance.now();

    async function waitSubmitMinDelay() {
      const elapsed = performance.now() - submitStartedAt;
      const remaining = CONTACT_SUBMIT_MIN_MS - elapsed;
      if (remaining <= 0) {
        return;
      }
      await new Promise<void>((resolve) => {
        const id = window.setTimeout(resolve, remaining);
        signal.addEventListener(
          "abort",
          () => {
            window.clearTimeout(id);
            resolve();
          },
          { once: true },
        );
      });
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
          website: honeypot,
        }),
        signal,
      });

      if (signal.aborted) {
        return;
      }

      const payload: unknown = await response.json().catch(() => ({}));
      const errorMessage =
        isRecord(payload) && typeof payload.error === "string"
          ? payload.error
          : "Something went wrong. Please try again.";

      await waitSubmitMinDelay();
      if (signal.aborted) {
        return;
      }

      if (!response.ok) {
        if (response.status === 413) {
          setFormError("That message is too long to send. Please shorten it and try again.");
        } else if (response.status === 429) {
          const retry =
            isRecord(payload) && typeof payload.retryAfterSec === "number"
              ? payload.retryAfterSec
              : null;
          setFormError(
            retry != null && retry > 0
              ? `Too many attempts. Please wait about ${retry} seconds before trying again.`
              : "Too many attempts. Please wait a few minutes before trying again.",
          );
        } else {
          setFormError(errorMessage);
        }
        setIsSubmitting(false);
        return;
      }

      setSubmitOk(true);
      setName("");
      setEmail("");
      setMessage("");
      setHoneypot("");
    } catch (err) {
      if (signal.aborted || (err instanceof DOMException && err.name === "AbortError")) {
        return;
      }
      await waitSubmitMinDelay();
      if (signal.aborted) {
        return;
      }
      setFormError("Network error. Check your connection and try again.");
    }

    if (!signal.aborted) {
      setIsSubmitting(false);
    }
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();
  const nameRequiredError = submitAttempted && trimmedName.length === 0;
  const emailRequiredError = submitAttempted && trimmedEmail.length === 0;
  const emailFormatError =
    !emailRequiredError &&
    trimmedEmail.length > 0 &&
    !EMAIL_RE.test(trimmedEmail) &&
    (submitAttempted || email.length > 0);
  const messageRequiredError = submitAttempted && trimmedMessage.length === 0;
  const messageLengthError =
    submitAttempted &&
    !messageRequiredError &&
    trimmedMessage.length > 0 &&
    trimmedMessage.length < 10;

  const nameHasError = nameRequiredError;
  const emailHasError = emailRequiredError || emailFormatError;
  const messageHasError = messageRequiredError || messageLengthError;

  const nameErrorText = nameRequiredError ? "Enter your name." : null;
  const emailErrorText = emailRequiredError
    ? "Enter your email address."
    : emailFormatError
      ? "Enter a valid email address."
      : null;
  const messageErrorText = messageRequiredError
    ? "Please enter a message."
    : messageLengthError
      ? "Add at least 10 characters."
      : null;

  const sheetTransition = reduceMotion
    ? { type: "tween" as const, duration: 0.01, ease: "linear" as const }
    : { type: "tween" as const, duration: CONTACT_SHEET_DURATION_S, ease: easeSfOut };

  const backdropTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: CONTACT_BACKDROP_DURATION_S, ease: easeSfOut };

  const layoutTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: CONTACT_LAYOUT_DURATION_S, ease: easeSfOut };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence mode="sync">
      {open ? (
        <>
          <motion.div
            key="contact-backdrop"
            role="presentation"
            aria-hidden
            className="fixed inset-0 z-280 cursor-default touch-manipulation bg-black/32 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onPointerDown={() => {
              onOpenChange(false);
            }}
          />
          <motion.div
            key="contact-sheet"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-281 flex max-h-[min(88dvh,calc(100dvh-2.5rem))] justify-center px-0 pt-10 outline-none sm:px-4"
            initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            transition={sheetTransition}
          >
            <motion.div
              layout
              transition={{ layout: layoutTransition }}
              className="pointer-events-auto relative flex w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-t-2xl border border-border/40 border-b-0 bg-background shadow-(--sf-shadow-sheet-up)"
            >
              <div
                className="flex shrink-0 touch-none justify-center pt-2 pb-1 sm:pt-2.5 sm:pb-1.5"
                aria-hidden
              >
                <div className="h-1 w-12 shrink-0 rounded-full bg-border/90" />
              </div>

              <div className="mx-auto flex max-h-[min(88dvh,calc(100dvh-2.5rem))] w-full min-h-0 max-w-lg flex-col">
                <p id={titleId} className="sr-only">
                  Contact Studio Finity
                </p>
                <p id={descriptionId} className="sr-only">
                  Send a message and we will reply by email.
                </p>

                <div className="shrink-0 px-6 pb-0 pt-4 sm:px-8 sm:pt-5">
                  <div className="flex justify-center pb-5 sm:pb-6">
                    <Image
                      src={CONTACT_DRAWER_LOGO}
                      alt="Studio Finity"
                      width={240}
                      height={42}
                      className="h-[18px] w-auto max-w-[200px] object-contain sm:h-5"
                      priority
                    />
                  </div>
                </div>

                {submitOk ? (
                  <>
                    <div className={CONTACT_SUCCESS_SECTION}>
                      <div className="py-8 sm:py-9">
                        <p className="sf-body-copy max-w-prose text-pretty text-[15px] leading-relaxed text-foreground">
                          Thanks — your message is in our inbox. We&apos;ll reply by email soon.
                        </p>
                      </div>
                    </div>
                    <div className={FOOTER_SHELL}>
                      <div className="flex justify-center">
                        <Button
                          ref={successCloseRef}
                          type="button"
                          size="lg"
                          variant="default"
                          className="h-12 w-full min-w-0 rounded-full sm:h-12 sm:max-w-md sm:px-8"
                          onClick={() => onOpenChange(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={cn(CONTACT_SCROLL_SECTION, "px-6 sm:px-8")}>
                      <form
                        className="relative space-y-6 pb-4 sm:space-y-6"
                        onSubmit={onSubmit}
                        id="studio-contact-form"
                        noValidate
                        autoComplete="on"
                      >
                        <div className="flex flex-col gap-3">
                          <label
                            htmlFor="contact-name"
                            className="sf-caption block text-muted-foreground"
                          >
                            Name
                          </label>
                          <div className="flex flex-col gap-1.5">
                            <input
                              ref={(el) => {
                                nameInputRef.current = el;
                              }}
                              id="contact-name"
                              name="name"
                              type="text"
                              autoComplete="section-studio-contact name"
                              required
                              maxLength={120}
                              disabled={isSubmitting}
                              value={name}
                              onChange={(e) => {
                                setName(e.target.value);
                                setFormError(null);
                              }}
                              aria-invalid={nameHasError}
                              aria-describedby={
                                nameErrorText ? "contact-name-error" : undefined
                              }
                              className={cn(
                                singleLineFieldClassName,
                                nameHasError ? "border-destructive" : "border-border/90",
                              )}
                            />
                            {nameErrorText ? (
                              <p
                                id="contact-name-error"
                                className="sf-caption mt-1.5 text-destructive"
                                role="alert"
                                aria-live="polite"
                              >
                                {nameErrorText}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <label
                            htmlFor="contact-email"
                            className="sf-caption block text-muted-foreground"
                          >
                            Email
                          </label>
                          <div className="flex flex-col gap-1.5">
                            <input
                              ref={(el) => {
                                emailRef.current = el;
                              }}
                              id="contact-email"
                              name="email"
                              type="email"
                              inputMode="email"
                              autoComplete="section-studio-contact email"
                              required
                              maxLength={254}
                              disabled={isSubmitting}
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                setFormError(null);
                              }}
                              aria-invalid={emailHasError}
                              aria-describedby={
                                emailErrorText ? "contact-email-error" : undefined
                              }
                              className={cn(
                                singleLineFieldClassName,
                                emailHasError ? "border-destructive" : "border-border/90",
                              )}
                            />
                            {emailErrorText ? (
                              <p
                                id="contact-email-error"
                                className="sf-caption mt-1.5 text-destructive"
                                role="alert"
                                aria-live="polite"
                              >
                                {emailErrorText}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <label
                            htmlFor="contact-message"
                            className="sf-caption block text-muted-foreground"
                          >
                            Message
                          </label>
                          <div className="flex flex-col gap-1.5">
                            <textarea
                              ref={(el) => {
                                messageRef.current = el;
                              }}
                              id="contact-message"
                              name="message"
                              rows={5}
                              required
                              maxLength={8000}
                              disabled={isSubmitting}
                              value={message}
                              onChange={(e) => {
                                setMessage(e.target.value);
                                setFormError(null);
                              }}
                              aria-invalid={messageHasError}
                              aria-describedby={
                                messageErrorText ? "contact-message-error" : undefined
                              }
                              className={cn(
                                textareaFieldClassName,
                                messageHasError
                                  ? "border-destructive"
                                  : "border-border/90",
                              )}
                            />
                            {messageErrorText ? (
                              <p
                                id="contact-message-error"
                                className="sf-caption mt-1.5 text-destructive"
                                role="alert"
                                aria-live="polite"
                              >
                                {messageErrorText}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <input
                          id="contact-website"
                          name="website"
                          type="text"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                          aria-hidden
                          className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
                        />

                        {formError ? (
                          <div
                            className="rounded-lg border border-destructive/35 bg-destructive/5 px-3 py-2.5"
                            role="alert"
                            aria-live="polite"
                          >
                            <p className="sf-caption text-destructive">{formError}</p>
                          </div>
                        ) : null}
                      </form>
                    </div>

                    <div className={FOOTER_SHELL}>
                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-3">
                        <Button
                          type="submit"
                          form="studio-contact-form"
                          size="lg"
                          variant="default"
                          aria-busy={isSubmitting}
                          className={cn(
                            "h-12 w-full min-w-0 rounded-full sm:h-12 sm:flex-1 sm:px-4",
                            "inline-flex items-center justify-center gap-2",
                            isSubmitting && "motion-safe:opacity-[0.88]",
                          )}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2Icon
                                className="size-4 shrink-0 motion-safe:animate-spin motion-reduce:animate-none"
                                aria-hidden
                              />
                              <span>Sending…</span>
                            </>
                          ) : (
                            "Send message"
                          )}
                        </Button>
                        <button
                          type="button"
                          className={cn(
                            buttonVariants({ variant: "outline", size: "lg" }),
                            "h-12 w-full min-w-0 rounded-full bg-background sm:h-12 sm:flex-1 sm:px-4",
                          )}
                          disabled={isSubmitting}
                          onClick={() => onOpenChange(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
