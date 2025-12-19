"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Send } from "lucide-react"

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
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (response.ok) {
                toast.success(t.success)
                form.reset()
            } else {
                toast.error(t.error)
            }
        } catch (error) {
            toast.error(t.errGeneral)
        }
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
                                <FormLabel className="text-foreground">{t.name}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t.namePlaceholder} {...field} className="bg-background border-zinc-200 dark:border-zinc-800" />
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
                                <FormLabel className="text-foreground">{t.email}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t.emailPlaceholder} {...field} className="bg-background border-zinc-200 dark:border-zinc-800" />
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
                            <FormLabel className="text-foreground">{t.nationality}</FormLabel>
                            <FormControl>
                                <Input placeholder={t.nationalityPlaceholder} {...field} className="bg-background border-zinc-200 dark:border-zinc-800" />
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
                            <FormLabel className="text-foreground">{t.message}</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={t.messagePlaceholder}
                                    {...field}
                                    rows={5}
                                    className="bg-background border-zinc-200 dark:border-zinc-800 resize-none"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12">
                    <Send className="mr-2 h-4 w-4" /> {t.send}
                </Button>
            </form>
        </Form>
    )
}
