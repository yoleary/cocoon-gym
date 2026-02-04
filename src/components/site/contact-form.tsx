"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, Send } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  goal: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  goal?: string;
  message?: string;
}

const goals = [
  { value: "weight-loss", label: "Weight Loss" },
  { value: "muscle-gain", label: "Muscle Gain" },
  { value: "general-fitness", label: "General Fitness" },
  { value: "injury-recovery", label: "Injury Recovery" },
  { value: "sport-performance", label: "Sport Performance" },
] as const;

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required.";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (data.phone && !/^[+\d\s()-]{7,20}$/.test(data.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!data.goal) {
    errors.goal = "Please select a goal.";
  }

  if (!data.message.trim()) {
    errors.message = "Message is required.";
  } else if (data.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    goal: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Simulate API call - replace with actual server action
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch {
      setErrors({ message: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-8 text-center sm:p-12">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Thank You!
            </h2>
            <p className="mt-2 text-muted-foreground">
              We have received your enquiry and will be in touch within 24
              hours. Check your email for a confirmation.
            </p>
            <Button
              className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  goal: "",
                  message: "",
                });
              }}
            >
              Send Another Message
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 sm:py-32" id="contact-form">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Section header */}
          <div className="mb-12 text-center">
            <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Get Started
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to Begin?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Fill out the form below and one of our coaches will reach out to
              discuss your goals and find the right programme for you.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-xl border border-border bg-card p-6 sm:p-8"
          >
            <div className="grid gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="contact-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact-name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p id="contact-name-error" className="text-sm text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email & Phone row */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="contact-email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="text-sm text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+31 6 1234 5678"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p id="contact-phone-error" className="text-sm text-destructive">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <Label htmlFor="contact-goal">
                  Goal <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.goal}
                  onValueChange={(value) => handleChange("goal", value)}
                >
                  <SelectTrigger
                    id="contact-goal"
                    aria-invalid={!!errors.goal}
                    aria-describedby={errors.goal ? "contact-goal-error" : undefined}
                    className={errors.goal ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select your primary goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal.value} value={goal.value}>
                        {goal.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.goal && (
                  <p id="contact-goal-error" className="text-sm text-destructive">
                    {errors.goal}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="contact-message">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="contact-message"
                  placeholder="Tell us about your fitness background, goals, and any questions you have..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  className={errors.message ? "border-destructive" : ""}
                />
                {errors.message && (
                  <p id="contact-message-error" className="text-sm text-destructive">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-base font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Enquiry
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
