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
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500 font-serif">
                <div className="w-16 h-16 rounded-none bg-slate-900 flex items-center justify-center text-white">
                    <CheckCircle className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900">{t.success}</h3>
                    <p className="text-slate-500 font-light max-w-[400px] leading-relaxed">
                        Your inquiry has been successfully transmitted to our coordination department. A representative will contact you shortly.
                    </p>
                </div>
                <Button
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                    className="mt-4 rounded-none border-slate-200 text-[10px] uppercase tracking-widest font-black transition-all hover:bg-slate-900 hover:text-white"
                >
                    Submit Additional Inquiry
                </Button>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400">{t.name}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t.namePlaceholder} {...field} className="bg-white border-slate-100 rounded-none focus-visible:ring-slate-900 h-11 text-sm italic" />
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
                                <FormLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400">{t.email}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t.emailPlaceholder} {...field} className="bg-white border-slate-100 rounded-none focus-visible:ring-slate-900 h-11 text-sm italic" />
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
                            <FormLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400">{t.nationality}</FormLabel>
                            <FormControl>
                                <Input placeholder={t.nationalityPlaceholder} {...field} className="bg-white border-slate-100 rounded-none focus-visible:ring-slate-900 h-11 text-sm italic" />
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
                            <FormLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400">{t.message}</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={t.messagePlaceholder}
                                    {...field}
                                    rows={5}
                                    className="bg-white border-slate-100 rounded-none focus-visible:ring-slate-900 resize-none text-sm italic"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black rounded-none h-14 text-[10px] uppercase tracking-[0.3em] transition-all"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Transmitting...
                        </>
                    ) : (
                        <>
                            <Send className="mr-3 h-4 w-4" /> {t.send}
                        </>
                    )}
                </Button>
            </form>
        </Form>
    )
}
