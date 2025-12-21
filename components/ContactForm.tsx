"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Send, CheckCircle, Loader2 } from "lucide-react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { translations } from "@/constants/translations"

const formSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    nationality: z.string().min(2),
    message: z.string().min(10),
})

interface ContactFormProps {
    language?: string
}

export default function ContactForm({ language = "EN" }: ContactFormProps) {
    const t = translations[language as keyof typeof translations].contact.form
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            nationality: "",
            message: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            await addDoc(collection(db, "messages"), {
                ...values,
                timestamp: new Date(),
            })

            setIsSuccess(true)
            toast.success(t.success)
            form.reset()
        } catch (error) {
            console.error("Error adding document: ", error)
            toast.error(t.error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold">{t.success}</h3>
                <p className="text-muted-foreground max-w-[600px]">
                    Thank you for reaching out! We've received your message and will get back to you shortly.
                </p>
                <Button
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                    className="mt-4"
                >
                    Send another message
                </Button>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-black">{t.name}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t.namePlaceholder} {...field} className="bg-white border-zinc-200" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-black">{t.email}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t.emailPlaceholder} {...field} className="bg-white border-zinc-200" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-black">{t.nationality}</FormLabel>
                            <FormControl>
                                <Input placeholder={t.nationalityPlaceholder} {...field} className="bg-white border-zinc-200" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-black">{t.message}</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={t.messagePlaceholder}
                                    {...field}
                                    rows={5}
                                    className="bg-white border-zinc-200 resize-none"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" /> {t.send}
                        </>
                    )}
                </Button>
            </form>
        </Form>
    )
}
