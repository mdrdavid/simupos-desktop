"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import emailjs from "@emailjs/browser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import deleteAccount from "@/public/images/account-deletion.png";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(3, "Name should be at least 3 characters").max(50),
  email: z.string().email("Invalid email format"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 numbers")
    .max(15, "Phone must be at max 15 numbers")
    .nonempty("Phone Number is required"),
  reason: z
    .string()
    .min(10, "Reason should be at least 10 characters")
    .max(500, "Reason should not exceed 500 characters"),
  confirm: z.literal(true, {
    errorMap: () => ({ message: "You must confirm account deletion" }),
  }),
});

type FormData = z.infer<typeof schema>;

const DeleteAccountRequest: React.FC = () => {
  const form = useRef<HTMLFormElement | null>(null);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const sendEmail = async (data: FormData) => {
    setIsSubmitting(true);
    const templateParams = {
      to_name: "Account Support Team",
      from_name: data.name,
      from_email: data.email,
      phone_number: data.phone,
      reason: data.reason,
      request_type: "Account Deletion Request",
    };

    try {
      await emailjs.send(
        "YOUR_EMAILJS_SERVICE_ID", // Replace with your EmailJS service ID
        "YOUR_EMAILJS_TEMPLATE_ID", // Replace with your EmailJS template ID
        templateParams,
        "YOUR_EMAILJS_PUBLIC_KEY" // Replace with your EmailJS public key
      );

      setIsMessageSent(true);
      form.current?.reset();
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white items-center justify-center flex flex-col gap-5 md:flex-row md:gap-8 min-h-screen py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-red-600">
          Request Account Deletion
        </h1>

        {isMessageSent ? (
          <div className="text-center py-10">
            <div className="text-green-600 text-xl mb-4">
              Your account deletion request has been submitted successfully!
            </div>
            <p className="text-gray-600">
              Our support team will review your request and contact you shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-600">
              <p className="mb-4">
                We&apos;re sorry to see you go. Before proceeding, please note
                that:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Account deletion is permanent and cannot be undone</li>
                <li>
                  All your data will be permanently removed from our systems
                </li>
                <li>This process may take up to 30 days to complete</li>
                <li>You may be contacted for verification purposes</li>
              </ul>
            </div>

            <form
              ref={form}
              onSubmit={handleSubmit(sendEmail)}
              className="space-y-4"
            >
              <div>
                <label htmlFor="name" className="block mb-2 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  {...register("name")}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Your account email"
                  {...register("email")}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block mb-2 font-medium">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Phone number for verification"
                  {...register("phone")}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reason" className="block mb-2 font-medium">
                  Reason for Deletion (Optional but helpful)
                </label>
                <textarea
                  placeholder="Please tell us why you're deleting your account..."
                  rows={4}
                  {...register("reason")}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.reason
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.reason.message}
                  </p>
                )}
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="confirm"
                    type="checkbox"
                    {...register("confirm")}
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                  />
                </div>
                <label
                  htmlFor="confirm"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  I understand that this action is irreversible and all my data
                  will be permanently deleted.
                </label>
              </div>
              {errors.confirm && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirm.message}
                </p>
              )}

              <div className="flex justify-center mt-6">
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 px-6 py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Request Account Deletion"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>

      <div className="hidden md:block w-1/3 max-w-md">
        <Image
          src={deleteAccount}
          alt="Account deletion"
          width={500}
          height={500}
          className="rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default DeleteAccountRequest;
