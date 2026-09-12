"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, MessageSquare, HelpCircle } from "lucide-react";
import { FieldError } from "@/components/ui/field-error";
import { validateEmail } from "@/lib/validation";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: typeof fieldErrors = {};

    if (!name.trim()) {
      errors.name = "Please enter your name";
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      errors.email = emailErr;
    }

    if (!message.trim()) {
      errors.message = "Please enter your message";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 space-y-8">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="text-primary border-primary/30">
          WE ARE HERE TO HELP
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Contact Us</h1>
        <p className="text-sm text-muted-foreground">
          Have an inquiry about partnerships, enterprise offers, or account support?
        </p>
      </div>

      <Card className="border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Send a Message</CardTitle>
          <CardDescription className="text-xs">
            For authenticated members, please create a ticket in the <Link href="/support" className="text-primary underline">Support Desk</Link> for fastest response.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">Message Received!</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Thank you, {name}. Our support team will review your message and reply to {email} within 24 business hours.
              </p>
              <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold">Your Name</Label>
                  <Input
                    id="name"
                    hasError={!!fieldErrors.name}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Alex Smith"
                    className="h-10 text-sm"
                  />
                  <FieldError message={fieldErrors.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    hasError={!!fieldErrors.email}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="alex@example.com"
                    className="h-10 text-sm"
                  />
                  <FieldError message={fieldErrors.email} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-semibold">Message</Label>
                <Textarea
                  id="message"
                  hasError={!!fieldErrors.message}
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (fieldErrors.message) setFieldErrors((prev) => ({ ...prev, message: undefined }));
                  }}
                  placeholder="How can our rewards team assist you today?"
                  className="text-sm"
                />
                <FieldError message={fieldErrors.message} />
              </div>

              <Button type="submit" className="w-full font-bold">
                Send Message
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
