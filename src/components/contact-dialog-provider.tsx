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
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerPopup } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type ContactDialogContextValue = {
  openContact: () => void;
};

const ContactDialogContext = createContext<ContactDialogContextValue | null>(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTACT_DRAWER_LOGO = "/logos/Studio%20Finity%20Text%20Logo.png";

/** Scroll viewport: fixed height so validation / API errors only scroll inside — sheet shell does not resize. */
const FORM_SCROLL_BOX =
  "h-[clamp(17.5rem,46dvh,26rem)] min-h-[17.5rem] w-full shrink-0 touch-auto overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y";

/** Footer: fixed block height so two-button vs one-button never changes sheet geometry. */
const FOOTER_SHELL =
  "flex h-[10.5rem] shrink-0 flex-col justify-end border-t border-border/40 bg-muted/25 pt-6 sm:h-[7.5rem] sm:pt-7";

const singleLineFieldClassName = cn(
  "box-border block h-12 max-h-12 w-full min-w-0 max-w-full shrink-0 break-words rounded-xl border bg-background px-4 py-0 text-[15px] leading-[2.75rem] text-foreground",
  "placeholder:text-muted-foreground/50",
  "outline-none transition-[border-color,box-shadow] duration-380 ease-sf-out",
  "focus-visible:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/35",
  "disabled:opacity-55",
);

const textareaFieldClassName = cn(
  "box-border block min-h-[8.75rem] w-full min-w-0 max-w-full max-h-[min(40vh,20rem)] resize-y break-words rounded-xl border bg-background px-4 py-3 text-[15px] leading-normal text-foreground",
  "placeholder:text-muted-foreground/50",
  "outline-none transition-[border-color,box-shadow] duration-380 ease-sf-out",
  "focus-visible:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/35",
  "disabled:opacity-55",
);

export function useContactDialog(): ContactDialogContextValue {
  const ctx = useContext(ContactDialogContext);
  if (!ctx) {
    throw new Error("useContactDialog must be used within ContactDialogProvider");
  }
  return ctx;
}

export function ContactDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [sheetEpoch, setSheetEpoch] = useState(0);
  const openContact = useCallback(() => {
    setSheetEpoch((e) => e + 1);
    setOpen(true);
  }, []);

  return (
    <ContactDialogContext.Provider value={{ openContact }}>
      {children}
      <ContactFormSheet key={sheetEpoch} open={open} onOpenChange={setOpen} />
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
  const titleId = useId();
  const descriptionId = useId();
  const successCloseRef = useRef<HTMLButtonElement | null>(null);
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
    if (!open || !submitOk) {
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        successCloseRef.current?.focus();
      });
    });
    return () => cancelAnimationFrame(id);
  }, [open, submitOk]);

  useEffect(() => {
    if (!open || submitOk) {
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    });
    return () => cancelAnimationFrame(id);
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange} position="bottom" modal>
      <DrawerPopup
        showBar
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "bg-background! text-foreground! border-border/40 shadow-(--sf-shadow-sheet-up)",
          "before:rounded-t-[calc(var(--radius-2xl)-1px)]!",
          "after:bg-background!",
        )}
      >
        <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col">
          <div className="relative flex w-full flex-col overflow-hidden">
            <p id={titleId} className="sr-only">
              Contact Studio Finity
            </p>
            <p id={descriptionId} className="sr-only">
              Send a message and we will reply by email.
            </p>

            <div className="mx-auto w-full min-w-0 max-w-lg shrink-0 px-6 pb-0 pt-3 sm:px-8 sm:pt-4">
              <div className="flex justify-center pb-6 sm:pb-8">
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
                <div className={cn(FORM_SCROLL_BOX, "px-6 sm:px-8")}>
                  <div className="flex h-full min-h-0 flex-col items-center justify-center text-center sm:items-start sm:text-left">
                    <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-foreground/6">
                      <CheckCircle2Icon
                        className="size-7 text-foreground"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </span>
                    <p className="sf-eyebrow text-muted-foreground">Sent</p>
                    <p className="sf-body-copy mt-3 max-w-prose text-pretty text-[15px] leading-relaxed text-foreground">
                      Thanks — your message is in our inbox. We&apos;ll reply by email soon.
                    </p>
                  </div>
                </div>
                <div className={FOOTER_SHELL}>
                  <div className="mx-auto w-full max-w-lg px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1 sm:px-8 sm:pb-9 sm:pt-2">
                    <div className="flex justify-center">
                      <DrawerClose
                        ref={successCloseRef}
                        type="button"
                        className={cn(
                          buttonVariants({ variant: "default", size: "lg" }),
                          "h-12 w-full min-w-0 rounded-full sm:h-12 sm:max-w-md sm:px-8",
                        )}
                      >
                        Close
                      </DrawerClose>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={cn(FORM_SCROLL_BOX, "px-6 sm:px-8")}>
                  <form
                    className="relative space-y-8 pb-6 sm:space-y-8 sm:pb-7"
                    onSubmit={onSubmit}
                    id="studio-contact-form"
                    noValidate
                    data-lpignore="true"
                    data-1p-ignore=""
                  >
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
                              autoComplete="name"
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
                            <div
                              className="min-h-5.5"
                              aria-live="polite"
                            >
                              {nameErrorText ? (
                                <p
                                  id="contact-name-error"
                                  className="sf-caption text-destructive"
                                  role="alert"
                                >
                                  {nameErrorText}
                                </p>
                              ) : null}
                            </div>
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
                              autoComplete="email"
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
                            <div
                              className="min-h-5.5"
                              aria-live="polite"
                            >
                              {emailErrorText ? (
                                <p
                                  id="contact-email-error"
                                  className="sf-caption text-destructive"
                                  role="alert"
                                >
                                  {emailErrorText}
                                </p>
                              ) : null}
                            </div>
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
                            <div
                              className="min-h-5.5"
                              aria-live="polite"
                            >
                              {messageErrorText ? (
                                <p
                                  id="contact-message-error"
                                  className="sf-caption text-destructive"
                                  role="alert"
                                >
                                  {messageErrorText}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="min-h-15">
                          {formError ? (
                            <div
                              className="rounded-lg border border-destructive/35 bg-destructive/5 px-3 py-2.5"
                              role="alert"
                              aria-live="polite"
                            >
                              <p className="sf-caption text-destructive">{formError}</p>
                            </div>
                          ) : null}
                        </div>
                      </form>
                    </div>

                    <div className={FOOTER_SHELL}>
                      <div className="mx-auto w-full max-w-lg px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1 sm:px-8 sm:pb-9 sm:pt-2">
                        <div className="flex flex-col-reverse gap-3.5 sm:flex-row sm:gap-4">
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
                          <DrawerClose
                            type="button"
                            className={cn(
                              buttonVariants({ variant: "outline", size: "lg" }),
                              "h-12 w-full min-w-0 rounded-full bg-background sm:h-12 sm:flex-1 sm:px-4",
                            )}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </DrawerClose>
                        </div>
                      </div>
                    </div>
              </>
            )}
          </div>
        </div>
      </DrawerPopup>
    </Drawer>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
